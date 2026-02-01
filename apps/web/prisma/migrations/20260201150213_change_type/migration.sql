/*
  Warnings:

  - You are about to alter the column `totalAmount` on the `Booking` table. The data in that column could be lost. The data in that column will be cast from `Decimal(10,2)` to `Integer`.
  - You are about to alter the column `priceSnapshot` on the `BookingTable` table. The data in that column could be lost. The data in that column will be cast from `Decimal(10,2)` to `Integer`.
  - You are about to alter the column `unitCost` on the `InventoryLog` table. The data in that column could be lost. The data in that column will be cast from `Decimal(10,2)` to `Integer`.
  - You are about to alter the column `totalRevenue` on the `MonthlyReport` table. The data in that column could be lost. The data in that column will be cast from `Decimal(10,2)` to `Integer`.
  - You are about to alter the column `tableRevenue` on the `MonthlyReport` table. The data in that column could be lost. The data in that column will be cast from `Decimal(10,2)` to `Integer`.
  - You are about to alter the column `productRevenue` on the `MonthlyReport` table. The data in that column could be lost. The data in that column will be cast from `Decimal(10,2)` to `Integer`.
  - You are about to alter the column `totalExpense` on the `MonthlyReport` table. The data in that column could be lost. The data in that column will be cast from `Decimal(10,2)` to `Integer`.
  - You are about to alter the column `purchaseExpense` on the `MonthlyReport` table. The data in that column could be lost. The data in that column will be cast from `Decimal(10,2)` to `Integer`.
  - You are about to alter the column `otherExpense` on the `MonthlyReport` table. The data in that column could be lost. The data in that column will be cast from `Decimal(10,2)` to `Integer`.
  - You are about to alter the column `netProfit` on the `MonthlyReport` table. The data in that column could be lost. The data in that column will be cast from `Decimal(10,2)` to `Integer`.
  - You are about to alter the column `totalAmount` on the `Order` table. The data in that column could be lost. The data in that column will be cast from `Decimal(10,2)` to `Integer`.
  - You are about to alter the column `priceSnapshot` on the `OrderItem` table. The data in that column could be lost. The data in that column will be cast from `Decimal(10,2)` to `Integer`.
  - You are about to alter the column `costSnapshot` on the `OrderItem` table. The data in that column could be lost. The data in that column will be cast from `Decimal(10,2)` to `Integer`.
  - You are about to alter the column `price` on the `Product` table. The data in that column could be lost. The data in that column will be cast from `Decimal(10,2)` to `Integer`.
  - You are about to alter the column `cost` on the `Product` table. The data in that column could be lost. The data in that column will be cast from `Decimal(10,2)` to `Integer`.
  - You are about to alter the column `hourlyRate` on the `Table` table. The data in that column could be lost. The data in that column will be cast from `Decimal(10,2)` to `Integer`.
  - You are about to alter the column `amount` on the `Transaction` table. The data in that column could be lost. The data in that column will be cast from `Decimal(10,2)` to `Integer`.

*/
-- AlterTable
ALTER TABLE "Booking" ALTER COLUMN "totalAmount" SET DEFAULT 0,
ALTER COLUMN "totalAmount" SET DATA TYPE INTEGER;

-- AlterTable
ALTER TABLE "BookingTable" ALTER COLUMN "priceSnapshot" SET DATA TYPE INTEGER;

-- AlterTable
ALTER TABLE "InventoryLog" ALTER COLUMN "unitCost" SET DATA TYPE INTEGER;

-- AlterTable
ALTER TABLE "MonthlyReport" ALTER COLUMN "totalRevenue" SET DEFAULT 0,
ALTER COLUMN "totalRevenue" SET DATA TYPE INTEGER,
ALTER COLUMN "tableRevenue" SET DEFAULT 0,
ALTER COLUMN "tableRevenue" SET DATA TYPE INTEGER,
ALTER COLUMN "productRevenue" SET DEFAULT 0,
ALTER COLUMN "productRevenue" SET DATA TYPE INTEGER,
ALTER COLUMN "totalExpense" SET DEFAULT 0,
ALTER COLUMN "totalExpense" SET DATA TYPE INTEGER,
ALTER COLUMN "purchaseExpense" SET DEFAULT 0,
ALTER COLUMN "purchaseExpense" SET DATA TYPE INTEGER,
ALTER COLUMN "otherExpense" SET DEFAULT 0,
ALTER COLUMN "otherExpense" SET DATA TYPE INTEGER,
ALTER COLUMN "netProfit" SET DEFAULT 0,
ALTER COLUMN "netProfit" SET DATA TYPE INTEGER;

-- AlterTable
ALTER TABLE "Order" ALTER COLUMN "totalAmount" SET DEFAULT 0,
ALTER COLUMN "totalAmount" SET DATA TYPE INTEGER;

-- AlterTable
ALTER TABLE "OrderItem" ALTER COLUMN "priceSnapshot" SET DATA TYPE INTEGER,
ALTER COLUMN "costSnapshot" SET DATA TYPE INTEGER;

-- AlterTable
ALTER TABLE "Product" ALTER COLUMN "price" SET DATA TYPE INTEGER,
ALTER COLUMN "cost" SET DATA TYPE INTEGER;

-- AlterTable
ALTER TABLE "Table" ALTER COLUMN "hourlyRate" SET DATA TYPE INTEGER;

-- AlterTable
ALTER TABLE "Transaction" ALTER COLUMN "amount" SET DATA TYPE INTEGER;
