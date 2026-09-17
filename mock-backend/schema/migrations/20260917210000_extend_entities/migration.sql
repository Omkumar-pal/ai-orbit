-- AlterTable: extend Model with raw models dump fields
ALTER TABLE "Model" ADD COLUMN "creator" TEXT,
ADD COLUMN "contextWindow" TEXT,
ADD COLUMN "parameterSize" TEXT,
ADD COLUMN "modality" TEXT,
ADD COLUMN "releaseDate" TEXT,
ADD COLUMN "description" TEXT,
ADD COLUMN "providerId" TEXT,
ADD COLUMN "providerSlug" TEXT,
ADD COLUMN "providerName" TEXT,
ADD COLUMN "providerLogo" TEXT,
ADD COLUMN "capabilities" JSONB,
ADD COLUMN "apiAvailable" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN "documentation" TEXT,
ADD COLUMN "promptExamples" JSONB,
ADD COLUMN "openSource" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN "primaryTask" TEXT,
ADD COLUMN "subCategories" JSONB,
ADD COLUMN "createdAt" TIMESTAMP(3),
ADD COLUMN "updatedAt" TIMESTAMP(3);

-- AlterTable: extend Robot with raw robots dump fields
ALTER TABLE "Robot" ADD COLUMN "thumbnailUrl" TEXT,
ADD COLUMN "company" TEXT,
ADD COLUMN "country" TEXT,
ADD COLUMN "category" TEXT,
ADD COLUMN "availability" TEXT,
ADD COLUMN "price" TEXT,
ADD COLUMN "releaseDate" TIMESTAMP(3),
ADD COLUMN "mainTask" TEXT,
ADD COLUMN "autonomyLevel" TEXT,
ADD COLUMN "primaryUseCases" JSONB,
ADD COLUMN "websiteUrl" TEXT,
ADD COLUMN "about" TEXT,
ADD COLUMN "specs" TEXT,
ADD COLUMN "linkedTasks" JSONB,
ADD COLUMN "createdAt" TIMESTAMP(3),
ADD COLUMN "updatedAt" TIMESTAMP(3);

-- AlterTable: extend Device with raw devices dump fields
ALTER TABLE "Device" ADD COLUMN "manufacturer" TEXT,
ADD COLUMN "manufacturerSlug" TEXT,
ADD COLUMN "manufacturerLogo" TEXT,
ADD COLUMN "category" TEXT,
ADD COLUMN "availability" TEXT,
ADD COLUMN "price" TEXT,
ADD COLUMN "year" TEXT,
ADD COLUMN "month" TEXT,
ADD COLUMN "description" TEXT,
ADD COLUMN "images" JSONB,
ADD COLUMN "mainTask" TEXT,
ADD COLUMN "mainTaskColor" TEXT,
ADD COLUMN "formFactor" TEXT,
ADD COLUMN "country" TEXT,
ADD COLUMN "aiFeatures" JSONB,
ADD COLUMN "primaryUseCases" JSONB,
ADD COLUMN "buyUrl" TEXT;

-- CreateTable
CREATE TABLE "Repository" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "owner" TEXT,
    "ownerAvatarUrl" TEXT,
    "description" TEXT,
    "url" TEXT,
    "homepage" TEXT,
    "language" TEXT,
    "license" TEXT,
    "topics" JSONB,
    "stars" INTEGER NOT NULL DEFAULT 0,
    "forks" INTEGER NOT NULL DEFAULT 0,
    "openIssues" INTEGER NOT NULL DEFAULT 0,
    "logoUrl" TEXT,
    "brandColor" TEXT,
    "githubCreatedAt" TIMESTAMP(3),
    "syncedAt" TIMESTAMP(3),
    "subCategories" JSONB,
    "companySlug" TEXT,

    CONSTRAINT "Repository_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Repository_slug_key" ON "Repository"("slug");

-- CreateIndex
CREATE INDEX "Repository_language_idx" ON "Repository"("language");

-- CreateTable
CREATE TABLE "Mcp" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "itemType" TEXT,
    "shortDescription" TEXT,
    "fullDescription" TEXT,
    "providerName" TEXT,
    "providerUrl" TEXT,
    "license" TEXT,
    "pricingType" TEXT,
    "isFeatured" BOOLEAN NOT NULL DEFAULT false,
    "isVerified" BOOLEAN NOT NULL DEFAULT false,
    "launchDate" TIMESTAMP(3),
    "lastUpdatedDate" TIMESTAMP(3),
    "websiteUrl" TEXT,
    "documentationUrl" TEXT,
    "repositoryUrl" TEXT,
    "qualityScore" DOUBLE PRECISION,
    "easeOfUseScore" DOUBLE PRECISION,
    "globalRank" INTEGER,
    "leaderboardRank" INTEGER,
    "editorialVerdict" TEXT,
    "viewCount" INTEGER NOT NULL DEFAULT 0,
    "monthlyVisits" TEXT,
    "upvoteCount" INTEGER NOT NULL DEFAULT 0,
    "saveCount" INTEGER NOT NULL DEFAULT 0,
    "technicalSpecs" JSONB,
    "installationGuides" JSONB,
    "useCases" JSONB,
    "categories" JSONB,
    "subCategories" JSONB,
    "tags" JSONB,
    "features" JSONB,
    "pricingPlans" JSONB,
    "reviews" JSONB,
    "editorialReviews" JSONB,
    "discussions" JSONB,
    "faqs" JSONB,
    "createdAt" TIMESTAMP(3),
    "updatedAt" TIMESTAMP(3),

    CONSTRAINT "Mcp_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Mcp_slug_key" ON "Mcp"("slug");

-- CreateIndex
CREATE INDEX "Mcp_itemType_idx" ON "Mcp"("itemType");
