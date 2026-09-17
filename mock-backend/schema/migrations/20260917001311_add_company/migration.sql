-- CreateTable
CREATE TABLE "Company" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "logoUrl" TEXT,
    "description" TEXT NOT NULL,
    "website" TEXT,
    "country" TEXT,
    "city" TEXT,
    "foundedYear" INTEGER,
    "type" TEXT[],
    "sector" TEXT,
    "verified" BOOLEAN NOT NULL DEFAULT false,
    "featured" BOOLEAN NOT NULL DEFAULT false,
    "valuation" TEXT,
    "fundingRaised" TEXT,
    "latestFundingRound" TEXT,
    "employeeCount" INTEGER,
    "linkedinUrl" TEXT,
    "twitterUrl" TEXT,
    "views" INTEGER NOT NULL DEFAULT 0,
    "upvotes" INTEGER NOT NULL DEFAULT 0,
    "impressions" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3),
    "updatedAt" TIMESTAMP(3),
    "tools" JSONB,
    "aiModels" JSONB,
    "toolsCount" INTEGER NOT NULL DEFAULT 0,
    "aiModelsCount" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "Company_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Company_slug_key" ON "Company"("slug");

-- CreateIndex
CREATE INDEX "Company_sector_idx" ON "Company"("sector");

-- CreateIndex
CREATE INDEX "Company_verified_idx" ON "Company"("verified");

-- CreateIndex
CREATE INDEX "Company_featured_idx" ON "Company"("featured");
