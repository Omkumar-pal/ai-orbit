-- CreateTable
CREATE TABLE "Task" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "iconUrl" TEXT,
    "categoryId" TEXT,
    "categoryName" TEXT,
    "categorySlug" TEXT,
    "creator" TEXT,
    "difficulty" TEXT,
    "pricingModel" TEXT,
    "featured" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3),
    "likes" INTEGER NOT NULL DEFAULT 0,
    "subscribers" INTEGER NOT NULL DEFAULT 0,
    "saves" INTEGER NOT NULL DEFAULT 0,
    "resources" INTEGER NOT NULL DEFAULT 0,
    "tools" INTEGER NOT NULL DEFAULT 0,
    "models" INTEGER NOT NULL DEFAULT 0,
    "robots" INTEGER NOT NULL DEFAULT 0,
    "devices" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "Task_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Task_slug_key" ON "Task"("slug");

-- CreateIndex
CREATE INDEX "Task_categorySlug_idx" ON "Task"("categorySlug");

-- CreateIndex
CREATE INDEX "Task_featured_idx" ON "Task"("featured");
