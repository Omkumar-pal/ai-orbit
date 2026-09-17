#!/usr/bin/env node
// Raw MCP seed — experiment/data/mcps/raw.json (.data.items, 209 rows) → Mcp table
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

function toInt(v) {
  const n = Number(v);
  return Number.isFinite(n) && n >= 0 ? Math.floor(n) : 0;
}

function toNum(v) {
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}

async function main() {
  const prisma = await getPrisma();
  const rawPath = join(__dirname, "..", "..", "experiment", "data", "mcps", "raw.json");
  const raw = JSON.parse(await readFile(rawPath, "utf8"));
  const items = raw.data?.items ?? [];
  console.log(`[seed-mcp] loaded ${items.length} from ${rawPath}`);

  let inserted = 0, updated = 0;
  for (const m of items) {
    const data = {
      name: m.name ?? m.slug,
      itemType: m.itemType ?? null,
      shortDescription: m.shortDescription ?? null,
      fullDescription: m.fullDescription ?? null,
      providerName: m.providerName ?? null,
      providerUrl: m.providerUrl ?? null,
      license: m.license ?? null,
      pricingType: m.pricingType ?? null,
      isFeatured: !!m.isFeatured,
      isVerified: !!m.isVerified,
      launchDate: toDate(m.launchDate),
      lastUpdatedDate: toDate(m.lastUpdatedDate),
      websiteUrl: m.websiteUrl ?? null,
      documentationUrl: m.documentationUrl ?? null,
      repositoryUrl: m.repositoryUrl ?? null,
      qualityScore: toNum(m.qualityScore),
      easeOfUseScore: toNum(m.easeOfUseScore),
      globalRank: m.globalRank != null ? toInt(m.globalRank) : null,
      leaderboardRank: m.leaderboardRank != null ? toInt(m.leaderboardRank) : null,
      editorialVerdict: m.editorialVerdict ?? null,
      viewCount: toInt(m.viewCount),
      monthlyVisits: m.monthlyVisits != null ? String(m.monthlyVisits) : null,
      upvoteCount: toInt(m.upvoteCount),
      saveCount: toInt(m.saveCount),
      technicalSpecs: m.technicalSpecs ?? null,
      installationGuides: m.installationGuides ?? null,
      useCases: m.useCases ?? null,
      categories: m.categories ?? null,
      subCategories: m.subCategories ?? null,
      tags: m.tags ?? [],
      features: m.features ?? null,
      pricingPlans: m.pricingPlans ?? null,
      reviews: m.reviews ?? null,
      editorialReviews: m.editorialReviews ?? null,
      discussions: m.discussions ?? null,
      faqs: m.faqs ?? null,
      createdAt: toDate(m.createdAt),
      updatedAt: toDate(m.updatedAt),
    };
    const existing = await prisma.mcp.findUnique({ where: { slug: m.slug } });
    if (existing) {
      await prisma.mcp.update({ where: { slug: m.slug }, data });
      updated++;
    } else {
      await prisma.mcp.create({ data: { id: m.id ?? m.slug, slug: m.slug, ...data } });
      inserted++;
    }
  }
  console.log(`[seed-mcp] done — inserted ${inserted}, updated ${updated}`);
  console.log(`[seed-mcp] verify Mcp count → ${await prisma.mcp.count()}`);
  const sample = await prisma.mcp.findUnique({ where: { slug: "vscode-mcp-extension" } });
  console.log(`[seed-mcp] vscode-mcp-extension:`, sample ? `${sample.name} ${sample.itemType} ${sample.pricingType}` : "not found");
  await prisma.$disconnect();
}

main().catch((e) => { console.error(e); process.exit(1); });
