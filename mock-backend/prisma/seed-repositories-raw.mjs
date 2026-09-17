#!/usr/bin/env node
// Raw Repository seed — experiment/data/repositories/raw.json (.items, 10k rows) → Repository table
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

function strArr(v) {
  if (!Array.isArray(v)) return [];
  return v.map(String);
}

async function main() {
  const prisma = await getPrisma();
  const rawPath = join(__dirname, "..", "..", "experiment", "data", "repositories", "raw.json");
  const raw = JSON.parse(await readFile(rawPath, "utf8"));
  const repos = raw.items ?? [];
  console.log(`[seed-repos] loaded ${repos.length} from ${rawPath}`);

  let inserted = 0, updated = 0;
  for (let i = 0; i < repos.length; i++) {
    const r = repos[i];
    const data = {
      name: r.name ?? r.slug,
      owner: r.owner ?? null,
      ownerAvatarUrl: r.ownerAvatarUrl ?? null,
      description: r.description ?? null,
      url: r.url ?? null,
      homepage: r.homepage ?? null,
      language: r.language ?? null,
      license: r.license ?? null,
      topics: strArr(r.topics),
      stars: toInt(r.stars),
      forks: toInt(r.forks),
      openIssues: toInt(r.openIssues),
      logoUrl: r.logoUrl ?? null,
      brandColor: r.brandColor ?? null,
      githubCreatedAt: toDate(r.githubCreatedAt),
      syncedAt: toDate(r.syncedAt),
      subCategories: r.subCategories ?? [],
      companySlug: r.companySlug ?? null,
    };
    const existing = await prisma.repository.findUnique({ where: { slug: r.slug } });
    if (existing) {
      await prisma.repository.update({ where: { slug: r.slug }, data });
      updated++;
    } else {
      await prisma.repository.create({ data: { id: r.id ?? r.slug, slug: r.slug, ...data } });
      inserted++;
    }
    if ((i + 1) % 2000 === 0) console.log(`[seed-repos] ${i + 1}/${repos.length}`);
  }
  console.log(`[seed-repos] done — inserted ${inserted}, updated ${updated}`);
  console.log(`[seed-repos] verify Repository count → ${await prisma.repository.count()}`);
  await prisma.$disconnect();
}

main().catch((e) => { console.error(e); process.exit(1); });
