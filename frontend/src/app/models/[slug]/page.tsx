import { notFound } from "next/navigation";
import { modelBySlug, relatedModels } from "@/lib/directory";
import ModelDetail from "@/components/models/ModelDetail";

const strArr = (v: unknown): string[] => (Array.isArray(v) ? v.map(String) : []);

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const m: any = await modelBySlug(slug);
  if (!m) return { title: "Model Not Found | AI Orbit" };
  return { title: `${m.name} — AI Model | AI Orbit`, description: m.description?.slice(0, 160) };
}

export default async function Detail({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const m: any = await modelBySlug(slug);
  if (!m) notFound();
  const related: any[] = await relatedModels(m.slug, m.primaryTask, m.providerName ?? m.provider);
  return (
    <ModelDetail
      model={{
        slug: m.slug,
        name: m.name,
        description: m.description ?? "",
        providerName: m.providerName ?? m.provider ?? "Unknown provider",
        providerSlug: m.providerSlug ?? null,
        providerLogo: m.providerLogo ?? m.logoUrl ?? null,
        modelType: m.modelType ?? null,
        modality: m.modality ?? null,
        creator: m.creator ?? null,
        contextWindow: m.contextWindow ?? null,
        parameterSize: m.parameterSize ?? null,
        releaseDate: m.releaseDate ?? null,
        websiteUrl: m.websiteUrl ?? null,
        capabilities: strArr(m.capabilities),
        apiAvailable: !!m.apiAvailable,
        openSource: m.openSource ?? null,
        primaryTask: m.primaryTask ?? null,
        updatedAt: m.updatedAt ? new Date(m.updatedAt).toISOString() : null,
        related: related.map((r: any) => ({
          slug: r.slug,
          name: r.name,
          logoUrl: r.logoUrl ?? r.providerLogo ?? null,
          providerName: r.providerName ?? r.provider ?? null,
        })),
      }}
    />
  );
}
