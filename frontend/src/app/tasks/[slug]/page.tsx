import { notFound } from "next/navigation";
import { taskBySlug } from "@/lib/directory";
import TaskDetail from "@/components/tasks/TaskDetail";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const task: any = await taskBySlug(slug);
  if (!task) return { title: "Task Not Found | AI Orbit" };
  return {
    title: `${task.title} | AI Orbit`,
    description: task.description?.slice(0, 160) ?? `Discover the best AI tools and workflows for ${task.title}.`,
  };
}

export default async function Detail({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const t: any = await taskBySlug(slug, true);
  if (!t) notFound();

  const tableTools = (t.toolsRel ?? [])
    .filter((r: any) => r.position != null)
    .sort((a: any, b: any) => a.position - b.position);
  const popular =
    (t.toolsRel ?? [])
      .filter((r: any) => r.isPopular)
      .sort((a: any, b: any) => (a.popularRank ?? 999) - (b.popularRank ?? 999))[0]?.tool ?? null;

  return (
    <TaskDetail
      task={{
        title: t.title ?? "Untitled Task",
        slug: t.slug,
        description: t.description ?? "",
        iconUrl: t.iconUrl,
        categoryName: t.categoryName ?? "Uncategorized",
        categorySlug: t.categorySlug,
        subscribers: t.subscribers ?? 0,
        difficulty: t.difficulty,
        pricingModel: t.pricingModel,
        likes: t.likes ?? 0,
        saves: t.saves ?? 0,
        toolsCount: t.tools ?? 0,
        modelsCount: t.models ?? 0,
        robotsCount: t.robots ?? 0,
        devicesCount: t.devices ?? 0,
        popular: popular ? { name: popular.name, logoUrl: popular.logoUrl } : null,
        tools: tableTools.map((r: any) => ({
          slug: r.tool.slug,
          name: r.tool.name,
          logoUrl: r.tool.logoUrl,
          tagline: r.tool.tagline,
          pricingModel: r.tool.pricingModel,
          pricingAmount: r.tool.pricingAmount,
          billingFrequency: r.tool.billingFrequency,
          hasApi: !!r.tool.hasApi,
          isOpenSource: !!r.tool.isOpenSource,
          compatibility: r.tool.compatibility,
          releaseDate: r.tool.releaseDate ? new Date(r.tool.releaseDate).toISOString() : null,
          position: r.position,
        })),
      }}
    />
  );
}
