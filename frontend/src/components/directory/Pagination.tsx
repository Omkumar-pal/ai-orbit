import Link from "next/link";

export default function Pagination({ page, pageSize, total, basePath }: { page: number; pageSize: number; total?: number; basePath: string }) {
  const hasPrev = page > 1;
  const hasNext = total ? page * pageSize < total : true;
  return (
    <div className="flex items-center justify-between pt-6 text-sm">
      <span className="text-zinc-500">Page {page}{total ? ` — ${total} total` : ""}</span>
      <div className="flex gap-2">
        {hasPrev && <Link href={`${basePath}?page=${page-1}&pageSize=${pageSize}`} className="rounded-full border px-4 py-2 hover:bg-zinc-50 dark:border-zinc-700">Prev</Link>}
        {hasNext && <Link href={`${basePath}?page=${page+1}&pageSize=${pageSize}`} className="rounded-full bg-black px-4 py-2 text-white hover:bg-zinc-800 dark:bg-white dark:text-black">Next</Link>}
      </div>
    </div>
  );
}
