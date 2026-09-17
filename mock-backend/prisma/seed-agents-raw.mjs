#!/usr/bin/env node
// Raw Agent seed — verbatim from experiment/data/agents/raw.json → Agent table
import { readFile } from "node:fs/promises";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));

async function getPrisma() {
  const { PrismaClient } = await import("@prisma/client");
  return new PrismaClient();
}

function toDate(v) {
  if (!v) return null;
  const d = new Date(v);
  return isNaN(d.getTime()) ? null : d;
}

function toNum(v) {
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}

function toInt(v) {
  const n = Number(v);
  return Number.isFinite(n) && n >= 0 ? Math.floor(n) : 0;
}

function strArr(v) {
  if (!Array.isArray(v)) return [];
  return v.map(String);
}

async function main() {
  const prisma = await getPrisma();
  const rawPath = join(__dirname, "..", "..", "experiment", "data", "agents", "raw.json");
  const raw = JSON.parse(await readFile(rawPath, "utf8"));
  const agents = raw.agents ?? raw.items ?? [];
  console.log(`[seed-agents] loaded ${agents.length} from ${rawPath}`);

  let inserted = 0, updated = 0;
  for (const a of agents) {
    const data = {
      name: a.name ?? a.slug,
      description: a.description ?? "",
      websiteUrl: a.websiteUrl ?? null,
      logoUrl: a.logoUrl ?? null,
      category: a.category ?? null,
      categorySlug: a.categorySlug ?? null,
      primaryTask: a.primaryTask ?? null,
      pricingModel: a.pricingModel ?? null,
      pricingRaw: a.pricingRaw ?? null,
      hasApi: !!a.hasApi,
      isOpenSource: !!a.isOpenSource,
      isTrending: !!a.isTrending,
      verified: !!a.verified,
      isVerified: !!a.isVerified,
      compatibility: strArr(a.compatibility),
      source: a.source ?? null,
      avgRating: toNum(a.avgRating),
      reviewCount: toInt(a.reviewCount),
      upvoteCount: toInt(a.upvoteCount),
      views: toInt(a.views),
      shortDescription: a.shortDescription ?? null,
      longDescription: a.longDescription ?? null,
      features: strArr(a.features),
      useCases: strArr(a.useCases),
      integrations: strArr(a.integrations),
      apiDocsUrl: a.apiDocsUrl ?? null,
      githubUrl: a.githubUrl ?? null,
      provider: a.provider ?? null,
      providerWebsite: a.providerWebsite ?? null,
      releaseDate: toDate(a.releaseDate),
      pros: strArr(a.pros),
      cons: strArr(a.cons),
      createdAt: toDate(a.createdAt),
      updatedAt: toDate(a.updatedAt),
      ttasks: a.ttasks ?? [],
    };

    const existing = await prisma.agent.findUnique({ where: { slug: a.slug } });
    if (existing) {
      await prisma.agent.update({ where: { slug: a.slug }, data });
      updated++;
    } else {
      await prisma.agent.create({ data: { id: a.id ?? a.slug, slug: a.slug, ...data } });
      inserted++;
    }
  }
  console.log(`[seed-agents] done — inserted ${inserted}, updated ${updated}`);
  console.log(`[seed-agents] verify Agent count → ${await prisma.agent.count()}`);
  const sample = await prisma.agent.findUnique({ where: { slug: "ai-agent-neo" } });
  console.log(`[seed-agents] ai-agent-neo:`, sample ? `${sample.name} ${sample.category} ${sample.primaryTask}` : "not found");
  await prisma.$disconnect();
}

main().catch((e) => { console.error(e); process.exit(1); });
