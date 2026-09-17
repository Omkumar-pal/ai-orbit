#!/usr/bin/env node
// Raw Video seed — experiment/data/videos/raw.json (.videos array) → Video table
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
  const rawPath = join(__dirname, "..", "..", "experiment", "data", "videos", "raw.json");
  const raw = JSON.parse(await readFile(rawPath, "utf8"));
  const videos = raw.videos ?? raw.items ?? [];
  console.log(`[seed-videos] loaded ${videos.length} from ${rawPath}`);

  let inserted = 0, updated = 0;
  for (let i = 0; i < videos.length; i++) {
    const v = videos[i];
    const data = {
      title: v.title ?? v.slug,
      description: v.description ?? null,
      toolName: v.toolName ?? null,
      toolCategory: v.toolCategory ?? null,
      youtubeId: v.youtubeId ?? null,
      thumbnail: v.thumbnail ?? null,
      durationSeconds: toInt(v.durationSeconds),
      views: toInt(v.views),
      likes: toInt(v.likes),
      publishedAt: toDate(v.publishedAt),
      channelId: v.channelId ?? null,
      tags: strArr(v.tags),
      accent: v.accent ?? null,
      available: v.available ?? true,
      companyId: v.companyId ?? null,
      authorName: v.author?.name ?? null,
      authorAvatar: v.author?.avatar ?? null,
      createdAt: toDate(v.createdAt),
      updatedAt: toDate(v.updatedAt),
    };
    const existing = await prisma.video.findUnique({ where: { slug: v.slug } });
    if (existing) {
      await prisma.video.update({ where: { slug: v.slug }, data });
      updated++;
    } else {
      await prisma.video.create({ data: { id: v.id ?? v.slug, slug: v.slug, ...data } });
      inserted++;
    }
    if ((i + 1) % 1000 === 0) console.log(`[seed-videos] ${i + 1}/${videos.length}`);
  }
  console.log(`[seed-videos] done — inserted ${inserted}, updated ${updated}`);
  console.log(`[seed-videos] verify Video count → ${await prisma.video.count()}`);
  const sample = await prisma.video.findUnique({ where: { slug: "why-i-am-so-smart-as-a-million-OcBLZu" } });
  console.log(`[seed-videos] dialog sample:`, sample ? `${sample.title.slice(0, 40)}… yt=${sample.youtubeId}` : "not found");
  await prisma.$disconnect();
}

main().catch((e) => { console.error(e); process.exit(1); });
