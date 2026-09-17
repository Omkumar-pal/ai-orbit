import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/v1/tools?page=1&pageSize=24&q=&category=image-generation&pricing=FREE&sort=newest
// Mirrors live workers.dev shape. Joint-table replica per aiorbit_schema.sql:192/200
export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const page = Math.max(1, Number(url.searchParams.get("page") ?? 1));
  const pageSize = Math.max(1, Number(url.searchParams.get("pageSize") ?? url.searchParams.get("limit") ?? 24));
  const q = url.searchParams.get("q")?.trim();
  const category = url.searchParams.get("category")?.trim(); // kebab slug e.g. image-generation
  const pricing = url.searchParams.get("pricing")?.trim(); // FREE | FREEMIUM | PAID (uppercase)
  const sort = url.searchParams.get("sort")?.trim() ?? "newest";

  const skip = (page - 1) * pageSize;

  const where: any = {};
  if (q) {
    where.OR = [
      { name: { contains: q, mode: "insensitive" } },
      { description: { contains: q, mode: "insensitive" } },
    ];
  }
  if (category) {
    where.categories = { some: { category: { slug: category } } };
  }
  if (pricing) {
    where.pricingModel = pricing;
  }

  const orderBy: any = sort === "oldest" ? { createdAt: "asc" } : { createdAt: "desc" };

  try {
    const [tools, total] = await Promise.all([
      prisma.tool.findMany({
        where,
        skip,
        take: pageSize,
        orderBy,
        include: { tags: true, useCases: true, categories: { include: { category: true } }, counters: true },
      }),
      prisma.tool.count({ where }),
    ]);

    const totalPages = Math.max(1, Math.ceil(total / pageSize));

    // Flatten to live shape: categories/tags/useCases arrays + _count
    const shaped = tools.map((t: any) => ({
      ...t,
      categories: t.categories.map((c: any) => c.category),
      tags: t.tags.map((x: any) => x.tag),
      useCases: t.useCases.map((x: any) => x.useCase),
      _count: t.counters ? { bookmarks: t.counters.bookmarksCount, reviews: t.counters.reviewsCount } : { bookmarks: 0, reviews: 0 },
    }));

    return NextResponse.json(
      { tools: shaped, total, page, pageSize, totalPages, sort },
      { headers: { "Cache-Control": "public, s-maxage=60" } }
    );
  } catch (e: any) {
    // Fallback when DB not seeded yet
    return NextResponse.json(
      { tools: [], total: 0, page, pageSize, totalPages: 1, sort, error: e.message },
      { status: 500, headers: { "Cache-Control": "no-store" } }
    );
  }
}
