import DirectoryRoute from "@/components/directory/DirectoryRoute";
export const metadata = { title: "AI Models | AI Orbit" };
export default async function Page({ searchParams }: { searchParams: Promise<{ q?: string; category?: string }> }) {
  const sp = await searchParams;
  return <DirectoryRoute resource="models" title="AI Models | AI Orbit" intro="Browse frontier models, capabilities, and providers." searchParams={sp} />;
}
