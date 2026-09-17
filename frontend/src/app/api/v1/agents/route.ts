import { NextRequest, NextResponse } from "next/server";
import { pagedAgents } from "@/lib/directory";

// Own backend route — now live-fetches raw Agent table (mock_aiorbit, 10 rows)
// GET /api/v1/agents?page=1&pageSize=24&q=&category=&pricing= — returns verbatim Agent JSON
export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const page = Math.max(1, Number(url.searchParams.get("page") ?? 1));
  const pageSize = Math.max(1, Number(url.searchParams.get("pageSize") ?? url.searchParams.get("limit") ?? 24));
  const q = url.searchParams.get("q")?.trim();
  const category = url.searchParams.get("category")?.trim();
  const pricing = url.searchParams.get("pricing")?.trim();

  try {
    const result = await pagedAgents({ page, pageSize, q, category, pricing });
    return NextResponse.json(result, { headers: { "Cache-Control": "public, s-maxage=60" } });
  } catch (e: any) {
    return NextResponse.json({ agents: [], total: 0, page, pageSize, totalPages: 1, error: e.message }, { status: 500, headers: { "Cache-Control": "no-store" } });
  }
}
