import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { PaymentFintechService } from "@/services/payment.services";

/*
 * SECURITY WARNING: This webhook endpoint fails closed by design.
 * To go live:
 * 1. Set RAZORPAY_SECRET and RAZORPAY_WEBHOOK_SECRET in your production environment variables.
 * 2. Set DEMO_MODE=false in your environment.
 * Webhook signature verification will fail closed on any missing or invalid signatures.
 */

export async function POST(req: Request) {
  try {
    const rawBody = await req.text();
    const signature = req.headers.get("x-razorpay-signature") || "";
    
    // Validate webhook signature
    const isValid = PaymentFintechService.verifyWebhookSignature(rawBody, signature);
    if (!isValid) {
      return NextResponse.json({ success: false, error: "Invalid webhook signature" }, { status: 400 });
    }

    const payload = JSON.parse(rawBody);
    const event = payload.event;

    // Handle payments events
    if (event === "payment.captured") {
      const orderId = payload.payload.payment.entity.notes.orderId;
      const amount = payload.payload.payment.entity.amount / 100; // convert to rupees

      // Mark payment records as Paid
      const payment = await prisma.payment.findFirst({
        where: { orderId, amount }
      });

      if (payment) {
        await prisma.payment.update({
          where: { id: payment.id },
          data: { status: "Paid" }
        });

        await prisma.order.update({
          where: { id: orderId },
          data: { paymentStatus: "Paid" }
        });
      }
    }

    return NextResponse.json({ success: true, message: "Webhook processed successfully" });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
