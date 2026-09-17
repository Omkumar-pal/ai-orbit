"use client";

import { useState } from "react";
import Link from "next/link";

export type McpDetailData = {
  slug: string;
  name: string;
  itemType: string | null;
  shortDescription: string | null;
  fullDescription: string | null;
  providerName: string | null;
  providerUrl: string | null;
  license: string | null;
  pricingType: string | null;
  isFeatured: boolean;
  isVerified: boolean;
  launchDate: string | null;
  websiteUrl: string | null;
  documentationUrl: string | null;
  repositoryUrl: string | null;
  qualityScore: number | null;
  easeOfUseScore: number | null;
  globalRank: number | null;
  viewCount: number;
  upvoteCount: number;
  saveCount: number;
  useCases: string[];
  categoryName: string | null;
  subCategoryName: string | null;
  tags: { slug: string; name: string }[];
  features: string[];
  faqs: { question: string; answer: string }[];
};

function fmtDate(value: string | null): string {
  if (!value) return "—";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function strList(v: unknown): string[] {
  if (Array.isArray(v)) return v.map(String).filter(Boolean);
  if (v != null) return [String(v)];
  return [];
}

export default function McpDetail({ item: m, features, faqs }: { item: McpDetailData; features: string[]; faqs: { question: string; answer: string }[] }) {
  const [saved, setSaved] = useState(false);
  const [copied, setCopied] = useState(false);

  const share = async () => {
    const url = window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({ title: m.name, text: m.shortDescription ?? "", url });
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

  return (
    <main className="mx-auto w-full max-w-[1400px] px-4 pt-2 pb-5 md:px-6 md:pt-3 md:pb-8 text-white">
      <nav className="mb-2 text-xs font-semibold text-[#52525B] flex items-center gap-1.5 flex-wrap" aria-label="Breadcrumb">
        <Link href="/" className="hover:text-white transition-colors">Home</Link>
        <span>›</span>
        <Link href="/mcp" className="hover:text-white transition-colors">MCP</Link>
        <span>›</span>
        <span className="text-[#A1A1AA] truncate max-w-[220px] sm:max-w-none">{m.name}</span>
      </nav>

      <header className="relative rounded-2xl border border-[#1e1e22] bg-[#09090c] overflow-hidden mb-5">
        <div className="absolute inset-0 bg-gradient-to-br from-[#6E56CF]/6 via-[#6E56CF]/2 to-transparent pointer-events-none" />
        <div className="relative p-4 md:p-8">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="flex min-w-0 items-start gap-4">
              <span className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-[#6E56CF]/15 text-2xl font-black text-[#A78BFA]">
                {m.name.charAt(0)}
              </span>
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="text-2xl md:text-3xl font-black text-white tracking-tight leading-none">{m.name}</h1>
                  {m.isVerified && <span title="Verified" className="text-[16px] text-[#6E56CF]">✓</span>}
                </div>
                {m.providerName && (
                  <p className="mt-1.5 text-sm text-[#A1A1AA]">by <span className="font-bold text-white">{m.providerName}</span></p>
                )}
                <div className="mt-2.5 flex flex-wrap items-center gap-1.5">
                  {m.itemType && (
                    <span className="inline-flex items-center px-2.5 py-1 rounded-md bg-[#18181C] ring-1 ring-[#232326]/70 text-[11px] text-[#A1A1AA] font-mono">{m.itemType}</span>
                  )}
                  {m.pricingType && (
                    <span className="inline-flex items-center px-2.5 py-1 rounded-md bg-[#18181C] ring-1 ring-[#232326]/70 text-[11px] text-[#A1A1AA] font-mono">{m.pricingType}</span>
                  )}
                  {m.categoryName && (
                    <span className="inline-flex items-center px-2.5 py-1 rounded-md bg-[#18181C] ring-1 ring-[#232326]/70 text-[11px] text-[#A1A1AA]">{m.categoryName}</span>
                  )}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={() => setSaved((v) => !v)}
                aria-pressed={saved}
                title="Save MCP item (coming soon)"
                className={`inline-flex h-10 items-center gap-1.5 rounded-xl border px-3.5 text-xs font-bold transition active:scale-95 ${saved ? "border-[#6E56CF]/60 bg-[#6E56CF]/20 text-white" : "border-[#232326] bg-[#131316] text-[#A1A1AA] hover:text-white hover:border-[#3A3A3E]"}`}
              >
                {saved ? "Saved ✓" : "☆ Save"}
              </button>
              {m.websiteUrl && (
                <a href={m.websiteUrl} target="_blank" rel="noopener noreferrer nofollow" className="inline-flex h-10 items-center gap-1.5 rounded-xl bg-[#6E56CF] px-4 text-xs font-extrabold text-white shadow-lg shadow-[#6E56CF]/25 transition hover:bg-[#7C66DF] active:scale-95">
                  Visit ↗
                </a>
              )}
              <button
                type="button"
                onClick={share}
                aria-label="Share this item"
                className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-[#232326] bg-[#131316] text-[#A1A1AA] hover:text-white hover:border-[#3A3A3E] transition active:scale-95"
              >
                {copied ? "✓" : "⤴"}
              </button>
            </div>
          </div>
          {m.shortDescription && (
            <p className="mt-4 max-w-3xl text-sm leading-7 text-[#A1A1AA]">{m.shortDescription}</p>
          )}
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-5 items-start">
        <div className="min-w-0 space-y-4">
          {m.fullDescription && (
            <section className="rounded-xl border border-[#1e1e22] bg-[#09090c] p-5">
              <h2 className="mb-3 text-base font-bold text-white">Overview</h2>
              <p className="text-[13px] leading-7 whitespace-pre-wrap text-[#A1A1AA]">{m.fullDescription}</p>
            </section>
          )}
          {features.length > 0 && (
            <section className="rounded-xl border border-[#1e1e22] bg-[#09090c] p-5">
              <h2 className="mb-3 text-base font-bold text-white">Features <span className="font-normal text-[#71717A]">({features.length})</span></h2>
              <div className="grid gap-2.5 sm:grid-cols-2">
                {features.map((f, i) => (
                  <div key={i} className="flex items-start gap-2.5 rounded-xl border border-[#202024] bg-[#111113] px-4 py-3">
                    <span className="mt-0.5 text-[#9B7CFF]">◆</span>
                    <p className="text-[13px] font-medium text-[#E4E4E7]">{f}</p>
                  </div>
                ))}
              </div>
            </section>
          )}
          {m.useCases.length > 0 && (
            <section className="rounded-xl border border-[#1e1e22] bg-[#09090c] p-5">
              <h2 className="mb-3 text-base font-bold text-white">Use cases</h2>
              <div className="flex flex-wrap gap-2">
                {m.useCases.map((u, i) => (
                  <span key={i} className="rounded-lg border border-[#6E56CF]/25 bg-[#6E56CF]/10 px-3 py-1.5 text-xs font-semibold text-[#C4B8FF]">
                    {typeof u === "string" ? u : JSON.stringify(u)}
                  </span>
                ))}
              </div>
            </section>
          )}
          {m.tags.length > 0 && (
            <section className="rounded-xl border border-[#1e1e22] bg-[#09090c] p-5">
              <h2 className="mb-3 text-base font-bold text-white">Tags</h2>
              <div className="flex flex-wrap gap-1.5">
                {m.tags.map((t) => (
                  <span key={t.slug} className="rounded-md border border-[#232326] bg-[#131316] px-2.5 py-1 font-mono text-[11px] text-[#A1A1AA]">#{t.name}</span>
                ))}
              </div>
            </section>
          )}
          {faqs.length > 0 && (
            <section className="rounded-xl border border-[#1e1e22] bg-[#09090c] p-5">
              <h2 className="mb-3 text-base font-bold text-white">FAQs <span className="font-normal text-[#71717A]">({faqs.length})</span></h2>
              <div className="space-y-3">
                {faqs.map((f, i) => (
                  <div key={i} className="rounded-xl border border-[#232326] bg-[#131316]/40 p-4">
                    <p className="text-[13px] font-bold text-white">{f.question}</p>
                    <p className="mt-1.5 text-[13px] leading-6 text-[#A1A1AA]">{f.answer}</p>
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>
        <aside className="space-y-4 lg:sticky lg:top-24">
          <section className="rounded-xl border border-white/[0.08] bg-[#111114] p-4">
            <h2 className="text-sm font-bold text-white">Quick facts</h2>
            <dl className="mt-3 divide-y divide-white/[0.06]">
              {[
                ["Provider", m.providerName],
                ["Type", m.itemType],
                ["Pricing", m.pricingType],
                ["Released", fmtDate(m.launchDate)],
                ["Quality", m.qualityScore != null ? `${m.qualityScore}/100` : null],
                ["Views", m.viewCount > 0 ? m.viewCount.toLocaleString("en-US") : null],
                ["Upvotes", m.upvoteCount > 0 ? String(m.upvoteCount) : null],
              ].map(([k, v]) => (
                <div key={k} className="flex items-start justify-between gap-4 py-2.5 first:pt-0 last:pb-0">
                  <dt className="text-xs text-[#71717A]">{k}</dt>
                  <dd className="max-w-[60%] text-right text-xs font-semibold text-[#D4D4D8]">{v ?? "—"}</dd>
                </div>
              ))}
            </dl>
          </section>
          {(m.websiteUrl || m.documentationUrl || m.repositoryUrl) && (
            <section className="rounded-xl border border-white/[0.08] bg-[#111114] p-4">
              <h2 className="mb-3 text-sm font-bold text-white">Links</h2>
              <div className="space-y-2.5">
                {[
                  ["Website", m.websiteUrl],
                  ["Documentation", m.documentationUrl],
                  ["Repository", m.repositoryUrl],
                ].map(([k, v]) =>
                  v ? (
                    <a key={k} href={v as string} target="_blank" rel="noopener noreferrer nofollow" className="flex items-center gap-3 text-xs text-[#A1A1AA] transition hover:text-white">
                      <span className="min-w-0 flex-1 truncate">{k}</span>
                      <span aria-hidden="true">↗</span>
                    </a>
                  ) : null
                )}
              </div>
            </section>
          )}
        </aside>
      </div>
    </main>
  );
}
