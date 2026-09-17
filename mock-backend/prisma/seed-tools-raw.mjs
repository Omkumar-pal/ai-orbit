#!/usr/bin/env node
// Raw Tool seed — merges experiment/data/tools/raw.json into Tool table.
// Merge rule: upsert by slug, fill NEW columns + refresh scalars, but NEVER
// overwrite tagline/visitUrl (only the task-link seed provides those).
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

function toStr(v) {
  return v == null ? null : String(v);
}

function toNum(v) {
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}

function joinCompat(v) {
  if (v == null) return null;
  if (Array.isArray(v)) return v.length ? v.map(String).join(", ") : null;
  return String(v);
}

async function main() {
  const prisma = await getPrisma();
  const rawPath = join(__dirname, "..", "..", "experiment", "data", "tools", "raw.json");
  const raw = JSON.parse(await readFile(rawPath, "utf8"));
  const tools = raw.tools ?? raw.items ?? [];
  console.log(`[seed-tools] loaded ${tools.length} from ${rawPath}`);

  let inserted = 0, updated = 0;
  for (let i = 0; i < tools.length; i++) {
    const t = tools[i];
    const data = {
      name: t.name ?? t.slug,
      logoUrl: t.logoUrl ?? null,
      description: t.description ?? null,
      pricingModel: t.pricingModel ?? null,
      pricingAmount: toStr(t.pricingAmount),
      billingFrequency: t.billingFrequency ?? null,
      avgRating: toNum(t.avgRating),
      upvoteCount: Number.isFinite(Number(t.upvoteCount)) ? Number(t.upvoteCount) : 0,
      hasApi: !!t.hasApi,
      isOpenSource: !!t.isOpenSource,
      isTrending: !!t.isTrending,
      verified: !!t.verified,
      compatibility: joinCompat(t.compatibility),
      releaseDate: toDate(t.releaseDate),
      launchDate: toDate(t.launchDate),
      useCases: Array.isArray(t.useCases) ? (t.useCases.length ? t.useCases.map(String).join(", ") : null) : (t.useCases ?? null),
      categories: t.categories ?? [],
      tags: t.tags ?? [],
      ttasks: t.ttasks ?? [],
    };

    const existing = await prisma.tool.findUnique({ where: { slug: t.slug } });
    if (existing) {
      // Preserve task-seeded exclusives (tagline/visitUrl) when raw lacks them.
      await prisma.tool.update({
        where: { slug: t.slug },
        data: {
          ...data,
          tagline: existing.tagline ?? null,
          visitUrl: existing.visitUrl ?? null,
        },
      });
      updated++;
    } else {
      await prisma.tool.create({
        data: { id: t.id ?? t.slug, slug: t.slug, tagline: null, visitUrl: null, ...data },
      });
      inserted++;
    }
    if ((i + 1) % 500 === 0) console.log(`[seed-tools] ${i + 1}/${tools.length}`);
  }
  console.log(`[seed-tools] done — inserted ${inserted}, updated ${updated}`);
  console.log(`[seed-tools] verify Tool count → ${await prisma.tool.count()}`);
  const sample = await prisma.tool.findUnique({ where: { slug: "wan-30" } });
  console.log(`[seed-tools] wan-30:`, sample ? `${sample.name} ${sample.pricingModel} verified=${sample.verified} upvotes=${sample.upvoteCount}` : "not found");
  await prisma.$disconnect();
}

main().catch((e) => { console.error(e); process.exit(1); });
