export const metadata = { title: "AI Trends | AI Orbit" };
export default function TrendsPage() {
  return (
    <div className="mx-auto max-w-[1280px] px-4 py-16 text-center">
      <h1 className="text-3xl font-bold">404 — Trends not found</h1>
      <p className="mt-2 text-sm text-zinc-600">Observed live at <code>/trends</code> — replica returns 404 as per routes.json:13.</p>
      <a href="/" className="mt-6 inline-block rounded-full bg-black px-6 py-2 text-sm text-white dark:bg-white dark:text-black">Go Home</a>
    </div>
  );
}
