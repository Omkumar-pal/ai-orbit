"use client";

import { useState } from "react";
import Link from "next/link";
import { formatPosted } from "@/lib/newsFilters";

export type NewsRelated = {
  slug: string;
  headline: string;
  category: string | null;
  hours: number;
  publisherName: string;
  publisherLogo: string | null;
};

export type NewsDetailData = {
  slug: string;
  headline: string;
  dek: string | null;
  aiSummary: string | null;
  articleUrl: string | null;
  category: string | null;
  topics: string[];
  filters: string[];
  hours: number;
  up: number;
  down: number;
  score: number;
  publisherName: string;
  publisherLogo: string | null;
  publisherDomain: string | null;
  related: NewsRelated[];
};

function Mark({ name, logoUrl, size = "md" }: { name: string; logoUrl: string | null; size?: "sm" | "md" | "lg" }) {
  const [failed, setFailed] = useState(false);
  const dims =
    size === "lg"
      ? "h-12 w-12 rounded-xl text-lg"
      : size === "sm"
        ? "h-5 w-5 rounded-md text-[10px]"
        : "h-8 w-8 rounded-lg text-sm";
  if (logoUrl && !failed) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img src={logoUrl} alt="" onError={() => setFailed(true)} className={`${dims} shrink-0 object-cover`} />
    );
  }
  return (
    <span className={`flex ${dims} shrink-0 items-center justify-center bg-[#6E56CF]/20 font-black text-[#A78BFA]`}>
      {name.charAt(0).toUpperCase()}
    </span>
  );
}

export default function NewsDetail({ article: a }: { article: NewsDetailData }) {
  const [upvoted, setUpvoted] = useState(false);
  const [downvoted, setDownvoted] = useState(false);
  const [saved, setSaved] = useState(false);
  const [shared, setShared] = useState(false);

  const share = async () => {
    const url = `${window.location.origin}/news/${a.slug}`;
    if (navigator.share) {
      try {
        await navigator.share({ title: a.headline, url });
        return;
      } catch {
        /* dismissed */
      }
    }
    try {
      await navigator.clipboard.writeText(url);
    } catch {
      /* unavailable */
    }
    setShared(true);
    window.setTimeout(() => setShared(false), 1800);
  };

  return (
    <div className="w-full bg-black text-white">
      <div className="mx-auto max-w-3xl space-y-4 px-4 py-10 sm:px-6">
        <nav className="flex items-center gap-1.5 text-xs text-[#71717A]" aria-label="Breadcrumb">
          <Link href="/" className="shrink-0 transition-colors hover:text-white">Home</Link>
          <span aria-hidden="true">›</span>
          <Link href="/news" className="shrink-0 transition-colors hover:text-white">News</Link>
          <span aria-hidden="true">›</span>
          <span className="truncate text-[#D4D4D8]">{a.headline}</span>
        </nav>

        <h1 className="text-3xl font-black tracking-tight text-white sm:text-4xl">{a.headline}</h1>

        <div className="flex flex-wrap items-center gap-x-3 gap-y-2 text-xs text-[#A1A1AA]">
          {a.category && (
            <Link
              href={`/news?filter=${encodeURIComponent(a.category)}`}
              className="inline-flex items-center rounded-md border border-[#6E56CF]/25 bg-[#6E56CF]/10 px-2.5 py-1 text-[11px] leading-none font-semibold text-[#A78BFA] transition-colors hover:text-white"
            >
              {a.category}
            </Link>
          )}
          <span className="inline-flex items-center gap-1.5">
            <Mark name={a.publisherName} logoUrl={a.publisherLogo} size="sm" />
            <span className="font-semibold text-[#D4D4D8]">{a.publisherName}</span>
          </span>
          <span className="text-[#52525B]" aria-hidden="true">•</span>
          <span>{formatPosted(a.hours)}</span>
          {a.score >= 90 && (
            <>
              <span className="text-[#52525B]" aria-hidden="true">•</span>
              <span className="inline-flex items-center gap-1 rounded-full border border-[#F5C84C]/30 bg-[#F5C84C]/10 px-2 py-0.5 text-[10px] font-bold text-[#F5C84C]">
                Trending · {a.score}
              </span>
            </>
          )}
        </div>

        <div className="relative flex h-64 items-end overflow-hidden rounded-lg border border-[#232326] bg-[#131316]">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(110,86,207,0.18),transparent_55%)]" />
          <div className="relative flex w-full items-center gap-4 p-6">
            <Mark name={a.publisherName} logoUrl={a.publisherLogo} size="lg" />
            <div className="min-w-0">
              <p className="truncate text-base font-bold text-white">{a.publisherName}</p>
              {a.publisherDomain && (
                <p className="truncate text-xs text-[#71717A]">{a.publisherDomain}</p>
              )}
            </div>
            {a.articleUrl && (
              <a
                href={a.articleUrl}
                target="_blank"
                rel="noopener noreferrer nofollow"
                className="ml-auto inline-flex shrink-0 items-center gap-1.5 rounded-xl bg-[#6E56CF] px-4 py-2.5 text-xs font-extrabold text-white shadow-lg shadow-[#6E56CF]/25 transition-all hover:bg-[#7C66DF] active:scale-95"
              >
                Read full article ↗
              </a>
            )}
          </div>
        </div>

        {a.dek && <p className="text-[15px] leading-7 text-[#D4D4D8]">{a.dek}</p>}

        {a.aiSummary && (
          <section className="rounded-2xl border border-[#1e1e22] bg-[#09090c] p-5 sm:p-6">
            <h2 className="mb-3 text-sm font-bold tracking-wide text-white uppercase">AI Summary</h2>
            <p className="text-sm leading-7 text-[#A1A1AA]">{a.aiSummary}</p>
          </section>
        )}

        {(a.topics.length > 0 || a.filters.length > 0) && (
          <div className="flex flex-wrap items-center gap-1.5">
            {a.topics.map((t) => (
              <Link
                key={t}
                href={`/news?q=${encodeURIComponent(t)}`}
                className="inline-block rounded-md border border-[#232326] bg-[#131316] px-2.5 py-1 text-[11px] leading-none font-semibold text-[#A1A1AA] transition-all hover:border-[#6E56CF]/30 hover:text-white"
              >
                {t}
              </Link>
            ))}
            {a.filters.map((f) => (
              <span
                key={f}
                className="inline-block rounded-md border border-[#232326] bg-[#131316] px-2.5 py-1 font-mono text-[11px] leading-none text-[#71717A]"
              >
                {f}
              </span>
            ))}
          </div>
        )}

        <div className="flex items-center gap-2 border-t border-[#1F1F24] pt-4">
          <button
            type="button"
            onClick={() => {
              setUpvoted((v) => !v);
              setDownvoted(false);
            }}
            aria-pressed={upvoted}
            aria-label="Upvote this article"
            className={`inline-flex items-center gap-1.5 rounded-xl border px-3 py-2 text-xs font-bold transition-all active:scale-95 ${upvoted ? "border-[#6E56CF] bg-[#6E56CF]/20 text-white" : "border-[#232326] bg-[#131316] text-[#A1A1AA] hover:border-[#3A3A3E] hover:text-white"}`}
          >
            ▲ {a.up + (upvoted ? 1 : 0)}
          </button>
          <button
            type="button"
            onClick={() => {
              setDownvoted((v) => !v);
              setUpvoted(false);
            }}
            aria-pressed={downvoted}
            aria-label="Downvote this article"
            className={`inline-flex items-center gap-1.5 rounded-xl border px-3 py-2 text-xs font-bold transition-all active:scale-95 ${downvoted ? "border-[#6E56CF] bg-[#6E56CF]/20 text-white" : "border-[#232326] bg-[#131316] text-[#A1A1AA] hover:border-[#3A3A3E] hover:text-white"}`}
          >
            ▼ {a.down + (downvoted ? 1 : 0)}
          </button>
          <button
            type="button"
            onClick={() => setSaved((v) => !v)}
            aria-pressed={saved}
            title="Save article (coming soon)"
            className={`inline-flex items-center gap-1.5 rounded-xl border px-3 py-2 text-xs font-bold transition-all active:scale-95 ${saved ? "border-[#6E56CF] bg-[#6E56CF]/20 text-white" : "border-[#232326] bg-[#131316] text-[#A1A1AA] hover:border-[#3A3A3E] hover:text-white"}`}
          >
            {saved ? "Saved ✓" : "☆ Save"}
          </button>
          <button
            type="button"
            onClick={share}
            className="inline-flex items-center gap-1.5 rounded-xl border border-[#232326] bg-[#131316] px-3 py-2 text-xs font-bold text-[#A1A1AA] transition-all hover:border-[#3A3A3E] hover:text-white active:scale-95"
          >
            {shared ? "Copied ✓" : "⤴ Share"}
          </button>
        </div>

        {a.related.length > 0 && (
          <section className="pt-4">
            <h2 className="mb-3 text-[21px] font-bold tracking-tight text-white">Related articles</h2>
            <div className="grid gap-3 sm:grid-cols-2">
              {a.related.map((r) => (
                <Link
                  key={r.slug}
                  href={`/news/${r.slug}`}
                  className="group flex items-start gap-3 rounded-xl border border-[#232326] bg-[#121214] p-4 transition-colors hover:border-[#39393E]"
                >
                  <Mark name={r.publisherName} logoUrl={r.publisherLogo} />
                  <span className="min-w-0">
                    <span className="block text-sm leading-snug font-semibold text-white transition-colors group-hover:text-[#A78BFA]">
                      {r.headline}
                    </span>
                    <span className="mt-2 block truncate text-[11px] text-[#71717A]">
                      {r.category} · {r.publisherName} · {formatPosted(r.hours)}
                    </span>
                  </span>
                </Link>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
