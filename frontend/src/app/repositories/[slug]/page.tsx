import { notFound } from "next/navigation";
import { repositoryBySlug, relatedRepositories } from "@/lib/directory";
import RepositoryDetail from "@/components/repositories/RepositoryDetail";

const strArr = (v: unknown): string[] => (Array.isArray(v) ? v.map(String) : []);

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const r: any = await repositoryBySlug(slug);
  if (!r) return { title: "Repository Not Found | AI Orbit" };
  return { title: `${r.name} Repositories | AI Orbit`, description: r.description?.slice(0, 160) };
}

export default async function Detail({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const r: any = await repositoryBySlug(slug);
  if (!r) notFound();
  const related: any[] = await relatedRepositories(r.slug, r.subCategories, r.language);
  const subs = Array.isArray(r.subCategories) ? r.subCategories : [];
  return (
    <RepositoryDetail
      repo={{
        slug: r.slug,
        name: r.name,
        owner: r.owner ?? null,
        ownerAvatarUrl: r.ownerAvatarUrl ?? null,
        description: r.description ?? null,
        url: r.url ?? null,
        homepage: r.homepage ?? null,
        language: r.language ?? null,
        license: r.license ?? null,
        topics: strArr(r.topics),
        stars: r.stars ?? 0,
        forks: r.forks ?? 0,
        openIssues: r.openIssues ?? 0,
        logoUrl: r.logoUrl ?? null,
        githubCreatedAt: r.githubCreatedAt ? new Date(r.githubCreatedAt).toISOString() : null,
        syncedAt: r.syncedAt ? new Date(r.syncedAt).toISOString() : null,
        subCategories: subs
          .filter((s: any) => s?.slug && s?.name)
          .map((s: any) => ({ slug: String(s.slug), name: String(s.name) })),
        related: related.map((x: any) => ({
          slug: x.slug,
          name: x.name,
          logoUrl: x.logoUrl ?? x.ownerAvatarUrl ?? null,
          stars: x.stars ?? 0,
        })),
      }}
    />
  );
}
