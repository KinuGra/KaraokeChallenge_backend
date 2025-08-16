-- CreateTable
CREATE TABLE "Score" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "promptId" INTEGER NOT NULL,
    "score" INTEGER NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Score_promptId_fkey" FOREIGN KEY ("promptId") REFERENCES "Prompt" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE INDEX "Score_promptId_idx" ON "Score"("promptId");
