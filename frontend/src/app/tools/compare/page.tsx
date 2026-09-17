export const metadata = { title: "Compare AI Tools | AI Orbit" };
export default function ComparePage() {
  return (
    <div className="mx-auto max-w-[1280px] px-4 py-10">
      <h1 className="text-2xl font-bold">AI Tools Comparison</h1>
      <p className="mt-2 text-sm text-zinc-600">Compare tools side-by-side. Data via own <code>/api/v1/tools/compare</code> (to be built with Prisma).</p>
      <div className="mt-6 grid gap-4 md:grid-cols-2">
        <div className="rounded-2xl border p-6 dark:border-zinc-800">Select Tool A — search wired to <code>/api/v1/search?q=</code></div>
        <div className="rounded-2xl border p-6 dark:border-zinc-800">Select Tool B</div>
      </div>
    </div>
  );
}
