import Link from "next/link";

type CardProps = {
  href: string;
  title: string;
  description?: string | null;
  logoUrl?: string | null;
  badge?: string;
  meta?: string;
  verified?: boolean;
};

export function Card({ href, title, description, logoUrl, badge, meta, verified }: CardProps) {
  return (
    <Link
      href={href}
      className="group flex flex-col rounded-2xl border border-zinc-200 bg-white p-4 transition hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900"
    >
      <div className="mb-3 flex items-start justify-between gap-2">
        <img
          src={logoUrl || `https://www.google.com/s2/favicons?domain=${encodeURIComponent(title.toLowerCase())}.com&sz=128`}
          alt={title}
          className="h-10 w-10 rounded-lg border border-zinc-100 object-contain bg-white p-1 dark:border-zinc-800"
          loading="lazy"
        />
        {badge && <span className="rounded-full bg-zinc-900 px-2 py-1 text-[10px] font-bold uppercase tracking-widest text-white dark:bg-white dark:text-black">{badge}</span>}
      </div>
      <h3 className="line-clamp-1 text-sm font-semibold group-hover:underline">
        {title} {verified && <span className="ml-1 text-blue-500" title="Verified">✓</span>}
      </h3>
      {description && <p className="mt-1 line-clamp-2 text-xs text-zinc-600 dark:text-zinc-400">{description}</p>}
      {meta && <p className="mt-2 text-[11px] text-zinc-500">{meta}</p>}
    </Link>
  );
}

export function CardSkeleton() {
  return <div className="h-[140px] animate-pulse rounded-2xl border border-zinc-200 bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900" />;
}
