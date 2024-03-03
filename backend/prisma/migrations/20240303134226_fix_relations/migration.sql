/*
  Warnings:

  - You are about to drop the column `orderId` on the `Note` table. All the data in the column will be lost.
  - You are about to drop the column `stockId` on the `Note` table. All the data in the column will be lost.
  - You are about to drop the column `withholdingIncomeTax` on the `Note` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[ticker]` on the table `Stock` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[cnpj]` on the table `Stock` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `note_id` to the `Order` table without a default value. This is not possible if the table is not empty.
  - Added the required column `stock_id` to the `Order` table without a default value. This is not possible if the table is not empty.
  - Added the required column `withholding_income_tax` to the `Note` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Order" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "note_id" TEXT NOT NULL,
    "stock_id" TEXT NOT NULL,
    "type" BOOLEAN NOT NULL,
    "quantity" INTEGER NOT NULL,
    "price" DECIMAL NOT NULL,
    CONSTRAINT "Order_note_id_fkey" FOREIGN KEY ("note_id") REFERENCES "Note" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Order_stock_id_fkey" FOREIGN KEY ("stock_id") REFERENCES "Stock" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Order" ("id", "price", "quantity", "type") SELECT "id", "price", "quantity", "type" FROM "Order";
DROP TABLE "Order";
ALTER TABLE "new_Order" RENAME TO "Order";
CREATE TABLE "new_Note" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "date" DATETIME NOT NULL,
    "fees" DECIMAL NOT NULL,
    "withholding_income_tax" DECIMAL NOT NULL
);
INSERT INTO "new_Note" ("date", "fees", "id") SELECT "date", "fees", "id" FROM "Note";
DROP TABLE "Note";
ALTER TABLE "new_Note" RENAME TO "Note";
CREATE UNIQUE INDEX "Note_date_key" ON "Note"("date");
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;

-- CreateIndex
CREATE UNIQUE INDEX "Stock_ticker_key" ON "Stock"("ticker");

-- CreateIndex
CREATE UNIQUE INDEX "Stock_cnpj_key" ON "Stock"("cnpj");
