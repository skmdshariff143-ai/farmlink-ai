import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { PaymentFintechService } from "@/services/payment.services";
import { z } from "zod";

const disputeActionSchema = z.discriminatedUnion("action", [
  z.object({
    action: z.literal("raise"),
    orderId: z.string().uuid("Invalid order ID"),
    reason: z.string().min(1, "Reason is required"),
    description: z.string().min(1, "Description is required")
  }),
  z.object({
    action: z.literal("resolve"),
    orderId: z.string().uuid("Invalid order ID"),
    resolution: z.enum(["RESOLVED_REFUND", "RESOLVED_RELEASE", "RESOLVED_SPLIT"]),
    notes: z.string().min(1, "Resolution notes are required"),
    splitFarmerAmount: z.number().nonnegative().optional(),
    splitBuyerAmount: z.number().nonnegative().optional()
  })
]);

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const result = disputeActionSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json({ success: false, error: result.error.issues[0].message }, { status: 400 });
    }

    const userId = (session.user as any).id;
    const userRole = (session.user as any).role;

    if (result.data.action === "raise") {
      const { orderId, reason, description } = result.data;
      const raisedByRole = userRole === "BUYER" ? "BUYER" : "FARMER";

      const raiseResult = await PaymentFintechService.raiseDispute(
        orderId,
        userId,
        raisedByRole,
        reason,
        description
      );
      return NextResponse.json({ success: true, data: raiseResult });
    }

    if (result.data.action === "resolve") {
      if (userRole !== "ADMIN") {
        return NextResponse.json({ success: false, error: "Unauthorized. Admin credentials required." }, { status: 403 });
      }

      const { orderId, resolution, notes, splitFarmerAmount, splitBuyerAmount } = result.data;
      const resolveResult = await PaymentFintechService.resolveDispute(
        orderId,
        userId,
        resolution,
        notes,
        splitFarmerAmount,
        splitBuyerAmount
      );
      return NextResponse.json({ success: true, data: resolveResult });
    }

    return NextResponse.json({ success: false, error: "Invalid action" }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
