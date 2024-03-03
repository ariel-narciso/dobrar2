/*
  Warnings:

  - Added the required column `orderId` to the `Note` table without a default value. This is not possible if the table is not empty.
  - Added the required column `stockId` to the `Note` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Note" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "date" DATETIME NOT NULL,
    "fees" DECIMAL NOT NULL,
    "withholdingIncomeTax" DECIMAL NOT NULL,
    "orderId" TEXT NOT NULL,
    "stockId" TEXT NOT NULL,
    CONSTRAINT "Note_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Note_stockId_fkey" FOREIGN KEY ("stockId") REFERENCES "Stock" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Note" ("date", "fees", "id", "withholdingIncomeTax") SELECT "date", "fees", "id", "withholdingIncomeTax" FROM "Note";
DROP TABLE "Note";
ALTER TABLE "new_Note" RENAME TO "Note";
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
