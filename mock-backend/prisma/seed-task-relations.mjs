#!/usr/bin/env node
// Task relations seed — per-task live API → Tool/Model entities + TaskTool/TaskModel links.
// Source: https://ai-orbit.palamrendra-pm.workers.dev/api/v1/tasks/{slug}
// - toolItems[]      → Tool upsert (id = slug) + TaskTool link
// - popularTools[]   → same Tools, TaskTool.isPopular = true (live "Most popular" pill)
// - popularModels[]  → Model upsert (id = slug) + TaskModel link
// - robots/devices   → no mapping source (counts only); tables stay empty by design.
const API = "https://ai-orbit.palamrendra-pm.workers.dev/api/v1/tasks";
const DELAY_MS = 300;

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

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

async function fetchTaskDetail(slug) {
  const res = await fetch(`${API}/${encodeURIComponent(slug)}`, {
    headers: { "User-Agent": "Mozilla/5.0 (seed-task-relations)" },
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

async function main() {
  const prisma = await getPrisma();
  const tasks = await prisma.task.findMany({ select: { id: true, slug: true }, orderBy: { slug: "asc" } });
  console.log(`[seed-rel] seeding relations for ${tasks.length} tasks`);

  let tools = 0, models = 0, links = 0, failed = 0;
  for (let i = 0; i < tasks.length; i++) {
    const { id: taskId, slug } = tasks[i];
    try {
      const json = await fetchTaskDetail(slug);
      const t = json.task ?? json.data ?? json;
      const toolItems = t.toolItems ?? [];
      const popularSlugs = new Set((t.popularTools ?? []).map((p) => p.slug));
      const popularModels = t.popularModels ?? [];

      for (const item of toolItems) {
        if (!item?.slug) continue;
        await prisma.tool.upsert({
          where: { slug: item.slug },
          update: {
            name: item.name ?? item.slug,
            logoUrl: item.logoUrl ?? null,
            tagline: item.tagline ?? null,
            pricingModel: item.pricingModel ?? null,
            pricingAmount: toStr(item.pricingAmount),
            billingFrequency: item.billingFrequency ?? null,
            hasApi: !!item.hasApi,
            isOpenSource: !!item.isOpenSource,
            compatibility: Array.isArray(item.compatibility) ? item.compatibility.join(", ") : (item.compatibility ?? null),
            releaseDate: toDate(item.releaseDate),
            visitUrl: item.visitUrl ?? null,
          },
          create: {
            id: item.slug,
            slug: item.slug,
            name: item.name ?? item.slug,
            logoUrl: item.logoUrl ?? null,
            tagline: item.tagline ?? null,
            pricingModel: item.pricingModel ?? null,
            pricingAmount: toStr(item.pricingAmount),
            billingFrequency: item.billingFrequency ?? null,
            hasApi: !!item.hasApi,
            isOpenSource: !!item.isOpenSource,
            compatibility: Array.isArray(item.compatibility) ? item.compatibility.join(", ") : (item.compatibility ?? null),
            releaseDate: toDate(item.releaseDate),
            visitUrl: item.visitUrl ?? null,
          },
        });
        tools++;
      }
      // Popular tools may not be in toolItems — ensure they exist as Tools too.
      for (const p of t.popularTools ?? []) {
        if (!p?.slug) continue;
        await prisma.tool.upsert({
          where: { slug: p.slug },
          update: { name: p.name ?? p.slug, logoUrl: p.logoUrl ?? null, tagline: p.tagline ?? null, pricingModel: p.pricingModel ?? null, visitUrl: p.visitUrl ?? null },
          create: { id: p.slug, slug: p.slug, name: p.name ?? p.slug, logoUrl: p.logoUrl ?? null, tagline: p.tagline ?? null, pricingModel: p.pricingModel ?? null, visitUrl: p.visitUrl ?? null },
        });
      }
      for (const m of popularModels) {
        if (!m?.slug) continue;
        await prisma.model.upsert({
          where: { slug: m.slug },
          update: { name: m.name ?? m.slug, provider: m.provider ?? null, logoUrl: m.logoUrl ?? null, modelType: m.modelType ?? null, pricingModel: m.pricingModel ?? null, websiteUrl: m.websiteUrl ?? null },
          create: { id: m.slug, slug: m.slug, name: m.name ?? m.slug, provider: m.provider ?? null, logoUrl: m.logoUrl ?? null, modelType: m.modelType ?? null, pricingModel: m.pricingModel ?? null, websiteUrl: m.websiteUrl ?? null },
        });
        models++;
      }

      // Refresh links idempotently: delete + recreate for this task.
      await prisma.taskTool.deleteMany({ where: { taskId } });
      await prisma.taskModel.deleteMany({ where: { taskId } });
      const toolSlugs = [...new Set([...toolItems.map((x) => x?.slug).filter(Boolean), ...popularSlugs])];
      const rankOf = new Map((t.popularTools ?? []).map((p, i) => [p?.slug, i]));
      const toolItemSlugs = new Set(toolItems.map((x) => x?.slug).filter(Boolean));
      const posOf = new Map();
      toolItems.forEach((x, i) => { if (x?.slug && !posOf.has(x.slug)) posOf.set(x.slug, i); });
      let nextPos = toolItems.length;
      for (const s of popularSlugs) { if (!posOf.has(s)) posOf.set(s, nextPos++); }
      if (toolSlugs.length) {
        const rows = await prisma.tool.findMany({ where: { slug: { in: toolSlugs } }, select: { id: true, slug: true } });
        await prisma.taskTool.createMany({
          // position set only for live toolItems rows (table order); popular-only extras stay null.
          data: rows.map((r) => ({ taskId, toolId: r.id, isPopular: popularSlugs.has(r.slug), popularRank: rankOf.has(r.slug) ? rankOf.get(r.slug) : null, position: toolItemSlugs.has(r.slug) ? posOf.get(r.slug) : null })),
          skipDuplicates: true,
        });
        links += rows.length;
      }
      const modelSlugs = [...new Set(popularModels.map((x) => x?.slug).filter(Boolean))];
      if (modelSlugs.length) {
        const rows = await prisma.model.findMany({ where: { slug: { in: modelSlugs } }, select: { id: true } });
        await prisma.taskModel.createMany({
          data: rows.map((r) => ({ taskId, modelId: r.id })),
          skipDuplicates: true,
        });
      }
    } catch (e) {
      failed++;
      console.error(`[seed-rel] ${slug}: ${e.message}`);
    }
    if ((i + 1) % 10 === 0) console.log(`[seed-rel] ${i + 1}/${tasks.length}`);
    await sleep(DELAY_MS);
  }

  console.log(`[seed-rel] done — tool upserts=${tools}, model upserts=${models}, task-tool links=${links}, failed=${failed}`);
  console.log(`[seed-rel] verify Tool=${await prisma.tool.count()} Model=${await prisma.model.count()} TaskTool=${await prisma.taskTool.count()} TaskModel=${await prisma.taskModel.count()}`);
  const sb = await prisma.task.findUnique({
    where: { slug: "storyboard-videos" },
    include: { toolsRel: { include: { tool: true } } },
  });
  const pop = sb?.toolsRel.find((r) => r.isPopular)?.tool.name ?? "none";
  console.log(`[seed-rel] storyboard-videos: linked tools=${sb?.toolsRel.length} popular=${pop}`);
  await prisma.$disconnect();
}

main().catch((e) => { console.error(e); process.exit(1); });
