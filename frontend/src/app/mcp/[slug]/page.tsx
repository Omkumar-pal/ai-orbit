import { notFound } from "next/navigation";
import { mcpBySlug } from "@/lib/directory";
import McpDetail from "@/components/mcp/McpDetail";

function parseFeatures(v: unknown): string[] {
  if (!Array.isArray(v)) return [];
  const out: string[] = [];
  for (const x of v) {
    if (typeof x === "string") out.push(x);
    else if (x && typeof x === "object") {
      const o = x as any;
      out.push(String(o.title ?? o.name ?? o.feature ?? JSON.stringify(x)));
    }
  }
  return out;
}

function parseFaqs(v: unknown): { question: string; answer: string }[] {
  if (!Array.isArray(v)) return [];
  return (v as any[])
    .map((x: any) => ({ question: String(x?.question ?? x?.q ?? ""), answer: String(x?.answer ?? x?.a ?? "") }))
    .filter((f) => f.question);
}

const tagList = (v: unknown): { slug: string; name: string }[] => {
  if (!Array.isArray(v)) return [];
  return v
    .map((t: any) => ({ slug: String(t?.slug ?? t?.name ?? ""), name: String(t?.name ?? t?.slug ?? "") }))
    .filter((t) => t.slug);
};

const useCaseList = (v: unknown): string[] => {
  if (Array.isArray(v)) return v.map((x) => (typeof x === "string" ? x : JSON.stringify(x)));
  if (v != null) return [String(v)];
  return [];
};

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const m: any = await mcpBySlug(slug);
  if (!m) return { title: "MCP Item Not Found | AI Orbit" };
  return { title: `${m.name} — Model Context Protocol (MCP) | AI Orbit`, description: m.shortDescription?.slice(0, 160) };
}

export default async function Detail({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const m: any = await mcpBySlug(slug);
  if (!m) notFound();
  const catName =
    m.categories && !Array.isArray(m.categories) ? (m.categories.name ?? null) : null;
  return (
    <McpDetail
      item={{
        slug: m.slug,
        name: m.name,
        itemType: m.itemType ?? null,
        shortDescription: m.shortDescription ?? null,
        fullDescription: m.fullDescription ?? null,
        providerName: m.providerName ?? null,
        providerUrl: m.providerUrl ?? null,
        license: m.license ?? null,
        pricingType: m.pricingType ?? null,
        isFeatured: !!m.isFeatured,
        isVerified: !!m.isVerified,
        launchDate: m.launchDate ? new Date(m.launchDate).toISOString() : null,
        websiteUrl: m.websiteUrl ?? null,
        documentationUrl: m.documentationUrl ?? null,
        repositoryUrl: m.repositoryUrl ?? null,
        qualityScore: m.qualityScore ?? null,
        easeOfUseScore: m.easeOfUseScore ?? null,
        globalRank: m.globalRank ?? null,
        viewCount: m.viewCount ?? 0,
        upvoteCount: m.upvoteCount ?? 0,
        saveCount: m.saveCount ?? 0,
        useCases: useCaseList(m.useCases),
        categoryName: catName,
        subCategoryName:
          m.subCategories && !Array.isArray(m.subCategories) ? (m.subCategories.name ?? null) : null,
        tags: tagList(m.tags),
        features: [],
        faqs: [],
      }}
      features={parseFeatures(m.features)}
      faqs={parseFaqs(m.faqs)}
    />
  );
}
