import DirectoryRoute from "@/components/directory/DirectoryRoute";
export const metadata = { title: "Creativity AI | AI Orbit" };
export default async function Page({ searchParams }: { searchParams: Promise<{ q?: string; category?: string }> }) {
  const sp = await searchParams;
  return <DirectoryRoute resource="creativity" title="Creativity AI | AI Orbit" intro="AI tools for ideas, images, video, audio, and visual storytelling." searchParams={sp} />;
}
