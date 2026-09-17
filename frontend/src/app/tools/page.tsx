import DirectoryRoute from "@/components/directory/DirectoryRoute";
export const metadata = { title: "AI Tools | AI Orbit" };
export default async function Page({ searchParams }: { searchParams: Promise<{ q?: string; category?: string }> }) {
  const sp = await searchParams;
  return <DirectoryRoute resource="tools" title="AI Tools" intro="Browse the full directory of AI tools." searchParams={sp} />;
}
