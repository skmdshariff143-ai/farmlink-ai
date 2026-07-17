import { vi, describe, it, expect, beforeEach } from "vitest";
import { PaymentFintechService, isDemoMode } from "@/services/payment.services";
import { prisma } from "@/lib/prisma";
import { POST as initiatePOST } from "./initiate/route";
import { POST as webhookPOST } from "./webhook/route";
import crypto from "crypto";

vi.mock("next-auth", () => ({
  getServerSession: vi.fn(() => Promise.resolve({
    user: {
      id: "admin-user-id",
      role: "ADMIN"
    }
  }))
}));

const mockTx = {
  order: {
    findUnique: vi.fn(),
    updateMany: vi.fn(),
    update: vi.fn()
  },
  user: {
    findUnique: vi.fn(),
    update: vi.fn()
  },
  transaction: {
    create: vi.fn()
  },
  orderItem: {
    create: vi.fn()
  },
  cropListing: {
    findUnique: vi.fn(),
    update: vi.fn()
  },
  payment: {
    create: vi.fn(),
    update: vi.fn()
  },
  orderDispute: {
    create: vi.fn(),
    update: vi.fn(),
    findUnique: vi.fn()
  }
};

vi.mock("@/lib/prisma", () => {
  return {
    prisma: {
      $transaction: vi.fn((callback) => callback(mockTx)),
      order: {
        findUnique: vi.fn(),
        updateMany: vi.fn(),
        update: vi.fn()
      },
      user: {
        findUnique: vi.fn(),
        update: vi.fn()
      },
      transaction: {
        create: vi.fn()
      },
      payment: {
        create: vi.fn(),
        update: vi.fn(),
        findFirst: vi.fn()
      },
      orderDispute: {
        create: vi.fn(),
        update: vi.fn(),
        findUnique: vi.fn()
      }
    }
  };
});

describe("Escrow & Payment System Checks", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should fail when releasing escrow on a non-DELIVERED order", async () => {
    mockTx.order.findUnique.mockResolvedValueOnce({
      id: "order-1",
      paymentStatus: "Paid",
      escrowReleased: false,
      status: "PENDING",
      items: []
    });

    await expect(
      PaymentFintechService.releaseEscrowPayout("order-1", "admin-user-id")
    ).rejects.toThrow("Cannot release escrow for orders that are not delivered");
  });

  it("should release escrow successfully for a DELIVERED order", async () => {
    mockTx.order.findUnique.mockResolvedValueOnce({
      id: "order-2",
      paymentStatus: "Paid",
      escrowReleased: false,
      status: "DELIVERED",
      buyerId: "buyer-1",
      items: [
        {
          price: 100,
          quantity: 2,
          listing: { farmerId: "farmer-1" }
        }
      ]
    });

    mockTx.order.updateMany.mockResolvedValueOnce({ count: 1 });
    mockTx.user.findUnique.mockResolvedValueOnce({ id: "farmer-1", walletBalance: 500 });

    const result = await PaymentFintechService.releaseEscrowPayout("order-2", "admin-user-id");
    expect(result.success).toBe(true);
    expect(mockTx.user.update).toHaveBeenCalledWith(expect.objectContaining({
      where: { id: "farmer-1" },
      data: { walletBalance: 700 }
    }));
  });

  it("should block concurrent release payouts on the same order", async () => {
    mockTx.order.findUnique.mockResolvedValue({
      id: "order-3",
      paymentStatus: "Paid",
      escrowReleased: false,
      status: "DELIVERED",
      buyerId: "buyer-1",
      items: [
        {
          price: 100,
          quantity: 2,
          listing: { farmerId: "farmer-1" }
        }
      ]
    });

    mockTx.user.findUnique.mockResolvedValue({ id: "farmer-1", walletBalance: 500 });
    
    // First update succeeds, second update returns count: 0 (concurrency conflict)
    mockTx.order.updateMany
      .mockResolvedValueOnce({ count: 1 })
      .mockResolvedValueOnce({ count: 0 });

    const results = await Promise.allSettled([
      PaymentFintechService.releaseEscrowPayout("order-3", "admin-user-id"),
      PaymentFintechService.releaseEscrowPayout("order-3", "admin-user-id")
    ]);

    expect(results[0].status).toBe("fulfilled");
    expect(results[1].status).toBe("rejected");
    if (results[1].status === "rejected") {
      expect(results[1].reason.message).toContain("AlreadyProcessed");
    }

    // Farmer balance update should have run only once
    expect(mockTx.user.update).toHaveBeenCalledTimes(1);
    expect(mockTx.transaction.create).toHaveBeenCalledTimes(1);
  });

  it("should block concurrent release + refund operations", async () => {
    mockTx.order.findUnique.mockResolvedValue({
      id: "order-4",
      paymentStatus: "Paid",
      escrowReleased: false,
      status: "DELIVERED",
      buyerId: "buyer-1",
      total: 200,
      items: [
        {
          price: 100,
          quantity: 2,
          listing: { farmerId: "farmer-1" }
        }
      ]
    });

    mockTx.user.findUnique.mockResolvedValue({ id: "farmer-1", walletBalance: 500 });
    
    // Release update succeeds, refund update fails (count: 0)
    mockTx.order.updateMany
      .mockResolvedValueOnce({ count: 1 })
      .mockResolvedValueOnce({ count: 0 });

    const results = await Promise.allSettled([
      PaymentFintechService.releaseEscrowPayout("order-4", "admin-user-id"),
      PaymentFintechService.executeOrderRefund("order-4", "admin-user-id")
    ]);

    expect(results[0].status).toBe("fulfilled");
    expect(results[1].status).toBe("rejected");
    if (results[1].status === "rejected") {
      expect(results[1].reason.message).toContain("AlreadyProcessed");
    }
  });

  it("should reject payment initiation if client amount does not match order total", async () => {
    // Mock the findUnique inside the initiate route
    (prisma.order.findUnique as any).mockResolvedValueOnce({
      id: "order-5",
      total: 1500
    });

    const request = new Request("http://localhost/api/payments/initiate", {
      method: "POST",
      body: JSON.stringify({
        orderId: "e9df7f29-23c2-4a0b-9c2b-e10b2f3a4b5c",
        paymentMethod: "Farmlink Wallet",
        amount: 1000 // Tampered amount
      })
    });

    const response = await initiatePOST(request);
    const json = await response.json();

    expect(response.status).toBe(400);
    expect(json.success).toBe(false);
    expect(json.error).toContain("Payment amount does not match order total");
  });

  it("should update order status to CANCELLED on successful refund", async () => {
    mockTx.order.findUnique.mockResolvedValueOnce({
      id: "order-6",
      buyerId: "buyer-2",
      total: 800,
      paymentStatus: "Paid",
      escrowReleased: false,
      status: "CONFIRMED"
    });

    mockTx.order.updateMany.mockResolvedValueOnce({ count: 1 });
    mockTx.user.findUnique.mockResolvedValueOnce({ id: "buyer-2", walletBalance: 100 });

    const result = await PaymentFintechService.executeOrderRefund("order-6", "admin-user-id");
    expect(result.success).toBe(true);

    // Verify status was changed to CANCELLED and paymentStatus to Refunded
    expect(mockTx.order.updateMany).toHaveBeenCalledWith(expect.objectContaining({
      where: { id: "order-6", escrowReleased: false, paymentStatus: "Paid", disputed: false },
      data: { paymentStatus: "Refunded", status: "CANCELLED" }
    }));
  });

  describe("Dispute Lifecycle Tests", () => {
    it("should fail when releasing escrow or refunding a disputed order", async () => {
      mockTx.order.findUnique.mockResolvedValue({
        id: "order-disputed",
        paymentStatus: "Paid",
        escrowReleased: false,
        status: "DELIVERED",
        disputed: true
      });

      await expect(
        PaymentFintechService.releaseEscrowPayout("order-disputed", "admin-user-id")
      ).rejects.toThrow("Cannot release escrow for disputed orders");

      await expect(
        PaymentFintechService.executeOrderRefund("order-disputed", "admin-user-id")
      ).rejects.toThrow("Cannot refund disputed orders");
    });

    it("should raise a dispute successfully", async () => {
      mockTx.order.findUnique.mockResolvedValueOnce({
        id: "order-to-dispute",
        paymentStatus: "Paid",
        escrowReleased: false,
        disputed: false
      });

      mockTx.order.updateMany.mockResolvedValueOnce({ count: 1 });
      mockTx.orderDispute.create.mockResolvedValueOnce({ id: "dispute-1", status: "OPEN" });

      const result = await PaymentFintechService.raiseDispute(
        "order-to-dispute",
        "buyer-1",
        "BUYER",
        "Quality Issues",
        "Crops were damaged upon arrival"
      );

      expect(result.success).toBe(true);
      expect(mockTx.order.updateMany).toHaveBeenCalledWith(expect.objectContaining({
        where: { id: "order-to-dispute", disputed: false, escrowReleased: false, paymentStatus: "Paid" },
        data: { disputed: true }
      }));
      expect(mockTx.orderDispute.create).toHaveBeenCalledWith(expect.objectContaining({
        data: {
          orderId: "order-to-dispute",
          raisedById: "buyer-1",
          raisedByRole: "BUYER",
          reason: "Quality Issues",
          description: "Crops were damaged upon arrival",
          status: "OPEN"
        }
      }));
    });

    it("should resolve a dispute as RESOLVED_RELEASE (escrow paid out to farmer)", async () => {
      mockTx.order.findUnique.mockResolvedValueOnce({
        id: "order-dispute-release",
        buyerId: "buyer-1",
        total: 1000,
        disputed: true,
        escrowReleased: false,
        items: [
          {
            price: 500,
            quantity: 2,
            listing: { farmerId: "farmer-1" }
          }
        ]
      });

      mockTx.orderDispute.findUnique.mockResolvedValueOnce({
        orderId: "order-dispute-release",
        status: "OPEN"
      });

      mockTx.order.updateMany.mockResolvedValueOnce({ count: 1 });
      mockTx.user.findUnique.mockResolvedValueOnce({ id: "farmer-1", walletBalance: 100 });

      const result = await PaymentFintechService.resolveDispute(
        "order-dispute-release",
        "admin-1",
        "RESOLVED_RELEASE",
        "Crops were inspected and verified healthy"
      );

      expect(result.success).toBe(true);
      expect(mockTx.order.updateMany).toHaveBeenCalledWith(expect.objectContaining({
        where: { id: "order-dispute-release", disputed: true, escrowReleased: false },
        data: { disputed: false, escrowReleased: true }
      }));
      expect(mockTx.orderDispute.update).toHaveBeenCalledWith(expect.objectContaining({
        where: { orderId: "order-dispute-release" },
        data: { status: "RESOLVED_RELEASE", resolvedById: "admin-1", resolutionNotes: "Crops were inspected and verified healthy" }
      }));
      expect(mockTx.user.update).toHaveBeenCalledWith(expect.objectContaining({
        where: { id: "farmer-1" },
        data: { walletBalance: 1100 }
      }));
    });

    it("should resolve a dispute as RESOLVED_REFUND (refunded to buyer)", async () => {
      mockTx.order.findUnique.mockResolvedValueOnce({
        id: "order-dispute-refund",
        buyerId: "buyer-1",
        total: 1000,
        disputed: true,
        paymentStatus: "Paid",
        items: []
      });

      mockTx.orderDispute.findUnique.mockResolvedValueOnce({
        orderId: "order-dispute-refund",
        status: "OPEN"
      });

      mockTx.order.updateMany.mockResolvedValueOnce({ count: 1 });
      mockTx.user.findUnique.mockResolvedValueOnce({ id: "buyer-1", walletBalance: 100 });

      const result = await PaymentFintechService.resolveDispute(
        "order-dispute-refund",
        "admin-1",
        "RESOLVED_REFUND",
        "Damaged shipment confirmed by inspector"
      );

      expect(result.success).toBe(true);
      expect(mockTx.order.updateMany).toHaveBeenCalledWith(expect.objectContaining({
        where: { id: "order-dispute-refund", disputed: true, paymentStatus: "Paid" },
        data: { disputed: false, paymentStatus: "Refunded", status: "CANCELLED" }
      }));
      expect(mockTx.user.update).toHaveBeenCalledWith(expect.objectContaining({
        where: { id: "buyer-1" },
        data: { walletBalance: 1100 }
      }));
    });

    it("should resolve a dispute as RESOLVED_SPLIT (proportionally paid to farmer and buyer)", async () => {
      mockTx.order.findUnique.mockResolvedValueOnce({
        id: "order-dispute-split",
        buyerId: "buyer-1",
        total: 1000,
        disputed: true,
        escrowReleased: false,
        paymentStatus: "Paid",
        items: [
          {
            price: 500,
            quantity: 2,
            listing: { farmerId: "farmer-1" }
          }
        ]
      });

      mockTx.orderDispute.findUnique.mockResolvedValueOnce({
        orderId: "order-dispute-split",
        status: "OPEN"
      });

      mockTx.order.updateMany.mockResolvedValueOnce({ count: 1 });
      mockTx.user.findUnique
        .mockResolvedValueOnce({ id: "farmer-1", walletBalance: 100 }) // Farmer findUnique
        .mockResolvedValueOnce({ id: "buyer-1", walletBalance: 100 }); // Buyer findUnique

      const result = await PaymentFintechService.resolveDispute(
        "order-dispute-split",
        "admin-1",
        "RESOLVED_SPLIT",
        "Partial damage agreed: 60% farmer, 40% buyer",
        600, // split farmer amount
        400  // split buyer amount
      );

      expect(result.success).toBe(true);
      expect(mockTx.order.updateMany).toHaveBeenCalledWith(expect.objectContaining({
        where: { id: "order-dispute-split", disputed: true, escrowReleased: false, paymentStatus: "Paid" },
        data: { disputed: false, escrowReleased: true, paymentStatus: "Refunded", status: "CANCELLED" }
      }));
      
      // Farmer gets split payout amount (600)
      expect(mockTx.user.update).toHaveBeenCalledWith(expect.objectContaining({
        where: { id: "farmer-1" },
        data: { walletBalance: 700 }
      }));

      // Buyer gets split refund amount (400)
      expect(mockTx.user.update).toHaveBeenCalledWith(expect.objectContaining({
        where: { id: "buyer-1" },
        data: { walletBalance: 500 }
      }));
    });
  });

  describe("Razorpay/Stripe Signature Verification Tests", () => {
    const orderId = "order_123";
    const paymentId = "pay_456";
    const secret = "test_webhook_secret";

    beforeEach(() => {
      process.env.RAZORPAY_SECRET = secret;
      process.env.RAZORPAY_WEBHOOK_SECRET = secret;
    });

    it("should pass verification with a valid order/payment signature", async () => {
      const hmac = crypto.createHmac("sha256", secret);
      hmac.update(`${orderId}|${paymentId}`);
      const validSignature = hmac.digest("hex");

      const result = await PaymentFintechService.verifyRazorpaySignature(
        orderId,
        paymentId,
        validSignature
      );
      expect(result).toBe(true);
    });

    it("should fail verification with a tampered order/payment payload/signature", async () => {
      const hmac = crypto.createHmac("sha256", secret);
      hmac.update(`${orderId}|${paymentId}`);
      const validSignature = hmac.digest("hex");
      const tamperedSignature = validSignature.substring(0, validSignature.length - 2) + "00";

      const result = await PaymentFintechService.verifyRazorpaySignature(
        orderId,
        paymentId,
        tamperedSignature
      );
      expect(result).toBe(false);
    });

    it("should fail verification with an invalid signature length or empty value", async () => {
      const resultEmpty = await PaymentFintechService.verifyRazorpaySignature(
        orderId,
        paymentId,
        ""
      );
      expect(resultEmpty).toBe(false);

      const resultShort = await PaymentFintechService.verifyRazorpaySignature(
        orderId,
        paymentId,
        "short_sig"
      );
      expect(resultShort).toBe(false);
    });

    it("should pass webhook verification with a valid signature", () => {
      const payload = JSON.stringify({ event: "payment.captured", orderId });
      const hmac = crypto.createHmac("sha256", secret);
      hmac.update(payload);
      const validSignature = hmac.digest("hex");

      const result = PaymentFintechService.verifyWebhookSignature(payload, validSignature);
      expect(result).toBe(true);
    });

    it("should fail webhook verification with a tampered payload", () => {
      const payload = JSON.stringify({ event: "payment.captured", orderId });
      const tamperedPayload = JSON.stringify({ event: "payment.captured", orderId: "tampered_order_id" });
      const hmac = crypto.createHmac("sha256", secret);
      hmac.update(payload);
      const signature = hmac.digest("hex");

      const result = PaymentFintechService.verifyWebhookSignature(tamperedPayload, signature);
      expect(result).toBe(false);
    });

    it("should fail webhook verification with an empty or missing signature", () => {
      const payload = JSON.stringify({ event: "payment.captured", orderId });
      const resultEmpty = PaymentFintechService.verifyWebhookSignature(payload, "");
      expect(resultEmpty).toBe(false);
    });

    it("should process webhook API route successfully with valid raw body signature", async () => {
      const payloadObj = {
        event: "payment.captured",
        payload: {
          payment: {
            entity: {
              amount: 2200000, // 22,000 INR in paise
              notes: { orderId: "ord_101" }
            }
          }
        }
      };
      const rawBody = JSON.stringify(payloadObj);
      
      const hmac = crypto.createHmac("sha256", secret);
      hmac.update(rawBody);
      const validSignature = hmac.digest("hex");

      (prisma.payment.findFirst as any).mockResolvedValueOnce({ id: "pay_01", amount: 22000 });
      (prisma.payment.update as any).mockResolvedValueOnce({});
      (prisma.order.update as any).mockResolvedValueOnce({});

      const req = new Request("http://localhost/api/payments/webhook", {
        method: "POST",
        headers: {
          "x-razorpay-signature": validSignature,
          "content-type": "application/json"
        },
        body: rawBody
      });

      const response = await webhookPOST(req);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(prisma.payment.update).toHaveBeenCalled();
      expect(prisma.order.update).toHaveBeenCalledWith(expect.objectContaining({
        where: { id: "ord_101" },
        data: { paymentStatus: "Paid" }
      }));
    });

    it("should reject webhook API route with status 400 when signature validation fails", async () => {
      const rawBody = JSON.stringify({ event: "payment.captured" });
      const req = new Request("http://localhost/api/payments/webhook", {
        method: "POST",
        headers: {
          "x-razorpay-signature": "tampered_signature_value",
          "content-type": "application/json"
        },
        body: rawBody
      });

      const response = await webhookPOST(req);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error).toBe("Invalid webhook signature");
    });

    it("should throw an error when RAZORPAY_SECRET is undefined", async () => {
      delete process.env.RAZORPAY_SECRET;

      await expect(
        PaymentFintechService.verifyRazorpaySignature(orderId, paymentId, "any_sig")
      ).rejects.toThrow("Razorpay secret not configured");
    });

    it("should throw an error when RAZORPAY_WEBHOOK_SECRET is undefined", () => {
      delete process.env.RAZORPAY_WEBHOOK_SECRET;

      expect(() =>
        PaymentFintechService.verifyWebhookSignature("any_payload", "any_sig")
      ).toThrow("Razorpay webhook secret not configured");
    });

    it("should fail with status 500 when webhook is called and secret is missing", async () => {
      delete process.env.RAZORPAY_WEBHOOK_SECRET;
      const rawBody = JSON.stringify({ event: "payment.captured" });
      
      const req = new Request("http://localhost/api/payments/webhook", {
        method: "POST",
        headers: {
          "x-razorpay-signature": "any_signature",
          "content-type": "application/json"
        },
        body: rawBody
      });

      const response = await webhookPOST(req);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.success).toBe(false);
      expect(data.error).toBe("Razorpay webhook secret not configured");
    });

    it("should evaluate isDemoMode() purely based on environment variables", () => {
      const originalSecret = process.env.RAZORPAY_SECRET;
      const originalWebhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;
      const originalDemoMode = process.env.DEMO_MODE;
      try {
        // 1. If secrets are missing, defaults to true
        delete process.env.RAZORPAY_SECRET;
        delete process.env.RAZORPAY_WEBHOOK_SECRET;
        delete process.env.DEMO_MODE;
        expect(isDemoMode()).toBe(true);

        // 2. If secrets are present, defaults to false
        process.env.RAZORPAY_SECRET = "real_secret";
        process.env.RAZORPAY_WEBHOOK_SECRET = "real_webhook_secret";
        expect(isDemoMode()).toBe(false);

        // 3. Explicit DEMO_MODE overrides
        process.env.DEMO_MODE = "true";
        expect(isDemoMode()).toBe(true);

        process.env.DEMO_MODE = "false";
        expect(isDemoMode()).toBe(false);
      } finally {
        process.env.RAZORPAY_SECRET = originalSecret;
        process.env.RAZORPAY_WEBHOOK_SECRET = originalWebhookSecret;
        process.env.DEMO_MODE = originalDemoMode;
      }
    });

    it("should fail closed and attempt real validation when DEMO_MODE is explicitly false even if secrets are missing", async () => {
      const originalSecret = process.env.RAZORPAY_SECRET;
      const originalWebhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;
      const originalDemoMode = process.env.DEMO_MODE;
      try {
        delete process.env.RAZORPAY_SECRET;
        delete process.env.RAZORPAY_WEBHOOK_SECRET;
        process.env.DEMO_MODE = "false";

        // isDemoMode should be false
        expect(isDemoMode()).toBe(false);

        // Verify request should fail closed with status 500
        const req = new Request("http://localhost/api/payments/verify", {
          method: "POST",
          headers: {
            "content-type": "application/json"
          },
          body: JSON.stringify({
            paymentId: "pay_123",
            razorpayOrderId: "order_123",
            razorpayPaymentId: "pay_123",
            razorpaySignature: "sig_123"
          })
        });

        const { POST: verifyPOST } = await import("./verify/route");
        const response = await verifyPOST(req);
        const data = await response.json();

        expect(response.status).toBe(500);
        expect(data.success).toBe(false);
        expect(data.error).toBe("Razorpay secret not configured");
      } finally {
        process.env.RAZORPAY_SECRET = originalSecret;
        process.env.RAZORPAY_WEBHOOK_SECRET = originalWebhookSecret;
        process.env.DEMO_MODE = originalDemoMode;
      }
    });

    it("should generate clearly prefixed 'demo_' transaction and order IDs when initiating payment in demo mode", async () => {
      const originalSecret = process.env.RAZORPAY_SECRET;
      const originalWebhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;
      const originalDemoMode = process.env.DEMO_MODE;
      try {
        delete process.env.RAZORPAY_SECRET;
        delete process.env.RAZORPAY_WEBHOOK_SECRET;
        delete process.env.DEMO_MODE;

        expect(isDemoMode()).toBe(true);

        const validOrderId = "123e4567-e89b-12d3-a456-426614174000";

        (prisma.order.findUnique as any).mockResolvedValueOnce({
          id: validOrderId,
          total: 100
        });

        const req = new Request("http://localhost/api/payments/initiate", {
          method: "POST",
          headers: {
            "content-type": "application/json"
          },
          body: JSON.stringify({
            orderId: validOrderId,
            paymentMethod: "Razorpay",
            amount: 100
          })
        });

        const response = await initiatePOST(req);
        const resData = await response.json();

        expect(response.status).toBe(200);
        expect(resData.success).toBe(true);
        expect(resData.data.id).toMatch(/^demo_pay_/);
        expect(resData.data.razorpayOrderId).toMatch(/^demo_order_rzp_/);
      } finally {
        process.env.RAZORPAY_SECRET = originalSecret;
        process.env.RAZORPAY_WEBHOOK_SECRET = originalWebhookSecret;
        process.env.DEMO_MODE = originalDemoMode;
      }
    });
  });
});
