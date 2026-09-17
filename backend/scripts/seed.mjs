#!/usr/bin/env node
// Upsert incremental seed: backend/data/*.json → Postgres via Prisma
// Preserves manual edits; adds new slugs. Use --truncate to wipe first.
// Usage: node scripts/seed.mjs [--truncate]

import { readFile, readdir } from "node:fs/promises";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const DATA_DIR = join(__dirname, "..", "data");
const shouldTruncate = process.argv.includes("--truncate");

// Global Prisma client (singleton) — aligns with backend/src/lib/prisma.ts:1
// Prevents multiple connections during upsert incremental reruns.
async function getPrisma() {
  const { PrismaClient } = await import("@prisma/client");
  const g = globalThis;
  if (!g.__aiorbitPrisma) g.__aiorbitPrisma = new PrismaClient();
  return g.__aiorbitPrisma;
}

function toDate(v) {
  if (!v) return null;
  const d = new Date(v);
  return isNaN(d.getTime()) ? null : d;
}

async function seedTools(prisma, items) {
  for (const t of items) {
    const id = t.id ?? t.slug;
    await prisma.tool.upsert({
      where: { slug: t.slug },
      update: {
        name: t.name,
        description: t.description ?? "",
        logoUrl: t.logoUrl ?? t.logo_url ?? "",
        websiteUrl: t.websiteUrl ?? t.website_url ?? t.url ?? null,
        pricingModel: t.pricingModel ?? t.pricing_model ?? "FREEMIUM",
        pricingAmount: t.pricingAmount != null ? t.pricingAmount : null,
        billingFrequency: t.billingFrequency ?? t.billing_frequency ?? null,
        avgRating: t.avgRating ?? t.avg_rating ?? null,
        upvoteCount: t.upvoteCount ?? t.upvote_count ?? 0,
        isOpenSource: t.isOpenSource ?? t.is_open_source ?? false,
        isTrending: t.isTrending ?? t.is_trending ?? false,
        verified: t.verified ?? false,
        hasApi: t.hasApi ?? t.has_api ?? false,
        launchDate: toDate(t.launchDate ?? t.launch_date),
        releaseDate: toDate(t.releaseDate ?? t.release_date),
        updatedAt: new Date(),
      },
      create: {
        id,
        slug: t.slug,
        name: t.name,
        description: t.description ?? "",
        logoUrl: t.logoUrl ?? t.logo_url ?? "",
        websiteUrl: t.websiteUrl ?? t.website_url ?? t.url ?? null,
        pricingModel: t.pricingModel ?? t.pricing_model ?? "FREEMIUM",
        pricingAmount: t.pricingAmount ?? null,
        billingFrequency: t.billingFrequency ?? null,
        avgRating: t.avgRating ?? null,
        upvoteCount: t.upvoteCount ?? 0,
        isOpenSource: t.isOpenSource ?? false,
        isTrending: t.isTrending ?? false,
        verified: t.verified ?? false,
        hasApi: t.hasApi ?? false,
        launchDate: toDate(t.launchDate),
        releaseDate: toDate(t.releaseDate),
      },
    });

    // Joint tables — replace per tool (upsert incremental at tool level, but tags/useCases are replaced to reflect live arrays)
    if (Array.isArray(t.tags) || Array.isArray(t.categories) || Array.isArray(t.useCases) || Array.isArray(t.ttasks)) {
      await prisma.toolTag.deleteMany({ where: { toolId: id } });
      await prisma.toolUseCase.deleteMany({ where: { toolId: id } });
      await prisma.toolCategory.deleteMany({ where: { toolId: id } });
      await prisma.toolTTask.deleteMany({ where: { toolId: id } });

      if (Array.isArray(t.tags) && t.tags.length) {
        await prisma.toolTag.createMany({ data: t.tags.map(tag => ({ toolId: id, tag: typeof tag === "string" ? tag : tag.name ?? tag.slug })), skipDuplicates: true });
      }
      if (Array.isArray(t.categories) && t.categories.length) {
        // Ensure categories exist
        for (const c of t.categories) {
          const slug = c.slug ?? c.toLowerCase().replace(/[^a-z0-9]+/g, "-");
          const name = c.name ?? c;
          await prisma.category.upsert({ where: { slug }, update: { name }, create: { id: slug, slug, name } });
          await prisma.toolCategory.create({ data: { toolId: id, categoryId: slug } }).catch(() => {});
        }
      }
      if (Array.isArray(t.useCases) && t.useCases.length) {
        await prisma.toolUseCase.createMany({ data: t.useCases.map(uc => ({ toolId: id, useCase: typeof uc === "string" ? uc : uc.title ?? uc.name })), skipDuplicates: true });
      }
      if (Array.isArray(t.ttasks) && t.ttasks.length) {
        await prisma.toolTTask.createMany({ data: t.ttasks.map(tt => ({ toolId: id, taskSlug: tt.task?.slug ?? tt.slug, title: tt.task?.title ?? tt.title ?? tt.slug })), skipDuplicates: true });
      }
    }

    if (t._count) {
      await prisma.toolCounter.upsert({
        where: { toolId: id },
        update: { bookmarksCount: t._count.bookmarks ?? 0, reviewsCount: t._count.reviews ?? 0 },
        create: { toolId: id, bookmarksCount: t._count.bookmarks ?? 0, reviewsCount: t._count.reviews ?? 0 },
      });
    }
  }
  console.log(`  tools upserted: ${items.length}`);
}

async function seedTasks(prisma, items) {
  for (const t of items) {
    const cat = t.category ?? {};
    const catId = cat.id ?? cat.slug ?? "uncategorized";
    if (cat.slug) {
      await prisma.taskCategory.upsert({ where: { slug: cat.slug }, update: { name: cat.name }, create: { id: catId, slug: cat.slug, name: cat.name ?? cat.slug } });
    }
    await prisma.task.upsert({
      where: { slug: t.slug },
      update: {
        title: t.title,
        description: t.description ?? "",
        categoryId: catId,
        difficulty: t.difficulty ?? "MEDIUM",
        pricingModel: t.pricingModel ?? t.pricing_model ?? "FREEMIUM",
        iconUrl: t.iconUrl ?? t.icon_url ?? "",
        isFeatured: t.isFeatured ?? t.is_featured ?? false,
        likes: t.likes ?? 0,
        saves: t.saves ?? 0,
        subscribers: t.subscribers ?? 0,
        resourcesCount: t.resources ?? t.resources_count ?? 0,
        toolsCount: t.tools ?? t.tools_count ?? 0,
        modelsCount: t.models ?? 0,
        robotsCount: t.robots ?? 0,
        devicesCount: t.devices ?? 0,
        createdAt: toDate(t.createdAt ?? t.created_at),
        updatedAt: toDate(t.updatedAt ?? t.updated_at),
      },
      create: {
        id: t.id,
        slug: t.slug,
        title: t.title,
        description: t.description ?? "",
        categoryId: catId,
        difficulty: t.difficulty ?? "MEDIUM",
        pricingModel: t.pricingModel ?? "FREEMIUM",
        iconUrl: t.iconUrl ?? "",
        isFeatured: t.isFeatured ?? false,
        likes: t.likes ?? 0,
        saves: t.saves ?? 0,
        subscribers: t.subscribers ?? 0,
        resourcesCount: t.resources ?? 0,
        toolsCount: t.tools ?? 0,
        modelsCount: t.models ?? 0,
        robotsCount: t.robots ?? 0,
        devicesCount: t.devices ?? 0,
        createdAt: toDate(t.createdAt),
        updatedAt: toDate(t.updatedAt),
      },
    });
  }
  console.log(`  tasks upserted: ${items.length}`);
}

async function genericUpsert(prisma, model, items, mapFn) {
  for (const it of items) {
    const data = mapFn(it);
    await prisma[model].upsert({ where: { slug: data.slug }, update: data, create: { id: data.id ?? data.slug, ...data } });
  }
  console.log(`  ${model} upserted: ${items.length}`);
}

async function main() {
  const prisma = await getPrisma();

  if (shouldTruncate) {
    console.log("Truncating (clean) — wiping before seed...");
    // Order respects FKs
    await prisma.toolTag.deleteMany();
    await prisma.toolUseCase.deleteMany();
    await prisma.toolCategory.deleteMany();
    await prisma.toolTTask.deleteMany();
    await prisma.toolCounter.deleteMany();
    await prisma.tool.deleteMany();
    await prisma.task.deleteMany();
    await prisma.taskCategory.deleteMany();
    await prisma.company.deleteMany();
    await prisma.model.deleteMany();
    await prisma.device.deleteMany();
    await prisma.robot.deleteMany();
    await prisma.repository.deleteMany();
    await prisma.mcpItem.deleteMany();
    await prisma.searchFeatured.deleteMany();
    console.log("  truncated");
  }

  const files = await readdir(DATA_DIR).catch(() => []);
  if (!files.length) { console.error(`No files in ${DATA_DIR} — run download.mjs first`); process.exit(1); }

  for (const file of files) {
    if (!file.endsWith(".json")) continue;
    const raw = await readFile(join(DATA_DIR, file), "utf8");
    const json = JSON.parse(raw);
    const items = json.items ?? json.tools ?? json.tasks ?? json.models ?? json.devices ?? json.robots ?? json.repositories ?? json.items ?? json.videos ?? json.news ?? json.companies ?? [];
    const name = file.replace(".json", "");
    console.log(`\n[${name}] ${items.length} items (total field ${json.total ?? "-"})`);
    switch (name) {
      case "tools": await seedTools(prisma, items); break;
      case "tasks": await seedTasks(prisma, items); break;
      case "companies": await genericUpsert(prisma, "company", items, c => ({ id: c.id, slug: c.slug, name: c.name, description: c.description ?? null, website: c.website ?? null, logoUrl: c.logo_url ?? c.logoUrl ?? null, verified: c.verified ?? false, featured: c.featured ?? false })); break;
      case "models": await genericUpsert(prisma, "model", items, m => ({ id: m.id, slug: m.slug, name: m.name, description: m.description ?? "", providerId: m.provider_id ?? m.providerId ?? null, modelType: m.model_type ?? m.modelType ?? null, modality: m.modality ?? null, apiAvailable: m.api_available ?? m.apiAvailable ?? false, openSource: m.open_source ?? m.openSource ?? false, releaseDate: toDate(m.release_date ?? m.releaseDate) })); break;
      case "devices": await genericUpsert(prisma, "device", items, d => ({ id: d.id, slug: d.slug, name: d.name, description: d.description ?? "", category: d.category ?? "", manufacturerSlug: d.manufacturer_slug ?? d.manufacturerSlug ?? "", imageUrl: d.image_url ?? d.imageUrl ?? "", country: d.country ?? null })); break;
      case "robots": await genericUpsert(prisma, "robot", items, r => ({ id: r.id, slug: r.slug, name: r.name, about: r.about ?? "", category: r.category ?? "", country: r.country ?? "", })); break;
      case "repositories": await genericUpsert(prisma, "repository", items, r => ({ id: r.id, slug: r.slug, name: r.name, description: r.description ?? "", owner: r.owner ?? "", url: r.url ?? r.html_url ?? "", language: r.language ?? null, stars: r.stars ?? r.stargazers_count ?? 0, forks: r.forks ?? 0, githubCreatedAt: toDate(r.github_created_at ?? r.created_at) })); break;
      case "mcp": await genericUpsert(prisma, "mcpItem", items, m => ({ id: m.id, slug: m.slug, name: m.name, itemType: m.item_type ?? m.itemType ?? null, providerName: m.provider_name ?? m.providerName ?? null, websiteUrl: m.website_url ?? m.websiteUrl ?? null, qualityScore: m.quality_score ?? m.qualityScore ?? null })); break;
      default: console.warn(`  no seeder for ${name} — skipped (add generic mapping)`);
    }
  }

  await prisma.$disconnect();
  console.log("\nSeed done (upsert incremental).");
}

main().catch(e => { console.error(e); process.exit(1); });
