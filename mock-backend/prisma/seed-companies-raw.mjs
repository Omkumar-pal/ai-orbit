#!/usr/bin/env node
// Raw Company seed — verbatim from experiment/data/companies/raw.json → Company table
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

async function main() {
  const prisma = await getPrisma();
  const rawPath = join(__dirname, "..", "..", "experiment", "data", "companies", "raw.json");
  const raw = JSON.parse(await readFile(rawPath, "utf8"));
  const companies = raw.companies ?? raw.items ?? [];
  console.log(`[seed-raw] loaded ${companies.length} from ${rawPath}`);

  let inserted = 0, updated = 0;
  for (let i = 0; i < companies.length; i++) {
    const c = companies[i];
    const data = {
      id: c.id,
      slug: c.slug,
      name: c.name,
      logoUrl: c.logoUrl ?? null,
      description: c.description ?? "",
      website: c.website ?? null,
      country: c.country ?? null,
      city: c.city ?? null,
      foundedYear: c.foundedYear ?? null,
      type: c.type ?? [],
      sector: c.sector ?? null,
      verified: !!c.verified,
      featured: !!c.featured,
      valuation: c.valuation != null ? String(c.valuation) : null,
      fundingRaised: c.fundingRaised != null ? String(c.fundingRaised) : null,
      latestFundingRound: c.latestFundingRound ?? null,
      employeeCount: c.employeeCount ?? null,
      linkedinUrl: c.linkedinUrl ?? null,
      twitterUrl: c.twitterUrl ?? null,
      views: c.views ?? 0,
      upvotes: c.upvotes ?? 0,
      impressions: c.impressions ?? 0,
      createdAt: toDate(c.createdAt),
      updatedAt: toDate(c.updatedAt),
      tools: c.tools ?? [],
      aiModels: c.aiModels ?? [],
      toolsCount: c._count?.tools ?? 0,
      aiModelsCount: c._count?.aiModels ?? 0,
    };

    const existing = await prisma.company.findUnique({ where: { slug: data.slug } });
    if (existing) {
      await prisma.company.update({ where: { slug: data.slug }, data });
      updated++;
    } else {
      await prisma.company.create({ data });
      inserted++;
    }
    if ((i + 1) % 500 === 0) console.log(`[seed-raw] ${i + 1}/${companies.length}`);
  }
  console.log(`[seed-raw] done — inserted ${inserted}, updated ${updated}`);
  const total = await prisma.company.count();
  console.log(`[seed-raw] verify Company count → ${total}`);
  const sample = await prisma.company.findUnique({ where: { slug: "txt-outlines" } });
  console.log(`[seed-raw] txt-outlines:`, sample ? `${sample.name} ${sample.sector} ${sample.country} upvotes=${sample.upvotes}` : "not found");
  await prisma.$disconnect();
}

main().catch((e) => { console.error(e); process.exit(1); });
