import DirectoryRoute from "@/components/directory/DirectoryRoute";
export const metadata = { title: "AI News | AI Orbit" };
export default async function Page({ searchParams }: { searchParams: Promise<{ q?: string; category?: string; filter?: string; sort?: string }> }) {
  const sp = await searchParams;
  // Live pill URLs use ?filter={key}; accept both spellings.
  const category = sp.category ?? sp.filter;
  return <DirectoryRoute resource="news" title="AI News" intro="The AI Signal — latest news from across the ecosystem." searchParams={{ q: sp.q, category }} />;
}
