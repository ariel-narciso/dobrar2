/*
  Warnings:

  - You are about to drop the `Note` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Order` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Stock` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "Note";
PRAGMA foreign_keys=on;

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "Order";
PRAGMA foreign_keys=on;

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "Stock";
PRAGMA foreign_keys=on;

-- CreateTable
CREATE TABLE "stock" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "ticker" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "cnpj" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "note" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "date" DATETIME NOT NULL,
    "fees" DECIMAL NOT NULL,
    "withholding_income_tax" DECIMAL NOT NULL
);

-- CreateTable
CREATE TABLE "order" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "note_id" TEXT NOT NULL,
    "stock_id" TEXT NOT NULL,
    "type" BOOLEAN NOT NULL,
    "quantity" INTEGER NOT NULL,
    "price" DECIMAL NOT NULL,
    CONSTRAINT "order_note_id_fkey" FOREIGN KEY ("note_id") REFERENCES "note" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "order_stock_id_fkey" FOREIGN KEY ("stock_id") REFERENCES "stock" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "stock_ticker_key" ON "stock"("ticker");

-- CreateIndex
CREATE UNIQUE INDEX "stock_cnpj_key" ON "stock"("cnpj");

-- CreateIndex
CREATE UNIQUE INDEX "note_date_key" ON "note"("date");
