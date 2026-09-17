import DirectoryRoute from "@/components/directory/DirectoryRoute";
export const metadata = { title: "Repositories | AI Orbit" };
export default async function Page({ searchParams }: { searchParams: Promise<{ q?: string; category?: string }> }) {
  const sp = await searchParams;
  return <DirectoryRoute resource="repositories" title="Repositories | AI Orbit" intro="Open-source projects powering the AI ecosystem." searchParams={sp} />;
}
