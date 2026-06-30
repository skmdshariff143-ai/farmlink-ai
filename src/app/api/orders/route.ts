import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { OrderService } from "@/services/db.services";
import { z } from "zod";

const orderSchema = z.object({
  paymentMethod: z.string().min(2, "Payment method is required"),
  items: z.array(z.object({
    listingId: z.string().uuid("Invalid crop listing ID"),
    quantity: z.number().min(1, "Minimum purchase quantity is 1kg"),
    price: z.number().min(1)
  })).min(1, "Order must contain at least 1 item")
});

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ success: false, error: "Unauthorized session" }, { status: 401 });
    }

    const userId = (session.user as any).id;
    const role = (session.user as any).role;

    const orders = await OrderService.getOrders(userId, role);
    return NextResponse.json({ success: true, data: orders });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || (session.user as any).role !== "BUYER") {
      return NextResponse.json({ success: false, error: "Unauthorized. Buyer access required." }, { status: 401 });
    }

    const body = await req.json();
    const result = orderSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json({ success: false, error: result.error.issues[0].message }, { status: 400 });
    }

    const order = await OrderService.createOrder({
      buyerId: (session.user as any).id,
      paymentMethod: result.data.paymentMethod,
      items: result.data.items
    });

    return NextResponse.json({ success: true, data: order });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
