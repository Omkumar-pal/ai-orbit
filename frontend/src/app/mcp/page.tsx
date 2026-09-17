import DirectoryRoute from "@/components/directory/DirectoryRoute";
export const metadata = { title: "MCP | AI Orbit" };
export default async function Page({ searchParams }: { searchParams: Promise<{ q?: string; category?: string }> }) {
  const sp = await searchParams;
  return <DirectoryRoute resource="mcp" title="MCP | AI Orbit" intro="Model Context Protocol servers and integrations." searchParams={sp} />;
}
