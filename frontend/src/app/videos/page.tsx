import { pagedVideos } from "@/lib/directory";
import VideosExperience from "@/components/videos/VideosExperience";

export const metadata = { title: "AI Videos | AI Orbit" };

const PAGE_SIZE = 100;

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; category?: string; page?: string; sort?: string; dir?: string }>;
}) {
  const sp = await searchParams;
  const category = sp.category ?? "";
  const result = await pagedVideos({
    page: 1,
    pageSize: PAGE_SIZE,
    q: sp.q,
    category: category || undefined,
    sort: sp.sort || "posted",
    dir: sp.dir || "desc",
  });
  // Serialize explicitly: no Date objects may cross into the client component.
  const initialVideos = result.videos.map((v: any) => ({
    ...v,
    publishedAt: v.publishedAt ? new Date(v.publishedAt).toISOString() : null,
    createdAt: v.createdAt ? new Date(v.createdAt).toISOString() : null,
    updatedAt: v.updatedAt ? new Date(v.updatedAt).toISOString() : null,
  }));
  return (
    <VideosExperience
      initialVideos={initialVideos}
      initialTotal={result.total}
      pageSize={PAGE_SIZE}
      defaultCategory={category}
      initialQuery={sp.q ?? ""}
    />
  );
}
