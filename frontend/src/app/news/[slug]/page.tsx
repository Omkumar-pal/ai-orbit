import { notFound } from "next/navigation";
import { newsBySlug, relatedNews } from "@/lib/directory";
import NewsDetail from "@/components/news/NewsDetail";

const strArr = (v: unknown): string[] => (Array.isArray(v) ? v.map(String) : []);

function publisherOf(n: any): { name: string; logoUrl: string | null; domain: string | null } {
  if (n.source) return { name: n.source.name, logoUrl: n.source.logoUrl ?? null, domain: n.source.domain ?? null };
  let domain: string | null = null;
  try {
    domain = new URL(n.articleUrl).hostname.replace(/^www\./, "");
  } catch {
    domain = null;
  }
  const base = domain ? domain.split(".")[0] : null;
  return { name: base ? base.charAt(0).toUpperCase() + base.slice(1) : "—", logoUrl: null, domain };
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const item: any = await newsBySlug(slug);
  if (!item) return { title: "Article Not Found | AI Orbit" };
  return {
    title: `${item.headline} — News | AI Orbit`,
    description: `Read the latest AI news and updates about ${item.headline}.`.slice(0, 160),
  };
}

export default async function Detail({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const a: any = await newsBySlug(slug);
  if (!a) notFound();

  const pub = publisherOf(a);
  const rel: any[] = await relatedNews(a.slug, a.category, 4);
  const related = rel.map((x) => {
    const p = publisherOf(x);
    return { slug: x.slug, headline: x.headline, category: x.category, hours: x.hours ?? 0, publisherName: p.name, publisherLogo: p.logoUrl };
  });

  return (
    <NewsDetail
      article={{
        slug: a.slug,
        headline: a.headline,
        dek: a.dek,
        aiSummary: a.aiSummary,
        articleUrl: a.articleUrl,
        category: a.category,
        topics: strArr(a.topics),
        filters: strArr(a.filters),
        hours: a.hours ?? 0,
        up: a.up ?? 0,
        down: a.down ?? 0,
        score: a.score ?? 0,
        publisherName: pub.name,
        publisherLogo: pub.logoUrl,
        publisherDomain: pub.domain,
        related,
      }}
    />
  );
}
