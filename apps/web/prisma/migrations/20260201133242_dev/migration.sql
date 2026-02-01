-- CreateEnum
CREATE TYPE "TransactionType" AS ENUM ('PURCHASE', 'SALE', 'REFUND', 'ADJUSTMENT', 'EXPENSE', 'REVENUE');

-- CreateEnum
CREATE TYPE "PaymentMethod" AS ENUM ('CASH', 'CARD', 'TRANSFER', 'MOMO', 'ZALOPAY');

-- AlterTable
ALTER TABLE "OrderItem" ADD COLUMN     "costSnapshot" DECIMAL(10,2);

-- AlterTable
ALTER TABLE "Product" ADD COLUMN     "cost" DECIMAL(10,2),
ADD COLUMN     "currentStock" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "minStock" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "unit" TEXT NOT NULL DEFAULT 'cái';

-- CreateTable
CREATE TABLE "InventoryLog" (
    "id" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL,
    "unitCost" DECIMAL(10,2),
    "reason" TEXT,
    "note" TEXT,
    "stockBefore" INTEGER NOT NULL,
    "stockAfter" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "InventoryLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Transaction" (
    "id" TEXT NOT NULL,
    "type" "TransactionType" NOT NULL,
    "amount" DECIMAL(10,2) NOT NULL,
    "paymentMethod" "PaymentMethod" NOT NULL DEFAULT 'CASH',
    "description" TEXT,
    "bookingId" TEXT,
    "orderId" TEXT,
    "userId" TEXT NOT NULL,
    "createdBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Transaction_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MonthlyReport" (
    "id" TEXT NOT NULL,
    "year" INTEGER NOT NULL,
    "month" INTEGER NOT NULL,
    "totalRevenue" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "tableRevenue" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "productRevenue" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "totalExpense" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "purchaseExpense" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "otherExpense" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "netProfit" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "productsSold" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MonthlyReport_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "InventoryLog_productId_idx" ON "InventoryLog"("productId");

-- CreateIndex
CREATE INDEX "InventoryLog_createdAt_idx" ON "InventoryLog"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "Transaction_bookingId_key" ON "Transaction"("bookingId");

-- CreateIndex
CREATE UNIQUE INDEX "Transaction_orderId_key" ON "Transaction"("orderId");

-- CreateIndex
CREATE INDEX "Transaction_type_idx" ON "Transaction"("type");

-- CreateIndex
CREATE INDEX "Transaction_createdAt_idx" ON "Transaction"("createdAt");

-- CreateIndex
CREATE INDEX "Transaction_userId_idx" ON "Transaction"("userId");

-- CreateIndex
CREATE INDEX "MonthlyReport_year_month_idx" ON "MonthlyReport"("year", "month");

-- CreateIndex
CREATE UNIQUE INDEX "MonthlyReport_year_month_key" ON "MonthlyReport"("year", "month");

-- CreateIndex
CREATE INDEX "OrderItem_orderId_idx" ON "OrderItem"("orderId");

-- CreateIndex
CREATE INDEX "OrderItem_productId_idx" ON "OrderItem"("productId");

-- AddForeignKey
ALTER TABLE "InventoryLog" ADD CONSTRAINT "InventoryLog_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InventoryLog" ADD CONSTRAINT "InventoryLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Transaction" ADD CONSTRAINT "Transaction_bookingId_fkey" FOREIGN KEY ("bookingId") REFERENCES "Booking"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Transaction" ADD CONSTRAINT "Transaction_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Transaction" ADD CONSTRAINT "Transaction_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
