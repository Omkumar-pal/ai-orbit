import FilterBar from "@/components/directory/FilterBar";
import { DirectoryGrid } from "@/components/directory/DirectoryGrid";
import Pagination from "@/components/directory/Pagination";

export const metadata = { title: "Leaderboard | AI Orbit" };

async function getData(page: number, pageSize: number) {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"}/api/v1/leaderboard?page=${page}&pageSize=${pageSize}`, { cache: "no-store" });
    if(!res.ok) throw new Error(String(res.status));
    return await res.json();
  } catch(e) { return null; }
}

export default async function Page({ searchParams }: { searchParams: Promise<{ page?: string; pageSize?: string }> }) {
  const sp = await searchParams;
  const page = Number(sp.page ?? 1);
  const pageSize = Number(sp.pageSize ?? 24);
  const data = await getData(page, pageSize);
  const key = "leaderboard" in (data ?? {}) ? "leaderboard" : Object.keys(data ?? {})[0];
  const itemsRaw: any[] = (data as any)?.[key] ?? (data as any)?.data ?? [];
  const items = itemsRaw.map((x:any)=>({
    slug: x.slug, title: x.name ?? x.title, description: x.description ?? x.about ?? x.shortDescription,
    logoUrl: x.logoUrl ?? x.logo_url ?? x.imageUrl, href: "/leaderboard/"+x.slug, verified: x.verified
  }));
  return (
    <div className="mx-auto max-w-[1280px] px-4 py-6 space-y-6">
      <div><h1 className="text-2xl font-bold">Leaderboard</h1><p className="text-sm text-zinc-600">AI ecosystem leaderboard</p></div>
      <FilterBar categories={['Audio & Voice', 'Chatbot']} sorts={["Latest","Popular","Name"]} />
      {!data && <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm">Live API <code>leaderboard</code> not yet seeded — showing empty. Backend will fill via Prisma.</div>}
      <DirectoryGrid items={items} />
      <Pagination page={page} pageSize={pageSize} basePath="/leaderboard" />
    </div>
  );
}
