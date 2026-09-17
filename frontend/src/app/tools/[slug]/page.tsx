import { notFound } from "next/navigation";
import { toolBySlug } from "@/lib/directory";
import ToolDetail from "@/components/tools/ToolDetail";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const tool: any = await toolBySlug(slug);
  if (!tool) return { title: "Tool Not Found | AI Orbit" };
  return {
    title: `${tool.name} — AI Tool Details, Pricing & Reviews | AI Orbit`,
    description: tool.description?.slice(0, 160) ?? `Comprehensive details, features, reviews and pricing for ${tool.name}.`,
  };
}

export default async function Detail({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const t: any = await toolBySlug(slug, true);
  if (!t) notFound();

  const cats = Array.isArray(t.categories) ? t.categories : [];
  const tags = Array.isArray(t.tags) ? t.tags : [];
  const tt = Array.isArray(t.ttasks) ? t.ttasks : [];
  const linked = Array.isArray(t.tasks) ? t.tasks : [];

  return (
    <ToolDetail
      tool={{
        id: t.id,
        slug: t.slug,
        name: t.name,
        logoUrl: t.logoUrl,
        description: t.description ?? t.tagline ?? "",
        websiteUrl: null,
        visitUrl: t.visitUrl,
        pricingModel: t.pricingModel ?? "FREEMIUM",
        pricingAmount: t.pricingAmount,
        billingFrequency: t.billingFrequency,
        avgRating: t.avgRating,
        reviewCount: t.reviewCount ?? 0,
        upvoteCount: t.upvoteCount ?? 0,
        isOpenSource: !!t.isOpenSource,
        isTrending: !!t.isTrending,
        verified: !!t.verified,
        compatibility: t.compatibility,
        releaseDate: t.releaseDate ? new Date(t.releaseDate).toISOString() : null,
        launchDate: t.launchDate ? new Date(t.launchDate).toISOString().slice(0, 10) : null,
        hasApi: !!t.hasApi,
        apiDocsUrl: null,
        useCases: t.useCases,
        categories: cats.map((c: any) => ({ slug: c.category.slug, name: c.category.name })),
        tags: tags.map((x: any) => ({ slug: x.tag?.slug ?? x.slug, name: x.tag?.name ?? x.name })),
        ttasks: [
          ...tt.map((x: any) => ({ slug: x.task.slug, title: x.task.title })),
          ...linked
            .map((l: any) => ({ slug: l.task.slug, title: l.task.title }))
            .filter((x: any) => !tt.some((y: any) => y.task.slug === x.slug)),
        ],
      }}
    />
  );
}
