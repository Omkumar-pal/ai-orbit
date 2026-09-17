#!/usr/bin/env node
// Raw Robot seed — experiment/data/robots/raw.json (top-level array) → Robot table
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
  const rawPath = join(__dirname, "..", "..", "experiment", "data", "robots", "raw.json");
  const robots = JSON.parse(await readFile(rawPath, "utf8"));
  console.log(`[seed-robots] loaded ${robots.length} from ${rawPath}`);

  let inserted = 0, updated = 0;
  for (let i = 0; i < robots.length; i++) {
    const r = robots[i];
    const data = {
      name: r.name ?? r.slug,
      logoUrl: r.logoUrl ?? null,
      thumbnailUrl: r.thumbnailUrl ?? null,
      company: r.company ?? null,
      country: r.country ?? null,
      category: r.category ?? null,
      availability: r.availability ?? null,
      price: r.price != null ? String(r.price) : null,
      releaseDate: toDate(r.releaseDate),
      mainTask: r.mainTask ?? null,
      autonomyLevel: r.autonomyLevel ?? null,
      primaryUseCases: strArr(r.primaryUseCases),
      websiteUrl: r.websiteUrl ?? null,
      about: r.about ?? null,
      specs: r.specs ?? null,
      linkedTasks: r.tasks ?? [],
      createdAt: toDate(r.createdAt),
      updatedAt: toDate(r.updatedAt),
    };
    const existing = await prisma.robot.findUnique({ where: { slug: r.slug } });
    if (existing) {
      await prisma.robot.update({ where: { slug: r.slug }, data });
      updated++;
    } else {
      await prisma.robot.create({ data: { id: r.id ?? r.slug, slug: r.slug, ...data } });
      inserted++;
    }
    if ((i + 1) % 300 === 0) console.log(`[seed-robots] ${i + 1}/${robots.length}`);
  }
  console.log(`[seed-robots] done — inserted ${inserted}, updated ${updated}`);
  console.log(`[seed-robots] verify Robot count → ${await prisma.robot.count()}`);
  await prisma.$disconnect();
}

main().catch((e) => { console.error(e); process.exit(1); });
