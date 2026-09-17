import { notFound } from "next/navigation";
import { robotBySlug, relatedRobots } from "@/lib/directory";
import RobotDetail from "@/components/robots/RobotDetail";

const strArr = (v: unknown): string[] => (Array.isArray(v) ? v.map(String) : []);

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const r: any = await robotBySlug(slug);
  if (!r) return { title: "Robot Not Found | AI Orbit" };
  return { title: `${r.name} — Robots | AI Orbit`, description: r.about?.slice(0, 160) ?? `${r.name} robot details and specifications.` };
}

export default async function Detail({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const r: any = await robotBySlug(slug);
  if (!r) notFound();
  const related: any[] = await relatedRobots(r.slug, r.category, r.company);
  const linked = Array.isArray(r.linkedTasks) ? r.linkedTasks : [];
  return (
    <RobotDetail
      robot={{
        slug: r.slug,
        name: r.name,
        logoUrl: r.logoUrl ?? null,
        thumbnailUrl: r.thumbnailUrl ?? null,
        company: r.company ?? null,
        country: r.country ?? null,
        category: r.category ?? null,
        availability: r.availability ?? null,
        price: r.price != null ? String(r.price) : null,
        releaseDate: r.releaseDate ? new Date(r.releaseDate).toISOString() : null,
        mainTask: r.mainTask ?? null,
        autonomyLevel: r.autonomyLevel ?? null,
        primaryUseCases: strArr(r.primaryUseCases),
        websiteUrl: r.websiteUrl ?? null,
        about: r.about ?? null,
        specs: r.specs ?? null,
        linkedTasks: linked
          .filter((t: any) => t?.slug && t?.title)
          .map((t: any) => ({ slug: String(t.slug), title: String(t.title) })),
        related: related.map((x: any) => ({
          slug: x.slug,
          name: x.name,
          logoUrl: x.logoUrl ?? null,
          company: x.company ?? null,
        })),
      }}
    />
  );
}
