import { NextRequest, NextResponse } from "next/server";
import { pagedDevices } from "@/lib/directory";

// Own backend route — now live-fetches raw Device table (mock_aiorbit, 556 rows)
// GET /api/v1/devices?page=1&pageSize=24&q=&category= — returns verbatim Device JSON
export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const page = Math.max(1, Number(url.searchParams.get("page") ?? 1));
  const pageSize = Math.max(1, Number(url.searchParams.get("pageSize") ?? url.searchParams.get("limit") ?? 24));
  const q = url.searchParams.get("q")?.trim();
  const category = url.searchParams.get("category")?.trim();

  try {
    const result = await pagedDevices({ page, pageSize, q, category });
    return NextResponse.json(result, { headers: { "Cache-Control": "public, s-maxage=60" } });
  } catch (e: any) {
    return NextResponse.json({ devices: [], total: 0, page, pageSize, totalPages: 1, error: e.message }, { status: 500, headers: { "Cache-Control": "no-store" } });
  }
}
