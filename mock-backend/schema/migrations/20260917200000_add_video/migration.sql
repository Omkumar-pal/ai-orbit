-- CreateTable
CREATE TABLE "Video" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "toolName" TEXT,
    "toolCategory" TEXT,
    "youtubeId" TEXT,
    "thumbnail" TEXT,
    "durationSeconds" INTEGER NOT NULL DEFAULT 0,
    "views" INTEGER NOT NULL DEFAULT 0,
    "likes" INTEGER NOT NULL DEFAULT 0,
    "publishedAt" TIMESTAMP(3),
    "channelId" TEXT,
    "tags" JSONB,
    "accent" TEXT,
    "available" BOOLEAN NOT NULL DEFAULT true,
    "companyId" TEXT,
    "authorName" TEXT,
    "authorAvatar" TEXT,
    "createdAt" TIMESTAMP(3),
    "updatedAt" TIMESTAMP(3),

    CONSTRAINT "Video_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Video_slug_key" ON "Video"("slug");

-- CreateIndex
CREATE INDEX "Video_toolCategory_idx" ON "Video"("toolCategory");

-- CreateIndex
CREATE INDEX "Video_publishedAt_idx" ON "Video"("publishedAt");
