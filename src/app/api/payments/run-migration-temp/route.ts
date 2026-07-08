import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || (session.user as any).role !== "ADMIN") {
      return NextResponse.json({ success: false, error: "Unauthorized. Admin credentials required." }, { status: 401 });
    }

    const sql = `
      DO $$ BEGIN
          IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'DisputeStatus') THEN
              CREATE TYPE "DisputeStatus" AS ENUM ('OPEN', 'RESOLVED_REFUND', 'RESOLVED_RELEASE', 'RESOLVED_SPLIT');
          END IF;
          IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'DisputedBy') THEN
              CREATE TYPE "DisputedBy" AS ENUM ('BUYER', 'FARMER');
          END IF;
          IF NOT EXISTS (
              SELECT 1 FROM pg_enum 
              WHERE enumtypid = 'OrderStatus'::regtype AND enumlabel = 'CANCELLED'
          ) THEN
              ALTER TYPE "OrderStatus" ADD VALUE 'CANCELLED';
          END IF;
      END $$;

      ALTER TABLE "Order" ADD COLUMN IF NOT EXISTS "disputed" BOOLEAN NOT NULL DEFAULT false;

      CREATE TABLE IF NOT EXISTS "OrderDispute" (
          "id" TEXT NOT NULL,
          "orderId" TEXT NOT NULL,
          "raisedById" TEXT NOT NULL,
          "raisedByRole" "DisputedBy" NOT NULL,
          "reason" TEXT NOT NULL,
          "description" TEXT NOT NULL,
          "status" "DisputeStatus" NOT NULL DEFAULT 'OPEN',
          "resolvedById" TEXT,
          "resolutionNotes" TEXT,
          "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
          "updatedAt" TIMESTAMP(3) NOT NULL,

          CONSTRAINT "OrderDispute_pkey" PRIMARY KEY ("id")
      );

      CREATE UNIQUE INDEX IF NOT EXISTS "OrderDispute_orderId_key" ON "OrderDispute"("orderId");

      ALTER TABLE "OrderDispute" DROP CONSTRAINT IF EXISTS "OrderDispute_orderId_fkey";
      ALTER TABLE "OrderDispute" ADD CONSTRAINT "OrderDispute_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    `;

    await prisma.$executeRawUnsafe(sql);

    return NextResponse.json({ success: true, message: "Migration completed successfully" });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
