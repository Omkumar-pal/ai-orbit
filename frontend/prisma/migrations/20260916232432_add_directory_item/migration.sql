-- CreateEnum
CREATE TYPE "Pricing" AS ENUM ('Free', 'Freemium', 'Paid');

-- CreateTable
CREATE TABLE "DirectoryItem" (
    "id" TEXT NOT NULL,
    "resource" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "task" TEXT NOT NULL,
    "pricing" "Pricing" NOT NULL,
    "api" BOOLEAN NOT NULL DEFAULT false,
    "verified" BOOLEAN NOT NULL DEFAULT false,
    "accent" TEXT NOT NULL,
    "isTrending" BOOLEAN NOT NULL DEFAULT false,
    "popularity" INTEGER,
    "rating" DOUBLE PRECISION,
    "isNew" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "DirectoryItem_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "DirectoryItem_resource_idx" ON "DirectoryItem"("resource");

-- CreateIndex
CREATE UNIQUE INDEX "DirectoryItem_resource_slug_key" ON "DirectoryItem"("resource", "slug");
