import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { PaymentFintechService, isDemoMode } from "@/services/payment.services";
import { PaymentService } from "@/services/db.services";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const verifySchema = z.object({
  paymentId: z.string().min(3),
  razorpayOrderId: z.string().min(3),
  razorpayPaymentId: z.string().min(3),
  razorpaySignature: z.string().min(3)
});

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ success: false, error: "Unauthorized session" }, { status: 401 });
    }

    const body = await req.json();
    const result = verifySchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json({ success: false, error: result.error.issues[0].message }, { status: 400 });
    }

    const { paymentId, razorpayOrderId, razorpayPaymentId, razorpaySignature } = result.data;

    if (isDemoMode()) {
      // In demo mode, bypass signature verification and confirm payment directly
      const verifiedPayment = await PaymentService.verifyPayment(paymentId, "Paid");
      return NextResponse.json({ success: true, data: verifiedPayment, demo: true });
    }

    // Verify cryptographic signature
    const isValid = await PaymentFintechService.verifyRazorpaySignature(
      razorpayOrderId,
      razorpayPaymentId,
      razorpaySignature
    );

    if (!isValid) {
      await PaymentService.verifyPayment(paymentId, "Failed");
      return NextResponse.json({ success: false, error: "Cryptographic signature validation failed" }, { status: 400 });
    }

    const verifiedPayment = await PaymentService.verifyPayment(paymentId, "Paid");
    return NextResponse.json({ success: true, data: verifiedPayment });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
