#!/usr/bin/env node
// Raw Device seed — experiment/data/devices/raw.json (top-level array) → Device table
import { readFile } from "node:fs/promises";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));

async function getPrisma() {
  const { PrismaClient } = await import("@prisma/client");
  return new PrismaClient();
}

function strArr(v) {
  if (!Array.isArray(v)) return [];
  return v.map(String);
}

async function main() {
  const prisma = await getPrisma();
  const rawPath = join(__dirname, "..", "..", "experiment", "data", "devices", "raw.json");
  const devices = JSON.parse(await readFile(rawPath, "utf8"));
  console.log(`[seed-devices] loaded ${devices.length} from ${rawPath}`);

  let inserted = 0, updated = 0;
  for (let i = 0; i < devices.length; i++) {
    const d = devices[i];
    const data = {
      name: d.name ?? d.slug,
      imageUrl: d.imageUrl ?? null,
      manufacturer: d.manufacturer ?? null,
      manufacturerSlug: d.manufacturerSlug ?? null,
      manufacturerLogo: d.manufacturerLogoUrl ?? null,
      category: d.category ?? null,
      availability: d.availability ?? null,
      price: d.price != null ? String(d.price) : null,
      year: d.year != null ? String(d.year) : null,
      month: d.month ?? null,
      description: d.description ?? null,
      images: strArr(d.images),
      mainTask: d.mainTask ?? null,
      mainTaskColor: d.mainTaskColor ?? null,
      formFactor: d.formFactor ?? null,
      country: d.country ?? null,
      aiFeatures: strArr(d.aiFeatures),
      primaryUseCases: strArr(d.primaryUseCases),
      buyUrl: d.buyUrl ?? null,
    };
    const existing = await prisma.device.findUnique({ where: { slug: d.slug } });
    if (existing) {
      await prisma.device.update({ where: { slug: d.slug }, data });
      updated++;
    } else {
      await prisma.device.create({ data: { id: d.id ?? d.slug, slug: d.slug, ...data } });
      inserted++;
    }
    if ((i + 1) % 200 === 0) console.log(`[seed-devices] ${i + 1}/${devices.length}`);
  }
  console.log(`[seed-devices] done — inserted ${inserted}, updated ${updated}`);
  console.log(`[seed-devices] verify Device count → ${await prisma.device.count()}`);
  await prisma.$disconnect();
}

main().catch((e) => { console.error(e); process.exit(1); });
