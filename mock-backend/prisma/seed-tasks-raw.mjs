#!/usr/bin/env node
// Raw Task seed — verbatim from experiment/data/tasks/raw.json → Task table
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

async function main() {
  const prisma = await getPrisma();
  const rawPath = join(__dirname, "..", "..", "experiment", "data", "tasks", "raw.json");
  const raw = JSON.parse(await readFile(rawPath, "utf8"));
  const tasks = raw.tasks ?? raw.items ?? [];
  console.log(`[seed-tasks] loaded ${tasks.length} from ${rawPath}`);

  let inserted = 0, updated = 0;
  for (let i = 0; i < tasks.length; i++) {
    const t = tasks[i];
    const data = {
      id: t.id,
      slug: t.slug,
      title: t.title,
      description: t.description ?? "",
      iconUrl: t.iconUrl ?? null,
      categoryId: t.category?.id ?? null,
      categoryName: t.category?.name ?? null,
      categorySlug: t.category?.slug ?? null,
      creator: t.creator ?? null,
      difficulty: t.difficulty ?? null,
      pricingModel: t.pricingModel ?? null,
      featured: !!t.isFeatured,
      createdAt: toDate(t.createdAt),
      likes: toInt(t.likes),
      subscribers: toInt(t.subscribers),
      saves: toInt(t.saves),
      resources: toInt(t.resources),
      tools: toInt(t.tools),
      models: toInt(t.models),
      robots: toInt(t.robots),
      devices: toInt(t.devices),
    };

    const existing = await prisma.task.findUnique({ where: { slug: data.slug } });
    if (existing) {
      await prisma.task.update({ where: { slug: data.slug }, data });
      updated++;
    } else {
      await prisma.task.create({ data });
      inserted++;
    }
    if ((i + 1) % 50 === 0) console.log(`[seed-tasks] ${i + 1}/${tasks.length}`);
  }
  console.log(`[seed-tasks] done — inserted ${inserted}, updated ${updated}`);
  const total = await prisma.task.count();
  console.log(`[seed-tasks] verify Task count → ${total}`);
  const sample = await prisma.task.findUnique({ where: { slug: "ground-answers-in-docs" } });
  console.log(`[seed-tasks] ground-answers-in-docs:`, sample ? `${sample.title} ${sample.categoryName} tools=${sample.tools}` : "not found");
  await prisma.$disconnect();
}

main().catch((e) => { console.error(e); process.exit(1); });
