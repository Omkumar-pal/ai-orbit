import { prisma } from "@/lib/prisma";

const palette = ["#7357ff", "#2bb7a9", "#e58843", "#df5f89", "#518df7", "#c391ff"];
function hashPick(slug: string) {
  let h = 0;
  for (let i = 0; i < slug.length; i++) h = (h * 31 + slug.charCodeAt(i)) >>> 0;
  return palette[h % palette.length];
}

function formatCompact(n: number) {
  if (n >= 1e12) return `$${(n / 1e12).toFixed(1)}T`;
  if (n >= 1e9) return `$${(n / 1e9).toFixed(1)}B`;
  if (n >= 1e6) return `$${(n / 1e6).toFixed(1)}M`;
  if (n >= 1e3) return `$${(n / 1e3).toFixed(1)}K`;
  return `$${n}`;
}
function fmtVal(v: string | null | undefined) {
  if (v == null || v === "") return "--";
  const n = Number(v);
  if (isNaN(n)) return v;
  return formatCompact(n);
}
function fmtValEmp(valuation: string | null | undefined, employeeCount: number | null | undefined) {
  if (valuation == null || valuation === "" || employeeCount == null || employeeCount === 0) return "--";
  const n = Number(valuation);
  if (isNaN(n)) return "--";
  const per = n / employeeCount;
  return `${formatCompact(per)}/emp`;
}

// Map raw Company → DirectoryItem shape for DirectoryExperience table
// Type-only mapping per your request: only "AI Native" has data (type contains AI_NATIVE), others 0
// Enriched with raw fields for custom 11-col companies table (-- fallback, $1.2M/emp)
export function companyToDirectoryItem(c: any, index = 0) {
  const isAiNative = Array.isArray(c.type) && c.type.includes("AI_NATIVE");
  const isProfitable = c.latestFundingRound === "Bootstrapped" || c.latestFundingRound === "Self-funded";
  return {
    slug: c.slug,
    name: c.name,
    description: c.description ?? "",
    category: isAiNative ? "AI Native" : "Other",
    task: [c.city, c.country].filter(Boolean).join(", ") || c.sector || "View profile",
    pricing: (index % 3 === 0 ? "Paid" : index % 3 === 1 ? "Freemium" : "Free") as "Paid" | "Freemium" | "Free",
    api: !!c.website,
    verified: !!c.verified,
    accent: hashPick(c.slug),
    isTrending: !!c.featured,
    popularity: c.upvotes ?? c.views ?? 80,
    rating: c.upvotes != null ? Math.min(5, 4 + c.upvotes / 100) : 4.2,
    isNew: c.foundedYear != null ? c.foundedYear >= 2023 : false,
    // raw extras for custom companies table
    country: c.country ?? null,
    valuationRaw: c.valuation ?? null,
    valuationFmt: fmtVal(c.valuation),
    valEmpFmt: fmtValEmp(c.valuation, c.employeeCount),
    sectorRaw: c.sector ?? null,
    models: c.aiModelsCount ?? (Array.isArray(c.aiModels) ? c.aiModels.length : 0),
    tools: c.toolsCount ?? 0,
    aiNative: isAiNative,
    profitable: isProfitable,
    website: c.website ?? null,
    employeeCount: c.employeeCount ?? null,
  };
}

// Raw Video live fetch — verbatim from Video table (mock_aiorbit, ~4950 rows).
// Default order newest-first by publishedAt, matching the reference UI.
export async function videosFor() {
  return prisma.video.findMany({ orderBy: { publishedAt: "desc" } });
}
export async function videoBySlug(slug: string) {
  return prisma.video.findUnique({ where: { slug } });
}

// Paged helper for /api/v1/videos — category is a pill SLUG (see lib/videoFilters).
export async function pagedVideos(opts: {
  page: number;
  pageSize: number;
  q?: string;
  category?: string;
  sort?: string;
  dir?: string;
}) {
  const { page, pageSize, q, category, sort, dir } = opts;
  const { matchesVideoCategory, videoLevel, VIDEO_LEVEL_RANK } = await import("@/lib/videoFilters");
  const all: any[] = await prisma.video.findMany();
  const filtered = all.filter((v) => {
    if (category && !matchesVideoCategory(v, category)) return false;
    if (q) {
      const hay = `${v.title} ${v.description ?? ""} ${v.toolName ?? ""}`.toLowerCase();
      if (!hay.includes(q.toLowerCase())) return false;
    }
    return true;
  });
  const d = dir === "asc" ? 1 : -1;
  const byLevel = (v: any) => VIDEO_LEVEL_RANK[videoLevel(v.id)];
  const sorted = filtered.slice().sort((a, b) => {
    switch (sort) {
      case "name":
        return d * a.title.localeCompare(b.title);
      case "duration":
        return d * ((a.durationSeconds ?? 0) - (b.durationSeconds ?? 0));
      case "views":
        return d * ((a.views ?? 0) - (b.views ?? 0));
      case "level":
        return d * (byLevel(a) - byLevel(b));
      case "posted":
      default:
        return (
          d *
          ((a.publishedAt ? new Date(a.publishedAt).getTime() : 0) -
            (b.publishedAt ? new Date(b.publishedAt).getTime() : 0))
        );
    }
  });
  const total = sorted.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const skip = (page - 1) * pageSize;
  return { videos: sorted.slice(skip, skip + pageSize), total, page, pageSize, totalPages };
}

function titleCase(v: string | null | undefined): string | null {
  if (!v) return null;
  return v.toLowerCase().replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

// Live counts for the homepage "Explore the Ecosystem" cards.
// Six cheap indexed COUNT(*) queries — no rows fetched.
export async function exploreCounts() {
  const [tools, agents, models, companies, devices, robots] = await Promise.all([
    prisma.tool.count(),
    prisma.agent.count(),
    prisma.model.count(),
    prisma.company.count(),
    prisma.device.count(),
    prisma.robot.count(),
  ]);
  return { tools, agents, models, companies, devices, robots };
}

// Raw Model live fetch — merged table (mock_aiorbit, 600+ rows: raw dump + task links)
export async function modelsFor() {
  return prisma.model.findMany({ orderBy: [{ name: "asc" }] });
}
export async function modelBySlug(slug: string) {
  return prisma.model.findUnique({ where: { slug } });
}

// Related models: same primary task first, then same provider. Excludes self.
export async function relatedModels(slug: string, primaryTask: string | null, providerName: string | null, take = 4) {
  const all: any[] = await prisma.model.findMany({ orderBy: { name: "asc" } });
  const scored = all
    .filter((m) => m.slug !== slug)
    .map((m) => ({
      m,
      s: (primaryTask && m.primaryTask === primaryTask ? 2 : 0) + (providerName && (m.providerName ?? m.provider) === providerName ? 1 : 0),
    }))
    .filter((x) => x.s > 0)
    .sort((a, b) => b.s - a.s || a.m.name.localeCompare(b.m.name))
    .slice(0, take)
    .map((x) => x.m);
  return scored;
}

// Map raw Model → DirectoryItem shape. Pills match subCategory names (+2 special cases).
export function modelToDirectoryItem(m: any) {
  const subNames = Array.isArray(m.subCategories) ? m.subCategories.map((s: any) => s?.name).filter(Boolean) : [];
  return {
    slug: m.slug,
    name: m.name,
    description: m.description ?? "",
    category: subNames[0] ?? "Other",
    task: m.primaryTask ?? "View details",
    pricing: "Free" as const,
    api: !!m.apiAvailable,
    verified: false,
    accent: hashPick(m.slug),
    isTrending: false,
    popularity: 80,
    rating: 4.2,
    isNew: false,
    logoUrl: m.logoUrl ?? m.providerLogo ?? null,
    providerName: m.providerName ?? m.provider ?? null,
    modelType: m.modelType ?? null,
    primaryTask: m.primaryTask ?? null,
    capabilities: m.capabilities ?? [],
    releaseDate: m.releaseDate ?? null,
    openSource: !!m.openSource,
    subCategories: m.subCategories ?? [],
  };
}

// Raw Device live fetch — verbatim from Device table (mock_aiorbit, 556 rows)
export async function devicesFor() {
  return prisma.device.findMany({ orderBy: { name: "asc" } });
}
export async function deviceBySlug(slug: string) {
  return prisma.device.findUnique({ where: { slug } });
}

// Related devices: same manufacturer first, then same category. Excludes self.
export async function relatedDevices(slug: string, manufacturer: string | null, category: string | null, take = 4) {
  const all: any[] = await prisma.device.findMany({ orderBy: { name: "asc" } });
  return all
    .filter((d) => d.slug !== slug)
    .map((d) => ({
      d,
      s: (manufacturer && d.manufacturer === manufacturer ? 2 : 0) + (category && d.category === category ? 1 : 0),
    }))
    .filter((x) => x.s > 0)
    .sort((a, b) => b.s - a.s || a.d.name.localeCompare(b.d.name))
    .slice(0, take)
    .map((x) => x.d);
}

// Map raw Device → DirectoryItem shape. Pills use the keyword heuristic (see lib/entityFilters).
export function deviceToDirectoryItem(d: any) {
  return {
    slug: d.slug,
    name: d.name,
    description: d.description ?? "",
    category: d.category ?? "Other",
    task: d.mainTask ?? "View details",
    pricing: "Free" as const,
    api: false,
    verified: false,
    accent: hashPick(d.slug),
    isTrending: false,
    popularity: 80,
    rating: 4.2,
    isNew: false,
    logoUrl: d.imageUrl ?? d.manufacturerLogo ?? null,
    manufacturer: d.manufacturer ?? null,
    mainTask: d.mainTask ?? null,
    availability: titleCase(d.availability) ?? "—",
    price: d.price ?? null,
    releaseDate: d.year ?? d.month ?? null,
    aiFeatures: d.aiFeatures ?? [],
    primaryUseCases: d.primaryUseCases ?? [],
    formFactor: d.formFactor ?? null,
  };
}

// Raw Robot live fetch — verbatim from Robot table (mock_aiorbit, 1199 rows)
export async function robotsFor() {
  return prisma.robot.findMany({ orderBy: { name: "asc" } });
}
export async function robotBySlug(slug: string) {
  return prisma.robot.findUnique({ where: { slug } });
}

// Related robots: same raw category, then same company. Excludes self.
export async function relatedRobots(slug: string, category: string | null, company: string | null, take = 4) {
  const all: any[] = await prisma.robot.findMany({ orderBy: { name: "asc" } });
  return all
    .filter((r) => r.slug !== slug)
    .map((r) => ({
      r,
      s: (category && r.category === category ? 2 : 0) + (company && r.company === company ? 1 : 0),
    }))
    .filter((x) => x.s > 0)
    .sort((a, b) => b.s - a.s || a.r.name.localeCompare(b.r.name))
    .slice(0, take)
    .map((x) => x.r);
}

// Map raw Robot → DirectoryItem shape. Pills map raw categories + keywords (see lib/entityFilters).
export function robotToDirectoryItem(r: any) {
  return {
    slug: r.slug,
    name: r.name,
    description: r.about ?? r.mainTask ?? "",
    category: titleCase(r.category) ?? "Other",
    task: r.mainTask ?? "View details",
    pricing: "Free" as const,
    api: false,
    verified: false,
    accent: hashPick(r.slug),
    isTrending: false,
    popularity: 80,
    rating: 4.2,
    isNew: false,
    logoUrl: r.logoUrl ?? r.thumbnailUrl ?? null,
    company: r.company ?? null,
    country: r.country ?? null,
    rawCategory: r.category ?? null,
    availability: titleCase(r.availability) ?? "—",
    price: r.price ?? null,
    releaseDate: r.releaseDate ? new Date(r.releaseDate).toISOString() : null,
    autonomyLevel: r.autonomyLevel ?? null,
    primaryUseCases: r.primaryUseCases ?? [],
    specs: r.specs ?? null,
    about: r.about ?? null,
  };
}

// Raw Repository live fetch — verbatim from Repository table (mock_aiorbit, 10000 rows)
export async function repositoriesFor() {
  return prisma.repository.findMany({ orderBy: [{ stars: "desc" }, { name: "asc" }] });
}
export async function repositoryBySlug(slug: string) {
  return prisma.repository.findUnique({ where: { slug } });
}

function repoSubNames(r: any): string[] {
  return Array.isArray(r.subCategories) ? r.subCategories.map((s: any) => s?.name).filter(Boolean) : [];
}

// Related repositories: shared subCategory first, then same language. Excludes self.
export async function relatedRepositories(slug: string, subCategories: unknown, language: string | null, take = 4) {
  const mine = Array.isArray(subCategories) ? (subCategories as any[]).map((s: any) => s?.name).filter(Boolean) : [];
  const all: any[] = await prisma.repository.findMany({ orderBy: [{ stars: "desc" }] });
  return all
    .filter((r) => r.slug !== slug)
    .map((r) => {
      const subs = repoSubNames(r);
      return { r, s: subs.filter((s) => mine.includes(s)).length * 2 + (language && r.language === language ? 1 : 0) };
    })
    .filter((x) => x.s > 0)
    .sort((a, b) => b.s - a.s || (b.r.stars ?? 0) - (a.r.stars ?? 0))
    .slice(0, take)
    .map((x) => x.r);
}

// Map raw Repository → DirectoryItem shape. Pills match subCategory names exactly.
export function repositoryToDirectoryItem(r: any) {
  const subNames = Array.isArray(r.subCategories) ? r.subCategories.map((s: any) => s?.name).filter(Boolean) : [];
  return {
    slug: r.slug,
    name: r.name,
    description: r.description ?? "",
    category: subNames[0] ?? "Other",
    task: "View details",
    pricing: "Free" as const,
    api: false,
    verified: false,
    accent: hashPick(r.slug),
    isTrending: false,
    popularity: 80,
    rating: 4.2,
    isNew: false,
    logoUrl: r.logoUrl ?? r.ownerAvatarUrl ?? null,
    owner: r.owner ?? null,
    stars: r.stars ?? 0,
    forks: r.forks ?? 0,
    license: r.license ?? null,
    syncedAt: r.syncedAt ? new Date(r.syncedAt).toISOString() : null,
    subCategories: r.subCategories ?? [],
  };
}

// Raw MCP live fetch — verbatim from Mcp table (mock_aiorbit, 209 rows)
export async function mcpFor() {
  return prisma.mcp.findMany({ orderBy: { name: "asc" } });
}
export async function mcpBySlug(slug: string) {
  return prisma.mcp.findUnique({ where: { slug } });
}

function mcpCatName(v: unknown): string | null {
  if (v && typeof v === "object" && !Array.isArray(v)) return (v as any).name ?? null;
  return null;
}

// Related MCP items: same category, then same itemType. Excludes self.
export async function relatedMcp(slug: string, category: unknown, itemType: string | null, take = 4) {
  const cat = mcpCatName(category);
  const all: any[] = await prisma.mcp.findMany({ orderBy: { name: "asc" } });
  return all
    .filter((m) => m.slug !== slug)
    .map((m) => ({
      m,
      s: (cat && mcpCatName(m.categories) === cat ? 2 : 0) + (itemType && m.itemType === itemType ? 1 : 0),
    }))
    .filter((x) => x.s > 0)
    .sort((a, b) => b.s - a.s || a.m.name.localeCompare(b.m.name))
    .slice(0, take)
    .map((x) => x.m);
}

// Map raw Mcp → DirectoryItem shape. Pills match category/subCategory names + keywords.
export function mcpToDirectoryItem(m: any) {
  const catName = m.categories && !Array.isArray(m.categories) ? m.categories.name ?? null : null;
  return {
    slug: m.slug,
    name: m.name,
    description: m.shortDescription ?? m.fullDescription ?? "",
    category: catName ?? "Other",
    task: "View details",
    pricing: m.pricingType === "FREE" ? "Free" : ("Freemium" as const),
    api: false,
    verified: !!m.isVerified,
    accent: hashPick(m.slug),
    isTrending: !!m.isFeatured,
    popularity: m.upvoteCount ?? 80,
    rating: 4.2,
    isNew: false,
    providerName: m.providerName ?? null,
    itemType: m.itemType ?? null,
    classification: catName,
    pricingType: m.pricingType ?? null,
    releaseDate: m.launchDate ? new Date(m.launchDate).toISOString() : null,
    shortDescription: m.shortDescription ?? null,
    fullDescription: m.fullDescription ?? null,
    categories: m.categories ?? null,
    subCategories: m.subCategories ?? null,
    tags: m.tags ?? [],
    useCases: m.useCases ?? null,
  };
}

// Raw News live fetch — verbatim from News table (mock_aiorbit, 1734 rows), newest first.
// hours = article age (smaller = newer), matching the reference default sort.
export async function newsFor() {
  return prisma.news.findMany({ include: { source: true }, orderBy: { hours: "asc" } });
}
export async function newsBySlug(slug: string) {
  return prisma.news.findUnique({ where: { slug }, include: { source: true } });
}

// Related articles: same category, exclude self, top by score. Targeted query —
export async function relatedNews(slug: string, category: string | null, take = 4) {
  if (!category) return [];
  return prisma.news.findMany({
    where: { category, NOT: { slug } },
    include: { source: true },
    orderBy: [{ score: "desc" }, { hours: "asc" }],
    take,
  });
}

function publisherOf(n: any): { name: string; logoUrl: string | null; domain: string | null } {
  if (n.source) return { name: n.source.name, logoUrl: n.source.logoUrl ?? null, domain: n.source.domain ?? null };
  let domain: string | null = null;
  try {
    domain = new URL(n.articleUrl).hostname.replace(/^www\./, "");
  } catch {
    domain = null;
  }
  const base = domain ? domain.split(".")[0] : null;
  return { name: base ? base.charAt(0).toUpperCase() + base.slice(1) : "—", logoUrl: null, domain };
}

// Map raw News → DirectoryItem shape for DirectoryExperience table.
// Pills filter by the reference keyword heuristic (see lib/newsFilters), not raw category.
export function newsToDirectoryItem(n: any) {
  const pub = publisherOf(n);
  return {
    slug: n.slug,
    name: n.headline,
    description: n.dek ?? n.aiSummary ?? "",
    category: n.category ?? "Other",
    task: "",
    pricing: "Free" as const,
    api: false,
    verified: false,
    accent: hashPick(n.slug),
    isTrending: (n.hours ?? Infinity) <= 48,
    popularity: n.score ?? n.up ?? 80,
    rating: 4.2,
    isNew: (n.hours ?? Infinity) <= 48,
    // raw extras for custom news table + heuristic matcher
    headline: n.headline,
    dek: n.dek ?? null,
    aiSummary: n.aiSummary ?? null,
    articleUrl: n.articleUrl ?? null,
    topics: n.topics ?? [],
    filters: n.filters ?? [],
    hours: n.hours ?? 0,
    up: n.up ?? 0,
    down: n.down ?? 0,
    score: n.score ?? 0,
    publisherName: pub.name,
    publisherLogo: pub.logoUrl,
    publisherDomain: pub.domain,
  };
}

// Paged helpers for /api/v1/models|devices|robots|repositories|mcp.
// Category filtering reuses the same matchers as the listing (see lib/entityFilters).
export async function pagedModels(opts: { page: number; pageSize: number; q?: string; category?: string }) {
  const { page, pageSize, q, category } = opts;
  const { matchesModelCategory } = await import("@/lib/entityFilters");
  const all: any[] = await prisma.model.findMany({ orderBy: [{ name: "asc" }] });
  const filtered = all.filter((m) => {
    if (category && !matchesModelCategory(m, category)) return false;
    if (q) {
      const hay = `${m.name} ${m.description ?? ""} ${m.primaryTask ?? ""}`.toLowerCase();
      if (!hay.includes(q.toLowerCase())) return false;
    }
    return true;
  });
  const total = filtered.length;
  return { models: filtered.slice((page - 1) * pageSize, page * pageSize), total, page, pageSize, totalPages: Math.max(1, Math.ceil(total / pageSize)) };
}

export async function pagedDevices(opts: { page: number; pageSize: number; q?: string; category?: string }) {
  const { page, pageSize, q, category } = opts;
  const { matchesDeviceCategory } = await import("@/lib/entityFilters");
  const all: any[] = await prisma.device.findMany({ orderBy: { name: "asc" } });
  const filtered = all.filter((d) => {
    if (category && !matchesDeviceCategory(d, category)) return false;
    if (q) {
      const hay = `${d.name} ${d.description ?? ""} ${d.manufacturer ?? ""}`.toLowerCase();
      if (!hay.includes(q.toLowerCase())) return false;
    }
    return true;
  });
  const total = filtered.length;
  return { devices: filtered.slice((page - 1) * pageSize, page * pageSize), total, page, pageSize, totalPages: Math.max(1, Math.ceil(total / pageSize)) };
}

export async function pagedRobots(opts: { page: number; pageSize: number; q?: string; category?: string }) {
  const { page, pageSize, q, category } = opts;
  const { matchesRobotCategory } = await import("@/lib/entityFilters");
  const all: any[] = await prisma.robot.findMany({ orderBy: { name: "asc" } });
  const filtered = all.filter((r) => {
    if (category && !matchesRobotCategory(r, category)) return false;
    if (q) {
      const hay = `${r.name} ${r.about ?? ""} ${r.company ?? ""}`.toLowerCase();
      if (!hay.includes(q.toLowerCase())) return false;
    }
    return true;
  });
  const total = filtered.length;
  return { robots: filtered.slice((page - 1) * pageSize, page * pageSize), total, page, pageSize, totalPages: Math.max(1, Math.ceil(total / pageSize)) };
}

export async function pagedRepositories(opts: { page: number; pageSize: number; q?: string; category?: string }) {
  const { page, pageSize, q, category } = opts;
  const { matchesRepositoryCategory } = await import("@/lib/entityFilters");
  const all: any[] = await prisma.repository.findMany({ orderBy: [{ stars: "desc" }, { name: "asc" }] });
  const filtered = all.filter((r) => {
    if (category && !matchesRepositoryCategory(r, category)) return false;
    if (q) {
      const hay = `${r.name} ${r.description ?? ""} ${r.owner ?? ""}`.toLowerCase();
      if (!hay.includes(q.toLowerCase())) return false;
    }
    return true;
  });
  const total = filtered.length;
  return { repositories: filtered.slice((page - 1) * pageSize, page * pageSize), total, page, pageSize, totalPages: Math.max(1, Math.ceil(total / pageSize)) };
}

export async function pagedMcp(opts: { page: number; pageSize: number; q?: string; category?: string }) {
  const { page, pageSize, q, category } = opts;
  const { matchesMcpCategory } = await import("@/lib/entityFilters");
  const all: any[] = await prisma.mcp.findMany({ orderBy: { name: "asc" } });
  const filtered = all.filter((m) => {
    if (category && !matchesMcpCategory(m, category)) return false;
    if (q) {
      const hay = `${m.name} ${m.shortDescription ?? ""} ${m.providerName ?? ""}`.toLowerCase();
      if (!hay.includes(q.toLowerCase())) return false;
    }
    return true;
  });
  const total = filtered.length;
  return { items: filtered.slice((page - 1) * pageSize, page * pageSize), total, page, pageSize, totalPages: Math.max(1, Math.ceil(total / pageSize)) };
}

// Paged helper for /api/v1/news — raw News with heuristic category filter + sort.
export async function pagedNews(opts: {
  page: number;
  pageSize: number;
  q?: string;
  category?: string;
  sort?: string;
}) {
  const { page, pageSize, q, category, sort } = opts;
  const { matchesNewsCategory, matchesNewsQuery, sortNews } = await import("@/lib/newsFilters");
  const all: any[] = await prisma.news.findMany({ include: { source: true } });
  const rows = all.map((n) => {
    const pub = publisherOf(n);
    return { ...n, publisherName: pub.name };
  });
  const filtered = rows.filter((n) => {
    if (category && !matchesNewsCategory(n, category)) return false;
    if (q && !matchesNewsQuery(n, q)) return false;
    return true;
  });
  const sorted = sortNews(filtered, sort);
  const total = sorted.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const skip = (page - 1) * pageSize;
  return { news: sorted.slice(skip, skip + pageSize), total, page, pageSize, totalPages };
}

// Raw Agent live fetch — verbatim from Agent table (mock_aiorbit, 10 rows)
export async function agentsFor() {
  return prisma.agent.findMany({ orderBy: [{ upvoteCount: "desc" }, { name: "asc" }] });
}
export async function agentBySlug(slug: string) {
  return prisma.agent.findUnique({ where: { slug } });
}

function joinStrArr(v: any): string | null {
  if (!Array.isArray(v) || !v.length) return null;
  return v.map(String).join(", ");
}

// Map raw Agent → DirectoryItem shape for DirectoryExperience table.
// category = raw category string (exact pill names); extras pass through for the agents table.
export function agentToDirectoryItem(a: any) {
  const pricing =
    a.pricingModel === "FREE" ? "Free" : a.pricingModel === "PAID" ? "Paid" : ("Freemium" as const);
  return {
    slug: a.slug,
    name: a.name,
    description: a.shortDescription ?? a.description ?? "",
    category: a.category ?? "Other",
    task: a.primaryTask ?? "View details",
    pricing,
    api: !!a.hasApi,
    verified: !!a.verified,
    accent: hashPick(a.slug),
    isTrending: !!a.isTrending,
    popularity: a.upvoteCount ?? 80,
    rating: a.avgRating ?? 4.2,
    isNew: (() => {
      const d = a.releaseDate ?? a.createdAt;
      if (!d) return false;
      return new Date(d).getFullYear() >= 2023;
    })(),
    // raw extras for custom agents table
    logoUrl: a.logoUrl ?? null,
    pricingModel: a.pricingModel ?? null,
    hasOpenSource: !!a.isOpenSource,
    compatibility: joinStrArr(a.compatibility),
    releaseDate: a.releaseDate ? new Date(a.releaseDate).toISOString() : null,
  };
}

// Paged helper for /api/v1/agents — raw Agent with filters (category = raw category string)
export async function pagedAgents(opts: {
  page: number;
  pageSize: number;
  q?: string;
  category?: string;
  pricing?: string;
}) {
  const { page, pageSize, q, category, pricing } = opts;
  const where: any = {};
  if (q) {
    where.OR = [
      { name: { contains: q, mode: "insensitive" } },
      { description: { contains: q, mode: "insensitive" } },
      { primaryTask: { contains: q, mode: "insensitive" } },
      { provider: { contains: q, mode: "insensitive" } },
    ];
  }
  if (category && category !== "All") where.category = category;
  if (pricing && pricing !== "All") {
    const map = pricing === "Free" ? "FREE" : pricing === "Paid" ? "PAID" : "FREEMIUM";
    where.pricingModel = map;
  }

  const skip = (page - 1) * pageSize;
  const [items, total] = await Promise.all([
    prisma.agent.findMany({ where, skip, take: pageSize, orderBy: [{ upvoteCount: "desc" }, { name: "asc" }] }),
    prisma.agent.count({ where }),
  ]);
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  return { agents: items, total, page, pageSize, totalPages };
}

// Raw Tool live fetch — merged table (mock_aiorbit, 2500+ rows: raw dump + task links)
export async function toolsFor() {
  return prisma.tool.findMany({ orderBy: [{ upvoteCount: "desc" }, { name: "asc" }] });
}
export async function toolBySlug(slug: string, withTasks = false) {
  if (!withTasks) return prisma.tool.findUnique({ where: { slug } });
  return prisma.tool.findUnique({
    where: { slug },
    include: { tasks: { include: { task: true } } },
  });
}

function toolPrimaryCategory(t: any): string {
  const cats = Array.isArray(t.categories) ? t.categories : [];
  return cats[0]?.category?.name ?? "Other";
}

function toolFirstTask(t: any): string {
  const tt = Array.isArray(t.ttasks) ? t.ttasks : [];
  return tt[0]?.task?.title ?? "View details";
}

// Map raw Tool → DirectoryItem shape for DirectoryExperience table.
// category = primary raw category name; extras pass through for the custom tools table.
export function toolToDirectoryItem(t: any) {
  const pricing =
    t.pricingModel === "FREE" ? "Free" : t.pricingModel === "PAID" ? "Paid" : ("Freemium" as const);
  return {
    slug: t.slug,
    name: t.name,
    description: t.description ?? t.tagline ?? "",
    category: toolPrimaryCategory(t),
    task: toolFirstTask(t),
    pricing,
    api: !!t.hasApi,
    verified: !!t.verified,
    accent: hashPick(t.slug),
    isTrending: !!t.isTrending,
    popularity: t.upvoteCount ?? 80,
    rating: t.avgRating ?? 4.2,
    isNew: (() => {
      const d = t.releaseDate ?? t.createdAt;
      if (!d) return false;
      return new Date(d).getFullYear() >= 2023;
    })(),
    // raw extras for custom tools table + heuristic matcher passthrough
    logoUrl: t.logoUrl ?? null,
    pricingModel: t.pricingModel ?? null,
    hasOpenSource: !!t.isOpenSource,
    compatibility: t.compatibility ?? null,
    releaseDate: t.releaseDate ? new Date(t.releaseDate).toISOString() : null,
    useCases: t.useCases ?? null,
    categories: t.categories ?? [],
    tags: t.tags ?? [],
    ttasks: t.ttasks ?? [],
  };
}

// Raw Task live fetch — verbatim from Task table (mock_aiorbit, 115 rows)
export async function tasksFor() {
  return prisma.task.findMany({ orderBy: [{ likes: "desc" }, { title: "asc" }] });
}
export async function taskBySlug(slug: string, withRelations = false) {
  if (!withRelations) return prisma.task.findUnique({ where: { slug } });
  return prisma.task.findUnique({
    where: { slug },
    include: {
      toolsRel: { include: { tool: true }, orderBy: { position: "asc" } },
      modelsRel: { include: { model: true } },
      robotsRel: { include: { robot: true } },
      devicesRel: { include: { device: true } },
    },
  });
}

// Map raw Task → DirectoryItem shape for DirectoryExperience table
// category = real categoryName (Content Creation, Research, …) so pills filter live rows.
// Extra raw fields (iconUrl, tools/models/robots/devices) pass through for the custom tasks table.
export function taskToDirectoryItem(t: any, index = 0) {
  const pricing =
    t.pricingModel === "FREE" ? "Free" : t.pricingModel === "PAID" ? "Paid" : ("Freemium" as const);
  return {
    slug: t.slug,
    name: t.title,
    description: t.description ?? "",
    category: t.categoryName ?? "Other",
    task: t.difficulty
      ? t.difficulty.charAt(0) + t.difficulty.slice(1).toLowerCase()
      : "View details",
    pricing,
    api: false,
    verified: false,
    accent: hashPick(t.slug),
    isTrending: !!t.featured,
    popularity: t.likes ?? 80,
    rating: 4.2,
    isNew: t.createdAt != null ? new Date(t.createdAt).getFullYear() >= 2023 : false,
    // raw extras for custom tasks table
    iconUrl: t.iconUrl ?? null,
    toolsCount: t.tools ?? 0,
    modelsCount: t.models ?? 0,
    robotsCount: t.robots ?? 0,
    devicesCount: t.devices ?? 0,
  };
}

// Raw Company live fetch — verbatim from Company table (mock_aiorbit, 2234 rows)
export async function companiesFor() {
  return prisma.company.findMany({ orderBy: [{ upvotes: "desc" }, { name: "asc" }] });
}
export async function companyBySlug(slug: string) {
  return prisma.company.findUnique({ where: { slug } });
}

// Generic itemsFor — for non-companies resources still use DirectoryItem,
// except tasks which has its own raw Task table (115 rows) mapped live.
export async function itemsFor(resource: string) {
  if (resource === "companies") {
    const companies = await companiesFor();
    return companies.map((c, i) => companyToDirectoryItem(c, i));
  }
  if (resource === "tasks") {
    const tasks = await tasksFor();
    return tasks.map((t, i) => taskToDirectoryItem(t, i));
  }
  if (resource === "tools") {
    const tools = await toolsFor();
    return tools.map((t) => toolToDirectoryItem(t));
  }
  if (resource === "agents") {
    const agents = await agentsFor();
    return agents.map((a) => agentToDirectoryItem(a));
  }
  if (resource === "news") {
    const news = await newsFor();
    return news.map((n) => newsToDirectoryItem(n));
  }
  if (resource === "models") {
    const models = await modelsFor();
    return models.map((m) => modelToDirectoryItem(m));
  }
  if (resource === "devices") {
    const devices = await devicesFor();
    return devices.map((d) => deviceToDirectoryItem(d));
  }
  if (resource === "robots") {
    const robots = await robotsFor();
    return robots.map((r) => robotToDirectoryItem(r));
  }
  if (resource === "repositories") {
    const repos = await repositoriesFor();
    return repos.map((r) => repositoryToDirectoryItem(r));
  }
  if (resource === "mcp") {
    const items = await mcpFor();
    return items.map((m) => mcpToDirectoryItem(m));
  }
  if (resource === "personal" || resource === "creativity") {
    const tools = await toolsFor();
    return tools.map((t) => toolToDirectoryItem(t));
  }
  return prisma.directoryItem.findMany({
    where: { resource },
    orderBy: [{ popularity: "desc" }, { name: "asc" }],
  });
}

// Paged helper for /api/v1/tools — merged Tool table with filters.
// Category is a pill SLUG filtered by the reference keyword heuristic (see lib/toolFilters).
export async function pagedTools(opts: {
  page: number;
  pageSize: number;
  q?: string;
  category?: string;
  pricing?: string;
}) {
  const { page, pageSize, q, category, pricing } = opts;
  const all = await prisma.tool.findMany({ orderBy: [{ upvoteCount: "desc" }, { name: "asc" }] });
  const { matchesToolCategory } = await import("@/lib/toolFilters");
  const filtered = all.filter((t: any) => {
    if (category && !matchesToolCategory(t, category)) return false;
    if (pricing && pricing !== "All") {
      const p = t.pricingModel === "FREE" ? "Free" : t.pricingModel === "PAID" ? "Paid" : "Freemium";
      if (p !== pricing) return false;
    }
    if (q) {
      const hay = `${t.name} ${t.description ?? ""} ${t.tagline ?? ""}`.toLowerCase();
      if (!hay.includes(q.toLowerCase())) return false;
    }
    return true;
  });
  const total = filtered.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const skip = (page - 1) * pageSize;
  return { tools: filtered.slice(skip, skip + pageSize), total, page, pageSize, totalPages };
}

// Paged helper for /api/v1/tasks — raw Task with filters
export async function pagedTasks(opts: {
  page: number;
  pageSize: number;
  q?: string;
  category?: string;
}) {
  const { page, pageSize, q, category } = opts;
  const where: any = {};
  if (q) {
    where.OR = [
      { title: { contains: q, mode: "insensitive" } },
      { description: { contains: q, mode: "insensitive" } },
      { categoryName: { contains: q, mode: "insensitive" } },
    ];
  }
  if (category && category !== "All") where.categoryName = category;

  const skip = (page - 1) * pageSize;
  const [items, total] = await Promise.all([
    prisma.task.findMany({ where, skip, take: pageSize, orderBy: [{ likes: "desc" }, { title: "asc" }] }),
    prisma.task.count({ where }),
  ]);
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  return { tasks: items, total, page, pageSize, totalPages };
}

// Paged helper for /api/v1/companies — raw Company with filters (type-only)
export async function pagedCompanies(opts: {
  page: number;
  pageSize: number;
  q?: string;
  sector?: string;
  category?: string;
  verified?: string;
}) {
  const { page, pageSize, q, sector, category, verified } = opts;
  const where: any = {};
  if (q) {
    where.OR = [
      { name: { contains: q, mode: "insensitive" } },
      { description: { contains: q, mode: "insensitive" } },
      { sector: { contains: q, mode: "insensitive" } },
      { country: { contains: q, mode: "insensitive" } },
    ];
  }
  const cat = sector ?? category;
  if (cat && cat !== "All") {
    if (cat === "AI Native") where.type = { has: "AI_NATIVE" };
    else where.id = "__none__"; // 0 rows for other 12 categories (type-only has no data)
  }
  if (verified === "true") where.verified = true;
  if (verified === "false") where.verified = false;

  const skip = (page - 1) * pageSize;
  const [items, total] = await Promise.all([
    prisma.company.findMany({ where, skip, take: pageSize, orderBy: { upvotes: "desc" } }),
    prisma.company.count({ where }),
  ]);
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  return { companies: items, total, page, pageSize, totalPages };
}
