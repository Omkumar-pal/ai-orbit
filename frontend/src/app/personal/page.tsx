import DirectoryRoute from "@/components/directory/DirectoryRoute";
export const metadata = { title: "Personal AI | AI Orbit" };
export default async function Page({ searchParams }: { searchParams: Promise<{ q?: string; category?: string }> }) {
  const sp = await searchParams;
  return <DirectoryRoute resource="personal" title="Personal AI | AI Orbit" intro="AI tools for everyday life, learning, and personal productivity." searchParams={sp} />;
}
