import DirectoryRoute from "@/components/directory/DirectoryRoute";
export const metadata = { title: "AI Agents | AI Orbit" };
export default async function Page({ searchParams }: { searchParams: Promise<{ q?: string; category?: string }> }) {
  const sp = await searchParams;
  return <DirectoryRoute resource="agents" title="AI Agents" intro="Explore autonomous agents for work, research, and everyday tasks." searchParams={sp} />;
}
