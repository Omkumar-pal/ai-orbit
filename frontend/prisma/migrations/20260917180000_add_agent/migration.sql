-- CreateTable
CREATE TABLE "Agent" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "websiteUrl" TEXT,
    "logoUrl" TEXT,
    "category" TEXT,
    "categorySlug" TEXT,
    "primaryTask" TEXT,
    "pricingModel" TEXT,
    "pricingRaw" TEXT,
    "hasApi" BOOLEAN NOT NULL DEFAULT false,
    "isOpenSource" BOOLEAN NOT NULL DEFAULT false,
    "isTrending" BOOLEAN NOT NULL DEFAULT false,
    "verified" BOOLEAN NOT NULL DEFAULT false,
    "isVerified" BOOLEAN NOT NULL DEFAULT false,
    "compatibility" JSONB,
    "source" TEXT,
    "avgRating" DOUBLE PRECISION,
    "reviewCount" INTEGER NOT NULL DEFAULT 0,
    "upvoteCount" INTEGER NOT NULL DEFAULT 0,
    "views" INTEGER NOT NULL DEFAULT 0,
    "shortDescription" TEXT,
    "longDescription" TEXT,
    "features" JSONB,
    "useCases" JSONB,
    "integrations" JSONB,
    "apiDocsUrl" TEXT,
    "githubUrl" TEXT,
    "provider" TEXT,
    "providerWebsite" TEXT,
    "releaseDate" TIMESTAMP(3),
    "pros" JSONB,
    "cons" JSONB,
    "createdAt" TIMESTAMP(3),
    "updatedAt" TIMESTAMP(3),
    "ttasks" JSONB,

    CONSTRAINT "Agent_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Agent_slug_key" ON "Agent"("slug");

-- CreateIndex
CREATE INDEX "Agent_categorySlug_idx" ON "Agent"("categorySlug");

-- CreateIndex
CREATE INDEX "Agent_verified_idx" ON "Agent"("verified");
