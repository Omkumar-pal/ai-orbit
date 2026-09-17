import { NextRequest, NextResponse } from "next/server";
import { pagedCompanies } from "@/lib/directory";

// Own backend route — now live-fetches raw Company table (mock_aiorbit, 2234 rows)
// GET /api/v1/companies?page=1&pageSize=24&q=&sector=&verified= — returns verbatim Company JSON
export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const page = Math.max(1, Number(url.searchParams.get("page") ?? 1));
  const pageSize = Math.max(1, Number(url.searchParams.get("pageSize") ?? url.searchParams.get("limit") ?? 24));
  const q = url.searchParams.get("q")?.trim();
  const sector = url.searchParams.get("sector")?.trim() ?? url.searchParams.get("category")?.trim();
  const verified = url.searchParams.get("verified")?.trim();

  try {
    const result = await pagedCompanies({ page, pageSize, q, sector, verified });
    return NextResponse.json(result, { headers: { "Cache-Control": "public, s-maxage=60" } });
  } catch (e: any) {
    return NextResponse.json({ companies: [], total: 0, page, pageSize, totalPages: 1, error: e.message }, { status: 500, headers: { "Cache-Control": "no-store" } });
  }
}
