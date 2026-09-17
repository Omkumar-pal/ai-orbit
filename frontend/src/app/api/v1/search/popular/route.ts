import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Popular searches — derived from our own top-upvoted tools (live returns a static list).
// Shape mirrors live /api/v1/search/popular: { popular: string[] }
export async function GET() {
  try {
    const top = await prisma.tool.findMany({
      orderBy: [{ upvoteCount: "desc" }, { name: "asc" }],
      take: 6,
      select: { name: true },
    });
    return NextResponse.json(
      { popular: top.map((t) => t.name) },
      { headers: { "Cache-Control": "public, s-maxage=3600" } }
    );
  } catch (e: any) {
    return NextResponse.json({ popular: [], error: e.message }, { status: 500, headers: { "Cache-Control": "no-store" } });
  }
}
