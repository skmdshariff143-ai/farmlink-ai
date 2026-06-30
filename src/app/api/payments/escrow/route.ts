import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { PaymentFintechService } from "@/services/payment.services";
import { z } from "zod";

const escrowSchema = z.object({
  orderId: z.string().uuid("Invalid order ID"),
  action: z.enum(["release", "refund"])
});

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    // Escrow releases are guarded: Admin clearance required
    if (!session?.user || (session.user as any).role !== "ADMIN") {
      return NextResponse.json({ success: false, error: "Unauthorized. Admin credentials required." }, { status: 401 });
    }

    const body = await req.json();
    const result = escrowSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json({ success: false, error: result.error.issues[0].message }, { status: 400 });
    }

    const { orderId, action } = result.data;
    const adminUserId = (session.user as any).id;

    if (action === "release") {
      const payoutResult = await PaymentFintechService.releaseEscrowPayout(orderId, adminUserId);
      return NextResponse.json({ success: true, data: payoutResult });
    }

    // Process refund
    const refundResult = await PaymentFintechService.executeOrderRefund(orderId, adminUserId);
    return NextResponse.json({ success: true, data: refundResult });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
