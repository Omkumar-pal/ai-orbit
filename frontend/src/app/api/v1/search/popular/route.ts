import { NextRequest, NextResponse } from "next/server";

// Own backend route — mirrors live workers.dev shape.
// Later: replace demo with prisma.<model>.findMany() per aiorbit_schema.sql
// Live reference: https://ai-orbit.palamrendra-pm.workers.dev/api/v1/search/popular

export async function GET(req: NextRequest) {
  const demo = {"popular":["AnswerThis","AnyClip","Aqua Voice","ARTSMART AI","Atlas","Anime AI"]};
  // TODO: wire Prisma — e.g., prisma.company.findMany({ skip, take, where })
  // For now return shape-compatible demo + pagination echo
  const url = new URL(req.url);
  const page = Number(url.searchParams.get("page") ?? 1);
  const pageSize = Number(url.searchParams.get("pageSize") ?? url.searchParams.get("limit") ?? 24);
  return NextResponse.json({ ...demo, page, pageSize }, {
    headers: { "Cache-Control": "public, s-maxage=60" },
  });
}
