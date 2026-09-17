import { NextRequest, NextResponse } from "next/server";
import { taskBySlug } from "@/lib/directory";

// Own backend route — task + resolved relations (mirrors live workers.dev shape).
// GET /api/v1/tasks/[slug] → { slug, data: { ...task, category, tools, models, robots, devices } }
export async function GET(_req: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const item: any = await taskBySlug(slug, true);
  if (!item) return NextResponse.json({ slug, error: "Not found" }, { status: 404 });
  const { toolsRel, modelsRel, robotsRel, devicesRel, ...task } = item;
  return NextResponse.json(
    {
      slug,
      data: {
        ...task,
        category: { id: task.categoryId, name: task.categoryName, slug: task.categorySlug },
        tools: (toolsRel ?? []).map((r: any) => ({ ...r.tool, isPopular: r.isPopular, popularRank: r.popularRank, position: r.position })),
        models: (modelsRel ?? []).map((r: any) => r.model),
        robots: (robotsRel ?? []).map((r: any) => r.robot),
        devices: (devicesRel ?? []).map((r: any) => r.device),
      },
    },
    { status: 200, headers: { "Cache-Control": "public, s-maxage=60" } }
  );
}
