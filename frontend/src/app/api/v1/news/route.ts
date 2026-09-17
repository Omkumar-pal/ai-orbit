import { NextRequest, NextResponse } from "next/server";
import { pagedNews } from "@/lib/directory";

// Own backend route — now live-fetches raw News table (mock_aiorbit, 1734 rows)
// GET /api/v1/news?page=1&pageSize=24&q=&category=&sort=newest — returns verbatim News JSON
export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const page = Math.max(1, Number(url.searchParams.get("page") ?? 1));
  const pageSize = Math.max(1, Number(url.searchParams.get("pageSize") ?? url.searchParams.get("limit") ?? url.searchParams.get("perPage") ?? 24));
  const q = url.searchParams.get("q")?.trim();
  const category = url.searchParams.get("category")?.trim() ?? url.searchParams.get("filter")?.trim();
  const sort = url.searchParams.get("sort")?.trim() ?? "newest";

  try {
    const result = await pagedNews({ page, pageSize, q, category, sort });
    return NextResponse.json(result, { headers: { "Cache-Control": "public, s-maxage=60" } });
  } catch (e: any) {
    return NextResponse.json({ news: [], total: 0, page, pageSize, totalPages: 1, error: e.message }, { status: 500, headers: { "Cache-Control": "no-store" } });
  }
}
