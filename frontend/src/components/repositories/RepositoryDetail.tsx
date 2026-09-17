"use client";

import { useState } from "react";
import Link from "next/link";

export type RepoRelated = { slug: string; name: string; logoUrl: string | null; stars: number };

export type RepoDetailData = {
  slug: string;
  name: string;
  owner: string | null;
  ownerAvatarUrl: string | null;
  description: string | null;
  url: string | null;
  homepage: string | null;
  language: string | null;
  license: string | null;
  topics: string[];
  stars: number;
  forks: number;
  openIssues: number;
  logoUrl: string | null;
  githubCreatedAt: string | null;
  syncedAt: string | null;
  subCategories: { name: string; slug: string }[];
  related: RepoRelated[];
};

function fmtDate(value: string | null): string {
  if (!value) return "—";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

export default function RepositoryDetail({ repo: r }: { repo: RepoDetailData }) {
  const [saved, setSaved] = useState(false);
  const [copied, setCopied] = useState(false);

  const share = async () => {
    const url = window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({ title: r.name, text: r.description ?? "", url });
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
    setCopied(true);
    window.setTimeout(() => setCopied(false), 2000);
  };

  const avatar = r.logoUrl ?? r.ownerAvatarUrl;

  return (
    <div className="flex min-h-screen flex-col bg-black text-white selection:bg-neutral-800 selection:text-white">
      <div className="mx-auto w-full max-w-[1280px] space-y-4 px-4 py-4">
        <nav className="flex items-center gap-1.5 text-xs text-[#71717A]" aria-label="Breadcrumb">
          <Link href="/" className="hover:text-white">Home</Link>
          <span>›</span>
          <Link href="/repositories" className="hover:text-white">Repositories</Link>
          <span>›</span>
          <span className="truncate text-[#D4D4D8]">{r.name}</span>
        </nav>

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-12">
          <div className="lg:col-span-6">
            <div className="flex h-full min-h-[380px] flex-col justify-center gap-5 rounded-xl border border-white/5 bg-white/[0.02] p-6 sm:p-8">
              <div className="flex items-center gap-4">
                {avatar ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={avatar} alt="" className="h-16 w-16 shrink-0 rounded-2xl border border-white/10 bg-white object-cover" />
                ) : (
                  <span className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-[#18181C] text-2xl font-black text-white">
                    {r.name.charAt(0)}
                  </span>
                )}
                <div className="min-w-0">
                  <h1 className="truncate text-3xl font-bold tracking-tight text-white">{r.name}</h1>
                  {r.owner && <p className="mt-1 text-sm text-[#71717A]">by <span className="font-semibold text-[#A1A1AA]">{r.owner}</span></p>}
                </div>
              </div>
              {r.description && (
                <p className="text-sm leading-7 text-[#A1A1AA]">{r.description}</p>
              )}
              <div className="flex flex-wrap items-center gap-4">
                <span className="inline-flex items-center gap-1.5 text-sm font-bold text-white">★ {r.stars.toLocaleString("en-US")}</span>
                <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#A1A1AA]">⑂ {r.forks.toLocaleString("en-US")}</span>
                <span className="inline-flex items-center gap-1.5 text-sm text-[#71717A]">● {r.openIssues} open issues</span>
                {r.language && (
                  <span className="rounded-full border border-[#6E56CF]/25 bg-[#6E56CF]/10 px-2.5 py-1 text-[10px] font-semibold text-[#B8A7FF]">{r.language}</span>
                )}
              </div>
              <div className="flex gap-2">
                {r.url && (
                  <a href={r.url} target="_blank" rel="noopener noreferrer nofollow" className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-[#6E56CF] px-3 py-2.5 text-xs font-extrabold text-white shadow-lg shadow-[#6E56CF]/25 transition hover:bg-[#7C66DF] active:scale-95">
                    View on GitHub ↗
                  </a>
                )}
                <button
                  type="button"
                  onClick={() => setSaved((v) => !v)}
                  aria-pressed={saved}
                  title="Save repository (coming soon)"
                  className={`inline-flex flex-1 items-center justify-center gap-2 rounded-xl border px-3 py-2.5 text-xs font-bold transition ${saved ? "border-[#6E56CF]/60 bg-[#6E56CF]/20 text-white" : "border-white/[0.1] bg-white/[0.04] text-[#D4D4D8] hover:bg-white/[0.08] hover:text-white"}`}
                >
                  {saved ? "Saved ✓" : "☆ Save"}
                </button>
                <button
                  type="button"
                  onClick={share}
                  className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl border border-white/[0.1] bg-white/[0.04] px-3 py-2.5 text-xs font-bold text-[#D4D4D8] transition hover:bg-white/[0.08] hover:text-white"
                >
                  {copied ? "Copied ✓" : "⤴ Share"}
                </button>
              </div>
            </div>
          </div>
          <div className="space-y-3 lg:col-span-6">
            <div className="rounded-xl border border-white/5 bg-white/[0.02] p-5">
              <h2 className="mb-3 text-[21px] font-bold tracking-tight text-white">Details</h2>
              <div className="divide-y divide-white/[0.06]">
                {[
                  ["Owner", r.owner],
                  ["Language", r.language],
                  ["License", r.license],
                  ["Created", fmtDate(r.githubCreatedAt)],
                  ["Synced", fmtDate(r.syncedAt)],
                ].map(([k, v]) => (
                  <div key={k} className="flex items-center justify-between gap-4 py-2.5">
                    <span className="text-xs text-[#A1A1AA]">{k}</span>
                    <span className="max-w-[60%] truncate text-right text-xs font-semibold text-white" title={v ?? "—"}>{v ?? "—"}</span>
                  </div>
                ))}
              </div>
              {r.homepage && (
                <a href={r.homepage} target="_blank" rel="noopener noreferrer nofollow" className="mt-3 inline-flex items-center gap-1.5 text-xs font-bold text-[#6E56CF] hover:underline">
                  {r.homepage.replace(/^https?:\/\//, "").replace(/\/$/, "")} ↗
                </a>
              )}
            </div>
            {r.topics.length > 0 && (
              <div className="rounded-xl border border-white/5 bg-white/[0.02] p-5">
                <h2 className="mb-3 text-[21px] font-bold tracking-tight text-white">Topics</h2>
                <div className="flex flex-wrap gap-1.5">
                  {r.topics.map((t) => (
                    <span key={t} className="rounded-md border border-[#232326] bg-[#131316] px-2 py-1 font-mono text-[11px] text-[#A1A1AA]">#{t}</span>
                  ))}
                </div>
              </div>
            )}
            {r.subCategories.length > 0 && (
              <div className="rounded-xl border border-white/5 bg-white/[0.02] p-5">
                <h2 className="mb-3 text-[21px] font-bold tracking-tight text-white">Categories</h2>
                <div className="flex flex-wrap gap-1.5">
                  {r.subCategories.map((c) => (
                    <Link key={c.slug} href={`/repositories?category=${encodeURIComponent(c.name)}`} className="rounded-md border border-[#6E56CF]/25 bg-[#6E56CF]/10 px-2.5 py-1 text-[11px] font-semibold text-[#B8A7FF] transition hover:text-white">
                      {c.name}
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {r.related.length > 0 && (
          <section>
            <h2 className="mb-3 text-[21px] font-bold tracking-tight text-white">
              Related repositories <span className="rounded-full bg-[#17171A] px-2 py-0.5 align-middle text-[10px] font-semibold text-[#71717A]">{r.related.length}</span>
            </h2>
            <div className="grid gap-3 md:grid-cols-2">
              {r.related.map((s) => (
                <Link key={s.slug} href={`/repositories/${s.slug}`} className="flex items-center gap-3 rounded-xl border border-[#232326] bg-[#121214] p-4 transition hover:border-[#39393E]">
                  {s.logoUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={s.logoUrl} alt="" className="h-10 w-10 shrink-0 rounded-xl object-cover" />
                  ) : (
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#18181C] text-sm font-black text-white">
                      {s.name.charAt(0)}
                    </span>
                  )}
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-semibold text-white">{s.name}</span>
                    <span className="mt-1 block text-xs text-[#71717A]">★ {s.stars.toLocaleString("en-US")}</span>
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
