import { NextRequest, NextResponse } from "next/server";
import { toolBySlug } from "@/lib/directory";

// Own backend route — tool + linked task slugs (mirrors live workers.dev shape).
// GET /api/v1/tools/[slug] → { slug, data: { ...tool, tasks: [{slug,title}] } }
export async function GET(_req: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const item: any = await toolBySlug(slug, true);
  if (!item) return NextResponse.json({ slug, error: "Not found" }, { status: 404 });
  const { tasks, ...tool } = item;
  return NextResponse.json(
    {
      slug,
      data: {
        ...tool,
        tasks: (tasks ?? []).map((l: any) => ({ slug: l.task.slug, title: l.task.title })),
      },
    },
    { status: 200, headers: { "Cache-Control": "public, s-maxage=60" } }
  );
}
