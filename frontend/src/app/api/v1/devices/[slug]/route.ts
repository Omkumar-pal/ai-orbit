import { NextRequest, NextResponse } from "next/server";
import { deviceBySlug } from "@/lib/directory";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const item = await deviceBySlug(slug);
  if (!item) return NextResponse.json({ slug, error: "Not found" }, { status: 404 });
  return NextResponse.json({ slug, data: item }, { status: 200, headers: { "Cache-Control": "public, s-maxage=60" } });
}
