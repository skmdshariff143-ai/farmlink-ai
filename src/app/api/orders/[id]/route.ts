import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { OrderService } from "@/services/db.services";
import { OrderStatus } from "@prisma/client";

interface Params {
  params: Promise<{ id: string }>;
}

export async function GET(req: Request, { params }: Params) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ success: false, error: "Unauthorized session" }, { status: 401 });
    }

    const { id } = await params;
    const order = await OrderService.getOrderById(id);

    if (!order) {
      return NextResponse.json({ success: false, error: "Order details not found" }, { status: 404 });
    }

    // Access control: only buyer or involved farmer or admin can view
    const userId = (session.user as any).id;
    const role = (session.user as any).role;
    
    const isBuyer = order.buyerId === userId;
    const isFarmer = order.items.some(item => item.listing.farmerId === userId);
    const isAdmin = role === "ADMIN";

    if (!isBuyer && !isFarmer && !isAdmin) {
      return NextResponse.json({ success: false, error: "Forbidden. Access denied." }, { status: 403 });
    }

    return NextResponse.json({ success: true, data: order });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function PATCH(req: Request, { params }: Params) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ success: false, error: "Unauthorized session" }, { status: 401 });
    }

    const { id } = await params;
    const order = await OrderService.getOrderById(id);

    if (!order) {
      return NextResponse.json({ success: false, error: "Order not found" }, { status: 404 });
    }

    // Role verification: Farmers or Transport providers or Admins can update status
    const body = await req.json();
    const newStatus = body.status as OrderStatus;

    if (!Object.values(OrderStatus).includes(newStatus)) {
      return NextResponse.json({ success: false, error: "Invalid order status value" }, { status: 400 });
    }

    const updatedOrder = await OrderService.updateOrderStatus(id, newStatus);
    return NextResponse.json({ success: true, data: updatedOrder });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
