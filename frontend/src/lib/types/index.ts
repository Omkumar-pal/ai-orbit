// Mirrors aiorbit_schema.sql + dossier schemas. Frontend-only types — backend will use Prisma.
export type Company = {
  id: string;
  slug: string;
  name: string;
  logoUrl?: string | null;
  description?: string | null;
  website?: string | null;
  country?: string | null;
  city?: string | null;
  foundedYear?: number | null;
  type?: string[];
  sector?: string | null;
  verified?: boolean;
  featured?: boolean;
  valuation?: string | null;
  fundingRaised?: string | null;
  latestFundingRound?: string | null;
  employeeCount?: number | null;
  linkedinUrl?: string | null;
  twitterUrl?: string | null;
  createdAt?: string | Date | null;
  tools?: unknown[] | null;
  aiModels?: { id: string; slug: string; name: string }[] | null;
  toolsCount?: number;
  aiModelsCount?: number;
};

// Raw Task — verbatim from experiment/data/tasks/raw.json (mock_aiorbit, 115 rows)
export type Task = {
  id: string;
  slug: string;
  title: string;
  description: string;
  iconUrl?: string | null;
  categoryId?: string | null;
  categoryName?: string | null;
  categorySlug?: string | null;
  creator?: string | null;
  difficulty?: string | null;
  pricingModel?: string | null;
  featured?: boolean;
  createdAt?: string | Date | null;
  likes?: number;
  subscribers?: number;
  saves?: number;
  resources?: number;
  tools?: number;
  models?: number;
  robots?: number;
  devices?: number;
};

export type Tool = {
  id: string;
  slug: string;
  name: string;
  description?: string | null;
  logoUrl?: string | null;
  tagline?: string | null;
  pricingModel?: string | null;
  pricingAmount?: string | null;
  billingFrequency?: string | null;
  avgRating?: number | null;
  upvoteCount?: number;
  reviewCount?: number;
  hasApi?: boolean;
  isOpenSource?: boolean;
  isTrending?: boolean;
  verified?: boolean;
  compatibility?: string | null;
  releaseDate?: string | Date | null;
  launchDate?: string | Date | null;
  visitUrl?: string | null;
  useCases?: string | null;
  categories?: unknown[] | null;
  tags?: unknown[] | null;
  ttasks?: unknown[] | null;
};

export type Model = {
  id: string;
  slug: string;
  name: string;
  description?: string | null;
  providerId?: string | null;
  provider?: { id: string; slug: string; name: string } | string | null;
  providerSlug?: string | null;
  providerName?: string | null;
  providerLogo?: string | null;
  logoUrl?: string | null;
  modality?: string | null;
  modelType?: string | null;
  creator?: string | null;
  contextWindow?: string | null;
  parameterSize?: string | null;
  releaseDate?: string | null;
  websiteUrl?: string | null;
  capabilities?: unknown[] | null;
  apiAvailable?: boolean;
  documentation?: string | null;
  promptExamples?: unknown[] | null;
  openSource?: boolean;
  primaryTask?: string | null;
  pricingModel?: string | null;
  subCategories?: unknown[] | null;
  createdAt?: string | Date | null;
};

// Raw Agent — verbatim from experiment/data/agents/raw.json (mock_aiorbit, 10 rows)
export type Agent = {
  id: string;
  slug: string;
  name: string;
  description: string;
  websiteUrl?: string | null;
  logoUrl?: string | null;
  category?: string | null;
  categorySlug?: string | null;
  primaryTask?: string | null;
  pricingModel?: string | null;
  pricingRaw?: string | null;
  hasApi?: boolean;
  isOpenSource?: boolean;
  isTrending?: boolean;
  verified?: boolean;
  compatibility?: unknown[] | null;
  avgRating?: number | null;
  reviewCount?: number;
  upvoteCount?: number;
  views?: number;
  shortDescription?: string | null;
  longDescription?: string | null;
  features?: unknown[] | null;
  useCases?: unknown[] | null;
  integrations?: unknown[] | null;
  apiDocsUrl?: string | null;
  githubUrl?: string | null;
  provider?: string | null;
  providerWebsite?: string | null;
  releaseDate?: string | Date | null;
  pros?: unknown[] | null;
  cons?: unknown[] | null;
  createdAt?: string | Date | null;
  ttasks?: unknown[] | null;
};

export type Device = {
  id: string;
  slug: string;
  name: string;
  description?: string | null;
  category?: string | null;
  manufacturer?: string | null;
  manufacturerSlug?: string | null;
  manufacturerLogoUrl?: string | null;
  manufacturerLogo?: string | null;
  imageUrl?: string | null;
  images?: unknown[] | null;
  availability?: string | null;
  price?: string | null;
  year?: string | null;
  month?: string | null;
  mainTask?: string | null;
  mainTaskColor?: string | null;
  formFactor?: string | null;
  country?: string | null;
  aiFeatures?: unknown[] | null;
  primaryUseCases?: unknown[] | null;
  buyUrl?: string | null;
};

export type Robot = {
  id: string;
  slug: string;
  name: string;
  about?: string | null;
  category?: string | null;
  company?: string | null;
  companyName?: string | null;
  country?: string | null;
  availability?: string | null;
  price?: string | null;
  releaseDate?: string | Date | null;
  mainTask?: string | null;
  autonomyLevel?: string | null;
  primaryUseCases?: unknown[] | null;
  websiteUrl?: string | null;
  specs?: string | null;
  thumbnailUrl?: string | null;
  logoUrl?: string | null;
  linkedTasks?: unknown[] | null;
  createdAt?: string | Date | null;
};

export type Repository = {
  id: string;
  slug: string;
  name: string;
  description?: string | null;
  owner?: string | null;
  ownerAvatarUrl?: string | null;
  companySlug?: string | null;
  stars?: number;
  forks?: number;
  openIssues?: number;
  language?: string | null;
  license?: string | null;
  topics?: unknown[] | null;
  url?: string | null;
  homepage?: string | null;
  logoUrl?: string | null;
  brandColor?: string | null;
  githubCreatedAt?: string | Date | null;
  syncedAt?: string | Date | null;
  subCategories?: unknown[] | null;
};

// Raw MCP item — verbatim from experiment/data/mcps/raw.json (mock_aiorbit, 209 rows)
export type Mcp = {
  id: string;
  slug: string;
  name: string;
  itemType?: string | null;
  shortDescription?: string | null;
  fullDescription?: string | null;
  providerName?: string | null;
  providerUrl?: string | null;
  license?: string | null;
  pricingType?: string | null;
  isFeatured?: boolean;
  isVerified?: boolean;
  launchDate?: string | Date | null;
  lastUpdatedDate?: string | Date | null;
  websiteUrl?: string | null;
  documentationUrl?: string | null;
  repositoryUrl?: string | null;
  qualityScore?: number | null;
  easeOfUseScore?: number | null;
  globalRank?: number | null;
  leaderboardRank?: number | null;
  editorialVerdict?: string | null;
  viewCount?: number;
  monthlyVisits?: string | null;
  upvoteCount?: number;
  saveCount?: number;
  useCases?: unknown;
  categories?: unknown;
  subCategories?: unknown;
  tags?: unknown[] | null;
  features?: unknown;
  pricingPlans?: unknown;
  createdAt?: string | Date | null;
};

// News publisher — from live /api/news sources map; articles link many-to-one
export type Source = {
  id: string;
  name: string;
  domain?: string | null;
  color?: string | null;
  followers?: string | null;
  logoUrl?: string | null;
};

// Raw News article — verbatim from experiment/data/news/raw.json (mock_aiorbit, 1734 rows)
export type News = {
  id: string;
  slug: string;
  headline: string;
  dek?: string | null;
  aiSummary?: string | null;
  articleUrl?: string | null;
  category?: string | null;
  topics?: unknown[] | null;
  sourceId?: string | null;
  source?: Source | null;
  hours?: number;
  up?: number;
  down?: number;
  score?: number;
  filters?: unknown[] | null;
  bookmarked?: boolean;
};

// Raw Video — verbatim from experiment/data/videos/raw.json (mock_aiorbit, ~4950 rows).
// Level is NOT stored: derived by hashing the video id (see lib/videoFilters).
export type Video = {
  id: string;
  slug: string;
  title: string;
  description?: string | null;
  toolName?: string | null;
  toolCategory?: string | null;
  youtubeId?: string | null;
  thumbnail?: string | null;
  durationSeconds?: number;
  views?: number;
  likes?: number;
  publishedAt?: string | Date | null;
  channelId?: string | null;
  tags?: unknown[] | null;
  accent?: string | null;
  available?: boolean;
  companyId?: string | null;
  authorName?: string | null;
  authorAvatar?: string | null;
  createdAt?: string | Date | null;
};

export type Paginated<T> = {
  data: T[];
  page: number;
  pageSize: number;
  total?: number;
};
