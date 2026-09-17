import DirectoryRoute from "@/components/directory/DirectoryRoute";
export const metadata = { title: "AI Robots | AI Orbit" };
export default async function Page({ searchParams }: { searchParams: Promise<{ q?: string; category?: string }> }) {
  const sp = await searchParams;
  return <DirectoryRoute resource="robots" title="AI Robots | AI Orbit" intro="Meet robots moving AI from screens into the physical world." searchParams={sp} />;
}
