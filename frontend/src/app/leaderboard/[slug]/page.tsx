import Link from "next/link";
export default async function Detail({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  return (
    <div className="mx-auto max-w-[1280px] px-4 py-10">
      <Link href="/leaderboard" className="text-sm text-zinc-500 hover:underline">← Back to Leaderboard</Link>
      <div className="mt-6 rounded-2xl border p-8 dark:border-zinc-800">
        <h1 className="text-2xl font-bold capitalize">{slug.replaceAll("-"," ")}</h1>
        <p className="mt-2 text-sm text-zinc-600">Detail page — fetched from <code>/api/v1/leaderboard/{slug}</code> (own Next.js route → Prisma).</p>
        <div className="mt-6 grid gap-4 md:grid-cols-3">
          <div className="rounded-xl border p-4 dark:border-zinc-800"><h3 className="font-semibold">About</h3><p className="text-sm text-zinc-600">Seed from live URL reproduction. Prisma model: Leaderboard.</p></div>
          <div className="rounded-xl border p-4 dark:border-zinc-800"><h3 className="font-semibold">Specs</h3><p className="text-sm text-zinc-600">Stored via aiorbit_schema.sql normalized tables.</p></div>
          <div className="rounded-xl border p-4 dark:border-zinc-800"><h3 className="font-semibold">Related</h3><p className="text-sm text-zinc-600">Company ↔ Model ↔ Device relations.</p></div>
        </div>
      </div>
    </div>
  );
}
