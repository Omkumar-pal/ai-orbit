import { NextRequest, NextResponse } from "next/server";
import { pagedVideos } from "@/lib/directory";

// Own backend route — now live-fetches raw Video table (mock_aiorbit, ~4950 rows)
// GET /api/v1/videos?page=1&pageSize=100&q=&category=&sort=posted&dir=desc
export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const page = Math.max(1, Number(url.searchParams.get("page") ?? 1));
  const pageSize = Math.max(1, Number(url.searchParams.get("pageSize") ?? url.searchParams.get("limit") ?? 100));
  const q = url.searchParams.get("q")?.trim();
  const category = url.searchParams.get("category")?.trim();
  const sort = url.searchParams.get("sort")?.trim() || "posted";
  const dir = url.searchParams.get("dir")?.trim() || url.searchParams.get("order")?.trim() || "desc";

  try {
    const result = await pagedVideos({ page, pageSize, q, category, sort, dir });
    return NextResponse.json(result, { headers: { "Cache-Control": "public, s-maxage=60" } });
  } catch (e: any) {
    return NextResponse.json({ videos: [], total: 0, page, pageSize, totalPages: 1, error: e.message }, { status: 500, headers: { "Cache-Control": "no-store" } });
  }
}
