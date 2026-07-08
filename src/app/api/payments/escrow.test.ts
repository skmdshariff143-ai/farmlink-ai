import { vi, describe, it, expect, beforeEach } from "vitest";
import { PaymentFintechService } from "@/services/payment.services";
import { prisma } from "@/lib/prisma";
import { POST as initiatePOST } from "./initiate/route";

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
        update: vi.fn()
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
});
