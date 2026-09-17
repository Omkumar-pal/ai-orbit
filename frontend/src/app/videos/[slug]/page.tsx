import { notFound } from "next/navigation";
import { videoBySlug, pagedVideos } from "@/lib/directory";
import VideosExperience from "@/components/videos/VideosExperience";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const video: any = await videoBySlug(slug);
  if (!video) return { title: "Video Not Found | AI Orbit" };
  return {
    title: `${video.title} | AI Orbit`,
    description: video.description?.slice(0, 160) ?? `Watch ${video.title} and more AI videos.`,
  };
}

// Dialog-over-listing: same listing with the video dialog pre-opened.
export default async function Detail({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const video: any = await videoBySlug(slug);
  if (!video) notFound();

  const result = await pagedVideos({ page: 1, pageSize: 100, sort: "posted", dir: "desc" });
  // Serialize explicitly: no Date objects may cross into the client component.
  const selected = {
    ...video,
    publishedAt: video.publishedAt ? new Date(video.publishedAt).toISOString() : null,
    createdAt: video.createdAt ? new Date(video.createdAt).toISOString() : null,
    updatedAt: video.updatedAt ? new Date(video.updatedAt).toISOString() : null,
  };
  return (
    <VideosExperience
      initialVideos={result.videos}
      initialTotal={result.total}
      pageSize={100}
      initialSelected={selected}
    />
  );
}
