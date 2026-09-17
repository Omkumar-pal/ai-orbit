#!/usr/bin/env node
// Raw News seed — experiment/data/news/raw.json → News table + Source table.
// Publishers resolve via ONE live /api/news call (sources map id → {name, domain, ...}).
// Fallback when an id is missing from the map: hostname of the articleUrl.
import { readFile } from "node:fs/promises";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const LIVE_NEWS = "https://ai-orbit.palamrendra-pm.workers.dev/api/news";

async function getPrisma() {
  const { PrismaClient } = await import("@prisma/client");
  return new PrismaClient();
}

function toInt(v) {
  const n = Number(v);
  return Number.isFinite(n) && n >= 0 ? Math.floor(n) : 0;
}

function strArr(v) {
  if (!Array.isArray(v)) return [];
  return v.map(String);
}

function hostOf(url) {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return null;
  }
}

function prettyHost(host) {
  if (!host) return null;
  const base = host.split(".")[0];
  return base.charAt(0).toUpperCase() + base.slice(1);
}

async function loadSources() {
  try {
    const res = await fetch(LIVE_NEWS, { headers: { "User-Agent": "Mozilla/5.0 (seed-news)" } });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const json = await res.json();
    const map = json.sources ?? {};
    console.log(`[seed-news] live sources map: ${Object.keys(map).length} entries`);
    return map;
  } catch (e) {
    console.warn(`[seed-news] live sources unavailable (${e.message}) — domain fallback only`);
    return {};
  }
}

async function main() {
  const prisma = await getPrisma();
  const rawPath = join(__dirname, "..", "..", "experiment", "data", "news", "raw.json");
  const raw = JSON.parse(await readFile(rawPath, "utf8"));
  const articles = raw.articles ?? raw.items ?? [];
  console.log(`[seed-news] loaded ${articles.length} from ${rawPath}`);
  const sources = await loadSources();

  // Upsert every source id referenced by articles (map entry or domain fallback).
  const byId = new Map();
  for (const a of articles) {
    if (!a.source || byId.has(a.source)) continue;
    const s = sources[a.source];
    byId.set(a.source, {
      id: a.source,
      name: s?.name ?? prettyHost(hostOf(a.articleUrl)) ?? a.source,
      domain: s?.domain ?? hostOf(a.articleUrl),
      color: s?.color ?? null,
      followers: s?.followers != null ? String(s.followers) : null,
      logoUrl: s?.logoUrl ?? null,
    });
  }
  let src = 0;
  for (const s of byId.values()) {
    await prisma.source.upsert({ where: { id: s.id }, update: s, create: s });
    src++;
  }
  console.log(`[seed-news] upserted ${src} sources`);

  let inserted = 0, updated = 0;
  for (let i = 0; i < articles.length; i++) {
    const a = articles[i];
    const data = {
      headline: a.headline ?? a.id,
      dek: a.dek ?? null,
      aiSummary: a.aiSummary ?? null,
      articleUrl: a.articleUrl ?? null,
      category: a.category ?? null,
      topics: strArr(a.topics),
      sourceId: a.source ?? null,
      hours: toInt(a.hours),
      up: toInt(a.up),
      down: toInt(a.down),
      score: toInt(a.score),
      filters: strArr(a.filters),
      bookmarked: !!a.bookmarked,
    };
    const existing = await prisma.news.findUnique({ where: { slug: a.id } });
    if (existing) {
      await prisma.news.update({ where: { slug: a.id }, data });
      updated++;
    } else {
      await prisma.news.create({ data: { id: a.id, slug: a.id, ...data } });
      inserted++;
    }
    if ((i + 1) % 500 === 0) console.log(`[seed-news] ${i + 1}/${articles.length}`);
  }
  console.log(`[seed-news] done — inserted ${inserted}, updated ${updated}`);
  console.log(`[seed-news] verify News=${await prisma.news.count()} Source=${await prisma.source.count()}`);
  const sample = await prisma.news.findUnique({
    where: { slug: "time100-list-of-the-most-influential-people-in-ai" },
    include: { source: true },
  });
  console.log(`[seed-news] time100:`, sample ? `${sample.headline.slice(0, 40)}… publisher=${sample.source?.name ?? "?"} hours=${sample.hours}` : "not found");
  await prisma.$disconnect();
}

main().catch((e) => { console.error(e); process.exit(1); });
