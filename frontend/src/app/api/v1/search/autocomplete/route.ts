import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Cross-resource autocomplete — mirrors live /api/v1/search/autocomplete shape:
// { suggestions: [{ id, type, title, category, slug, logoUrl }] }
// Ranking (option B): NAME hits render first (up to 5), DESCRIPTION hits only
// fill the remainder (max 2) — exact-feeling top results, discovery preserved.
const PER_TYPE_FETCH = 12;
const NAME_MAX = 5;
const DESC_MAX = 2;

export async function GET(req: NextRequest) {
  const q = new URL(req.url).searchParams.get("q")?.trim() ?? "";
  if (!q) return NextResponse.json({ suggestions: [] }, { headers: { "Cache-Control": "public, s-maxage=60" } });

  try {
    const [tools, companies, models, devices, robots, repositories, videos, agents, news, mcp] =
      await Promise.all([
        prisma.tool.findMany({
          where: { OR: [{ name: { contains: q, mode: "insensitive" } }, { description: { contains: q, mode: "insensitive" } }] },
          take: PER_TYPE_FETCH,
          orderBy: { upvoteCount: "desc" },
        }),
        prisma.company.findMany({
          where: { OR: [{ name: { contains: q, mode: "insensitive" } }, { description: { contains: q, mode: "insensitive" } }] },
          take: PER_TYPE_FETCH,
          orderBy: { upvotes: "desc" },
        }),
        prisma.model.findMany({
          where: { OR: [{ name: { contains: q, mode: "insensitive" } }, { description: { contains: q, mode: "insensitive" } }] },
          take: PER_TYPE_FETCH,
        }),
        prisma.device.findMany({
          where: { OR: [{ name: { contains: q, mode: "insensitive" } }, { description: { contains: q, mode: "insensitive" } }] },
          take: PER_TYPE_FETCH,
        }),
        prisma.robot.findMany({
          where: { OR: [{ name: { contains: q, mode: "insensitive" } }, { about: { contains: q, mode: "insensitive" } }] },
          take: PER_TYPE_FETCH,
        }),
        prisma.repository.findMany({
          where: { OR: [{ name: { contains: q, mode: "insensitive" } }, { description: { contains: q, mode: "insensitive" } }] },
          take: PER_TYPE_FETCH,
          orderBy: { stars: "desc" },
        }),
        prisma.video.findMany({
          where: { OR: [{ title: { contains: q, mode: "insensitive" } }, { description: { contains: q, mode: "insensitive" } }] },
          take: PER_TYPE_FETCH,
          orderBy: { views: "desc" },
        }),
        prisma.agent.findMany({
          where: { OR: [{ name: { contains: q, mode: "insensitive" } }, { description: { contains: q, mode: "insensitive" } }] },
          take: PER_TYPE_FETCH,
        }),
        prisma.news.findMany({
          where: { OR: [{ headline: { contains: q, mode: "insensitive" } }, { dek: { contains: q, mode: "insensitive" } }] },
          take: PER_TYPE_FETCH,
          orderBy: { score: "desc" },
        }),
        prisma.mcp.findMany({
          where: { OR: [{ name: { contains: q, mode: "insensitive" } }, { shortDescription: { contains: q, mode: "insensitive" } }] },
          take: PER_TYPE_FETCH,
        }),
      ]);

    const catName = (cats: unknown): string | null => {
      if (!Array.isArray(cats) || !cats.length) return null;
      const c: any = cats[0];
      return c?.category?.name ?? (typeof c === "string" ? c : null);
    };

    // Name-hits first (DB order kept), description-hits fill the remainder.
    const ql = q.toLowerCase();
    const ranked = <T,>(rows: T[], getName: (r: T) => unknown): T[] => {
      const names: T[] = [];
      const descs: T[] = [];
      for (const r of rows) {
        const n = getName(r);
        (n != null && String(n).toLowerCase().includes(ql) ? names : descs).push(r);
      }
      return [...names.slice(0, NAME_MAX), ...descs.slice(0, DESC_MAX)];
    };
    const byName = (r: any) => r.name;
    const byTitle = (r: any) => r.title;
    const byHeadline = (r: any) => r.headline;

    const suggestions = [
      ...ranked(tools, byName).map((t: any) => ({ id: t.id, type: "tools", title: t.name, category: catName(t.categories) ?? t.pricingModel ?? "Tool", slug: t.slug, logoUrl: t.logoUrl ?? null })),
      ...ranked(companies, byName).map((c: any) => ({ id: c.id, type: "companies", title: c.name, category: c.sector ?? "Company", slug: c.slug, logoUrl: c.logoUrl ?? null })),
      ...ranked(models, byName).map((m: any) => ({ id: m.id, type: "models", title: m.name, category: m.providerName ?? m.provider ?? "Model", slug: m.slug, logoUrl: m.logoUrl ?? m.providerLogo ?? null })),
      ...ranked(devices, byName).map((d: any) => ({ id: d.id, type: "devices", title: d.name, category: d.category ?? "Device", slug: d.slug, logoUrl: d.imageUrl ?? null })),
      ...ranked(robots, byName).map((r: any) => ({ id: r.id, type: "robots", title: r.name, category: r.company ?? "Robot", slug: r.slug, logoUrl: r.logoUrl ?? null })),
      ...ranked(repositories, byName).map((r: any) => ({ id: r.id, type: "repositories", title: r.name, category: r.language ?? "Repository", slug: r.slug, logoUrl: r.logoUrl ?? r.ownerAvatarUrl ?? null })),
      ...ranked(videos, byTitle).map((v: any) => ({ id: v.id, type: "videos", title: v.title, category: v.toolCategory ?? "Video", slug: v.slug, logoUrl: v.thumbnail ?? null })),
      ...ranked(agents, byName).map((a: any) => ({ id: a.id, type: "agents", title: a.name, category: a.category ?? "Agent", slug: a.slug, logoUrl: a.logoUrl ?? null })),
      ...ranked(news, byHeadline).map((n: any) => ({ id: n.id, type: "news", title: n.headline, category: n.category ?? "News", slug: n.slug, logoUrl: null })),
      ...ranked(mcp, byName).map((m: any) => ({ id: m.id, type: "mcp", title: m.name, category: m.providerName ?? "MCP", slug: m.slug, logoUrl: null })),
    ];
    return NextResponse.json({ suggestions }, { headers: { "Cache-Control": "public, s-maxage=60" } });
  } catch (e: any) {
    return NextResponse.json({ suggestions: [], error: e.message }, { status: 500, headers: { "Cache-Control": "no-store" } });
  }
}
