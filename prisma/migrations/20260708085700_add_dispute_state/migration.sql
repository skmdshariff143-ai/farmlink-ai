-- CreateEnum
CREATE TYPE "DisputeStatus" AS ENUM ('OPEN', 'RESOLVED_REFUND', 'RESOLVED_RELEASE', 'RESOLVED_SPLIT');

-- CreateEnum
CREATE TYPE "DisputedBy" AS ENUM ('BUYER', 'FARMER');

-- AlterEnum
ALTER TYPE "OrderStatus" ADD VALUE 'CANCELLED';

-- AlterTable
ALTER TABLE "Order" ADD COLUMN     "disputed" BOOLEAN NOT NULL DEFAULT false;

-- CreateTable
CREATE TABLE "OrderDispute" (
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

-- CreateIndex
CREATE UNIQUE INDEX "OrderDispute_orderId_key" ON "OrderDispute"("orderId");

-- AddForeignKey
ALTER TABLE "OrderDispute" ADD CONSTRAINT "OrderDispute_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE CASCADE ON UPDATE CASCADE;
