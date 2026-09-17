import { Card, CardSkeleton } from "@/components/ui/Card";

export type GridItem = {
  slug: string;
  title: string;
  description?: string | null;
  logoUrl?: string | null;
  href: string;
  badge?: string;
  meta?: string;
  verified?: boolean;
};

export function DirectoryGrid({ items, loading }: { items: GridItem[]; loading?: boolean }) {
  if (loading) {
    return (
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <CardSkeleton key={i} />
        ))}
      </div>
    );
  }
  if (!items.length) {
    return <div className="rounded-xl border border-dashed p-10 text-center text-sm text-zinc-500">No results. Wired to <code>/api/v1/*</code> — seed from live URL pending.</div>;
  }
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {items.map((it) => (
        <Card key={it.slug} {...it} />
      ))}
    </div>
  );
}
