#!/usr/bin/env node
// Raw Model seed — merges experiment/data/models/raw.json (.items) into Model table.
// Merge rule: update everything from raw, but preserve task-seeded logoUrl/pricingModel
// (raw dump carries neither).
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

function strArr(v) {
  if (!Array.isArray(v)) return [];
  return v.map(String);
}

async function main() {
  const prisma = await getPrisma();
  const rawPath = join(__dirname, "..", "..", "experiment", "data", "models", "raw.json");
  const raw = JSON.parse(await readFile(rawPath, "utf8"));
  const models = raw.items ?? [];
  console.log(`[seed-models] loaded ${models.length} from ${rawPath}`);

  let inserted = 0, updated = 0;
  for (let i = 0; i < models.length; i++) {
    const m = models[i];
    const data = {
      name: m.name ?? m.slug,
      provider: m.provider?.name ?? null,
      providerId: m.provider?.id ?? m.providerId ?? null,
      providerSlug: m.provider?.slug ?? null,
      providerName: m.provider?.name ?? null,
      providerLogo: m.provider?.logoUrl ?? null,
      modelType: m.modelType ?? null,
      creator: m.creator ?? null,
      contextWindow: m.contextWindow != null ? String(m.contextWindow) : null,
      parameterSize: m.parameterSize != null ? String(m.parameterSize) : null,
      modality: m.modality ?? null,
      releaseDate: m.releaseDate != null ? String(m.releaseDate) : null,
      description: m.description ?? null,
      websiteUrl: m.websiteUrl ?? null,
      capabilities: strArr(m.capabilities),
      apiAvailable: !!m.apiAvailable,
      documentation: m.documentation ?? null,
      promptExamples: strArr(m.promptExamples),
      openSource: !!m.openSource,
      primaryTask: m.primaryTask ?? null,
      subCategories: m.subCategories ?? [],
      createdAt: toDate(m.createdAt),
      updatedAt: toDate(m.updatedAt),
    };
    const existing = await prisma.model.findUnique({ where: { slug: m.slug } });
    if (existing) {
      await prisma.model.update({
        where: { slug: m.slug },
        data: { ...data, logoUrl: existing.logoUrl ?? null, pricingModel: existing.pricingModel ?? null },
      });
      updated++;
    } else {
      await prisma.model.create({ data: { id: m.id ?? m.slug, slug: m.slug, ...data } });
      inserted++;
    }
    if ((i + 1) % 200 === 0) console.log(`[seed-models] ${i + 1}/${models.length}`);
  }
  console.log(`[seed-models] done — inserted ${inserted}, updated ${updated}`);
  console.log(`[seed-models] verify Model count → ${await prisma.model.count()}`);
  await prisma.$disconnect();
}

main().catch((e) => { console.error(e); process.exit(1); });
