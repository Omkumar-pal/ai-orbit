-- CreateTable
CREATE TABLE "Source" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "domain" TEXT,
    "color" TEXT,
    "followers" TEXT,
    "logoUrl" TEXT,

    CONSTRAINT "Source_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "News" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "headline" TEXT NOT NULL,
    "dek" TEXT,
    "aiSummary" TEXT,
    "articleUrl" TEXT,
    "category" TEXT,
    "topics" JSONB,
    "sourceId" TEXT,
    "hours" INTEGER NOT NULL DEFAULT 0,
    "up" INTEGER NOT NULL DEFAULT 0,
    "down" INTEGER NOT NULL DEFAULT 0,
    "score" INTEGER NOT NULL DEFAULT 0,
    "filters" JSONB,
    "bookmarked" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "News_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "News_slug_key" ON "News"("slug");

-- CreateIndex
CREATE INDEX "News_category_idx" ON "News"("category");

-- CreateIndex
CREATE INDEX "News_hours_idx" ON "News"("hours");

-- CreateIndex
CREATE INDEX "News_sourceId_idx" ON "News"("sourceId");

-- AddForeignKey
ALTER TABLE "News" ADD CONSTRAINT "News_sourceId_fkey" FOREIGN KEY ("sourceId") REFERENCES "Source"("id") ON DELETE SET NULL ON UPDATE CASCADE;
