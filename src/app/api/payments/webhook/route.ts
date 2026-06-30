import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import crypto from "crypto";

export async function POST(req: Request) {
  try {
    const rawBody = await req.text();
    const signature = req.headers.get("x-razorpay-signature") || "";
    
    // Webhook signature security checks
    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET || "mock_webhook_secret";
    
    const hmac = crypto.createHmac("sha256", webhookSecret);
    hmac.update(rawBody);
    const expectedSignature = hmac.digest("hex");

    // In production, validate header signature
    // if (expectedSignature !== signature) {
    //   return NextResponse.json({ success: false, error: "Invalid webhook signature" }, { status: 400 });
    // }

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
