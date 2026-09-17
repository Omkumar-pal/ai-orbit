import DirectoryRoute from "@/components/directory/DirectoryRoute";
export const metadata = { title: "AI Devices | AI Orbit" };
export default async function Page({ searchParams }: { searchParams: Promise<{ q?: string; category?: string }> }) {
  const sp = await searchParams;
  return <DirectoryRoute resource="devices" title="AI Devices | AI Orbit" intro="Browse the new hardware interfaces for AI." searchParams={sp} />;
}
