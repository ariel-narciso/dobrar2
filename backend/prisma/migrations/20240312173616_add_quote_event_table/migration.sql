-- CreateTable
CREATE TABLE "quote_event" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "quote_id" TEXT NOT NULL,
    "quote_event_type_id" TEXT NOT NULL,
    "date" DATETIME NOT NULL,
    "quantity" INTEGER,
    "value" REAL NOT NULL,
    CONSTRAINT "quote_event_quote_id_fkey" FOREIGN KEY ("quote_id") REFERENCES "quote" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "quote_event_quote_event_type_id_fkey" FOREIGN KEY ("quote_event_type_id") REFERENCES "quote_event_type" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "quote_event_type" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "code" INTEGER NOT NULL,
    "name" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "quote_event_type_code_key" ON "quote_event_type"("code");
