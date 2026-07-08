import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { PaymentFintechService } from "@/services/payment.services";
import { OrderService } from "@/services/db.services";
import { z } from "zod";

const initiateSchema = z.object({
  orderId: z.string().uuid("Invalid order ID"),
  paymentMethod: z.enum(["Farmlink Wallet", "Razorpay", "Stripe", "Cash on Delivery"]),
  amount: z.number().min(1)
});

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ success: false, error: "Unauthorized session" }, { status: 401 });
    }

    const body = await req.json();
    const result = initiateSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json({ success: false, error: result.error.issues[0].message }, { status: 400 });
    }

    const { orderId, paymentMethod, amount } = result.data;
    const userId = (session.user as any).id;

    const order = await OrderService.getOrderById(orderId);
    if (!order) {
      return NextResponse.json({ success: false, error: "Order details not found" }, { status: 404 });
    }

    if (order.total !== amount) {
      return NextResponse.json({ success: false, error: "Payment amount does not match order total" }, { status: 400 });
    }

    if (paymentMethod === "Farmlink Wallet") {
      const paymentResult = await PaymentFintechService.executeWalletPayment(userId, orderId, amount);
      return NextResponse.json({ success: true, data: paymentResult });
    }

    if (paymentMethod === "Razorpay") {
      const razorpayOrder = await PaymentFintechService.createRazorpayOrder(orderId, amount);
      return NextResponse.json({ success: true, data: razorpayOrder });
    }

    // Default cash on delivery fallback
    return NextResponse.json({ success: true, data: { status: "Pending", orderId } });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
