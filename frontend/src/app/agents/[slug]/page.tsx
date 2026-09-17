import { notFound } from "next/navigation";
import { agentBySlug, agentsFor } from "@/lib/directory";
import AgentDetail from "@/components/agents/AgentDetail";

const strArr = (v: unknown): string[] => (Array.isArray(v) ? v.map(String) : []);

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const agent: any = await agentBySlug(slug);
  if (!agent) return { title: "Agent Not Found | AI Orbit" };
  return {
    title: `${agent.name} Agents | AI Orbit`,
    description: agent.shortDescription?.slice(0, 160) ?? `Explore ${agent.name} in the Agents section of AI Orbit.`,
  };
}

export default async function Detail({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const a: any = await agentBySlug(slug);
  if (!a) notFound();

  const all: any[] = await agentsFor();
  const similar = all
    .filter((x) => x.slug !== a.slug && a.categorySlug && x.categorySlug === a.categorySlug)
    .slice(0, 4)
    .map((x) => ({ slug: x.slug, name: x.name, logoUrl: x.logoUrl, primaryTask: x.primaryTask, category: x.category }));

  return (
    <AgentDetail
      agent={{
        slug: a.slug,
        name: a.name,
        description: a.description ?? "",
        websiteUrl: a.websiteUrl,
        logoUrl: a.logoUrl,
        category: a.category,
        categorySlug: a.categorySlug,
        primaryTask: a.primaryTask,
        pricingModel: a.pricingModel,
        hasApi: !!a.hasApi,
        isOpenSource: !!a.isOpenSource,
        verified: !!a.verified,
        compatibility: strArr(a.compatibility),
        avgRating: a.avgRating,
        upvoteCount: a.upvoteCount ?? 0,
        views: a.views ?? 0,
        shortDescription: a.shortDescription,
        longDescription: a.longDescription,
        features: strArr(a.features),
        useCases: strArr(a.useCases),
        integrations: strArr(a.integrations),
        apiDocsUrl: a.apiDocsUrl,
        githubUrl: a.githubUrl,
        provider: a.provider,
        providerWebsite: a.providerWebsite,
        releaseDate: a.releaseDate ? new Date(a.releaseDate).toISOString() : null,
        pros: strArr(a.pros),
        cons: strArr(a.cons),
        createdAt: a.createdAt ? new Date(a.createdAt).toISOString() : null,
        similar,
      }}
    />
  );
}
