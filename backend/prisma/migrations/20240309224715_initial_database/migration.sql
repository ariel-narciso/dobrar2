-- CreateTable
CREATE TABLE "quote" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "quote_type_id" TEXT NOT NULL,
    "ticker" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "cnpj" TEXT,
    CONSTRAINT "quote_quote_type_id_fkey" FOREIGN KEY ("quote_type_id") REFERENCES "quote_type" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "note" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "date" DATETIME NOT NULL,
    "fees" REAL NOT NULL,
    "irrf" REAL NOT NULL DEFAULT 0
);

-- CreateTable
CREATE TABLE "order" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "order_type_id" TEXT NOT NULL,
    "note_id" TEXT NOT NULL,
    "quote_id" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL,
    "price" REAL NOT NULL,
    CONSTRAINT "order_order_type_id_fkey" FOREIGN KEY ("order_type_id") REFERENCES "order_type" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "order_note_id_fkey" FOREIGN KEY ("note_id") REFERENCES "note" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "order_quote_id_fkey" FOREIGN KEY ("quote_id") REFERENCES "quote" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "order_type" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "code" INTEGER NOT NULL,
    "name" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "quote_type" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "code" INTEGER NOT NULL,
    "name" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "quote_ticker_key" ON "quote"("ticker");

-- CreateIndex
CREATE UNIQUE INDEX "quote_cnpj_key" ON "quote"("cnpj");

-- CreateIndex
CREATE UNIQUE INDEX "note_date_key" ON "note"("date");

-- CreateIndex
CREATE UNIQUE INDEX "order_type_code_key" ON "order_type"("code");

-- CreateIndex
CREATE UNIQUE INDEX "quote_type_code_key" ON "quote_type"("code");
