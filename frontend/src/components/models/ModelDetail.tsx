"use client";

import { useState } from "react";
import Link from "next/link";

export type ModelRelated = {
  slug: string;
  name: string;
  logoUrl: string | null;
  providerName: string | null;
};

export type ModelDetailData = {
  slug: string;
  name: string;
  description: string;
  providerName: string;
  providerSlug: string | null;
  providerLogo: string | null;
  modelType: string | null;
  modality: string | null;
  creator: string | null;
  contextWindow: string | null;
  parameterSize: string | null;
  releaseDate: string | null;
  websiteUrl: string | null;
  capabilities: string[];
  apiAvailable: boolean;
  openSource: boolean | null;
  primaryTask: string | null;
  updatedAt: string | null;
  related: ModelRelated[];
};

function orNA(v: string | null | undefined): string {
  return v ?? "Not available";
}

function monthYear(value: string | null): string {
  if (!value) return "Not available";
  const d = new Date(value);
  if (!Number.isNaN(d.getTime()) && /[-/]/.test(value)) {
    return d.toLocaleDateString("en-US", { month: "long", year: "numeric" });
  }
  return value;
}

function Logo({ src, name, size = "md" }: { src: string | null; name: string; size?: "md" | "sm" }) {
  const [failed, setFailed] = useState(false);
  const dims = size === "sm" ? "h-9 w-9" : "h-20 w-20";
  if (!src || failed) {
    return (
      <div className={`flex ${dims} items-center justify-center overflow-hidden rounded-2xl border border-white/10 bg-white text-2xl font-black text-neutral-900`}>
        {name.charAt(0)}
      </div>
    );
  }
  return (
    <div className={`flex ${dims} items-center justify-center overflow-hidden rounded-2xl border border-white/10 bg-white`}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={src} alt={name} className="h-full w-full object-contain p-1" onError={() => setFailed(true)} />
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0 bg-[#101013] p-2.5">
      <dt className="text-[9px] font-bold tracking-[0.13em] text-[#62626B] uppercase">{label}</dt>
      <dd className={`mt-1 truncate text-xs font-bold ${value === "Not available" ? "text-[#52525B]" : "text-white"}`} title={value}>
        {value}
      </dd>
    </div>
  );
}

function SectionTitle({ title, count }: { title: string; count?: number }) {
  return <h2 className="mb-3 text-base font-bold text-white">{title}{typeof count === "number" && <span className="font-normal text-[#71717A]"> ({count})</span>}</h2>;
}

export default function ModelDetail({ model: m }: { model: ModelDetailData }) {
  const [saved, setSaved] = useState(false);
  const [copied, setCopied] = useState(false);

  const share = async () => {
    const url = window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({ title: m.name, text: m.description, url });
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
    <main className="relative mx-auto w-full max-w-[1180px] flex-1 px-4 py-6 sm:px-6 sm:py-10">
      <nav className="mb-4 flex items-center gap-1.5 text-xs text-[#71717A]" aria-label="Breadcrumb">
        <Link href="/" className="hover:text-white">Home</Link>
        <span>›</span>
        <Link href="/models" className="hover:text-white">Models</Link>
        <span>›</span>
        <span className="truncate text-[#D4D4D8]">{m.name}</span>
      </nav>

      <section className="rounded-2xl border border-white/[0.06] bg-[#111114] p-6">
        <div className="relative grid grid-cols-[auto_minmax(0,1fr)] items-start gap-4 lg:grid-cols-[80px_minmax(0,1fr)_330px] lg:gap-5">
          <Logo src={m.providerLogo} name={m.providerName} />
          <div className="min-w-0 pt-0.5 lg:grid lg:grid-cols-[170px_minmax(0,1fr)] lg:gap-5">
            <div className="min-w-0">
              <h1 className="break-words text-3xl font-black tracking-tight text-white sm:text-4xl">{m.name}</h1>
              <p className="mt-1.5 text-sm text-[#A1A1AA]">
                Built by{" "}
                {m.providerSlug ? (
                  <Link href={`/companies/${m.providerSlug}`} className="font-bold text-white hover:text-[#B8A7FF] hover:underline">
                    {m.providerName}
                  </Link>
                ) : (
                  <span className="font-bold text-white">{m.providerName}</span>
                )}
              </p>
              <div className="mt-2.5 flex flex-wrap items-center gap-2">
                <span className="rounded-full border border-[#6E56CF]/25 bg-[#6E56CF]/10 px-2.5 py-1 text-[10px] font-semibold text-[#B8A7FF]">
                  {m.modelType ?? m.modality ?? "Model"}
                </span>
                <span className="rounded-full border border-white/[0.08] bg-white/[0.04] px-2.5 py-1 text-[10px] font-semibold text-[#A1A1AA]">
                  {m.openSource === true ? "Open source" : m.openSource === false ? "Closed source" : "Source status unknown"}
                </span>
                {m.websiteUrl && (
                  <a href={m.websiteUrl} target="_blank" rel="noopener noreferrer nofollow" title={m.websiteUrl} className="inline-flex max-w-full items-center gap-1 rounded-full border border-[#6E56CF]/35 bg-[#6E56CF]/10 px-2.5 py-1 text-[10px] font-semibold text-[#B8A7FF] transition hover:border-[#6E56CF]/60 hover:bg-[#6E56CF]/20 hover:text-white">
                    <span>Visit model</span>
                    <span aria-hidden="true">↗</span>
                  </a>
                )}
              </div>
            </div>
            <div className="mt-3 min-w-0 lg:mt-0">
              <p className="text-sm leading-6 text-[#C4C4CC] sm:text-[15px] sm:leading-7">{m.description}</p>
              {m.capabilities.length > 0 && (
                <div className="mt-2.5 flex flex-wrap gap-1.5" aria-label="Model capabilities">
                  {m.capabilities.slice(0, 4).map((c) => (
                    <span key={c} className="rounded-md border border-[#6E56CF]/25 bg-[#6E56CF]/[0.08] px-2 py-1 text-[10px] font-semibold text-[#B8A7FF]">
                      {c}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
          <div className="col-span-2 rounded-xl border border-white/[0.07] bg-black/20 p-3 lg:col-span-1">
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setSaved((v) => !v)}
                aria-pressed={saved}
                title="Save model (coming soon)"
                className={`inline-flex flex-1 items-center justify-center gap-2 rounded-lg border px-3 py-2 text-xs font-bold transition ${saved ? "border-[#6E56CF]/60 bg-[#6E56CF]/20 text-white" : "border-white/[0.1] bg-white/[0.04] text-[#D4D4D8] hover:bg-white/[0.08] hover:text-white"}`}
              >
                {saved ? "Saved ✓" : "☆ Save"}
              </button>
              <button
                type="button"
                onClick={share}
                className="inline-flex flex-1 items-center justify-center gap-2 rounded-lg border border-white/[0.1] bg-white/[0.04] px-3 py-2 text-xs font-bold text-[#D4D4D8] transition hover:bg-white/[0.08] hover:text-white"
              >
                {copied ? "Copied ✓" : "⤴ Share"}
              </button>
            </div>
            <dl className="mt-2.5 grid grid-cols-2 gap-px overflow-hidden rounded-lg border border-white/[0.07] bg-white/[0.07]">
              <Stat label="Released" value={m.releaseDate ?? "Not available"} />
              <Stat label="Context" value={orNA(m.contextWindow)} />
              <Stat label="Modality" value={orNA(m.modality)} />
              <Stat label="Provider" value={m.providerName} />
            </dl>
          </div>
        </div>
      </section>

      <div className="mt-4 grid gap-4 lg:grid-cols-[minmax(0,1fr)_300px] lg:items-start">
        <div className="min-w-0 space-y-4">
          <section>
            <SectionTitle title="Technical specifications" />
            <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3">
              {[
                { label: "Model type", value: orNA(m.modelType) },
                { label: "Modality", value: orNA(m.modality) },
                { label: "Primary task", value: orNA(m.primaryTask) },
                { label: "Context window", value: orNA(m.contextWindow) },
                { label: "Parameter size", value: orNA(m.parameterSize) },
                { label: "Release date", value: m.releaseDate ?? "Not available" },
              ].map((s) => (
                <div key={s.label} className="rounded-xl border border-white/[0.06] bg-[#111114] p-3.5">
                  <p className="text-[10px] font-semibold tracking-wide text-[#71717A] uppercase">{s.label}</p>
                  <p className="mt-1 truncate text-sm font-bold text-white" title={s.value}>{s.value}</p>
                </div>
              ))}
            </div>
          </section>

          {m.capabilities.length > 0 && (
            <section>
              <SectionTitle title="Capabilities and tasks" count={m.capabilities.length} />
              <div className="flex flex-wrap gap-2">
                {m.capabilities.map((c) => (
                  <span key={c} className="rounded-lg border border-[#6E56CF]/25 bg-[#6E56CF]/10 px-3 py-1.5 text-xs font-semibold text-[#C4B8FF]">
                    {c}
                  </span>
                ))}
              </div>
            </section>
          )}

          <div className="grid gap-3 sm:grid-cols-2">
            <Link href={`/tools?q=${encodeURIComponent(m.name)}`} className="group relative flex items-center gap-3 overflow-hidden rounded-xl border border-white/[0.08] bg-[#111114] p-3 transition-all duration-300 hover:border-[#6E56CF]/50 hover:bg-[#141419]">
              <span className="absolute inset-y-0 left-0 w-0.5 bg-[#6E56CF] opacity-0 transition-opacity group-hover:opacity-100" />
              <span className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-[#6E56CF]/30 bg-[#6E56CF]/10 text-lg text-[#B8A7FF]">🛠</span>
              <span className="relative min-w-0 flex-1">
                <span className="block text-sm font-bold text-white">Tools using {m.name}</span>
                <span className="mt-0.5 block truncate text-[11px] text-[#7F7F89]">Products and workflows powered by this model</span>
              </span>
              <span className="relative shrink-0 text-[#52525B] transition-all group-hover:translate-x-0.5 group-hover:text-[#B8A7FF]">→</span>
            </Link>
            <Link href={`/videos?q=${encodeURIComponent(m.name)}`} className="group relative flex items-center gap-3 overflow-hidden rounded-xl border border-white/[0.08] bg-[#111114] p-3 transition-all duration-300 hover:border-[#6E56CF]/50 hover:bg-[#141419]">
              <span className="absolute inset-y-0 left-0 w-0.5 bg-[#6E56CF] opacity-0 transition-opacity group-hover:opacity-100" />
              <span className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-[#6E56CF]/30 bg-[#6E56CF]/10 text-lg text-[#B8A7FF]">▶</span>
              <span className="relative min-w-0 flex-1">
                <span className="block text-sm font-bold text-white">Videos and demos</span>
                <span className="mt-0.5 block truncate text-[11px] text-[#7F7F89]">Explainers, launch highlights and demonstrations</span>
              </span>
              <span className="relative shrink-0 text-[#52525B] transition-all group-hover:translate-x-0.5 group-hover:text-[#B8A7FF]">→</span>
            </Link>
          </div>

          {m.related.length > 0 && (
            <section>
              <SectionTitle title="Related models" count={m.related.length} />
              <div className="grid gap-2.5 sm:grid-cols-2">
                {m.related.map((r) => (
                  <Link key={r.slug} href={`/models/${r.slug}`} className="flex items-center gap-3 rounded-xl border border-white/[0.08] bg-[#111114] p-3.5 transition hover:border-[#6E56CF]/40">
                    {r.logoUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={r.logoUrl} alt="" className="h-10 w-10 shrink-0 rounded-lg border border-white/10 bg-white object-contain p-0.5" />
                    ) : (
                      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-white/10 bg-white text-lg font-black text-neutral-900">
                        {r.name.charAt(0)}
                      </span>
                    )}
                    <span className="min-w-0">
                      <span className="block truncate text-sm font-bold text-white">{r.name}</span>
                      {r.providerName && <span className="mt-0.5 block truncate text-[11px] text-[#71717A]">{r.providerName}</span>}
                    </span>
                  </Link>
                ))}
              </div>
            </section>
          )}
        </div>

        <aside className="space-y-2.5 lg:sticky lg:top-24">
          <section className="rounded-xl border border-white/[0.08] bg-[#111114] p-4">
            <h2 className="text-sm font-bold text-white">Model information</h2>
            <dl className="mt-3 divide-y divide-white/[0.06]">
              {[
                ["Provider", m.providerName],
                ["Type", m.modelType ?? m.modality ?? "Not available"],
                ["Released", m.releaseDate ?? "Not available"],
                ["Open source", m.openSource ? "Yes" : "No"],
              ].map(([k, v]) => (
                <div key={k} className="flex items-start justify-between gap-4 py-2.5 first:pt-0 last:pb-0">
                  <dt className="text-xs text-[#71717A]">{k}</dt>
                  <dd className="max-w-[60%] text-right text-xs font-semibold text-[#D4D4D8]">{v}</dd>
                </div>
              ))}
            </dl>
          </section>
          <section className="rounded-xl border border-white/[0.08] bg-[#111114] p-4">
            <div className="flex items-center gap-3">
              <Logo src={m.providerLogo} name={m.providerName} size="sm" />
              <div className="min-w-0">
                <p className="truncate text-sm font-bold text-white">{m.providerName}</p>
                <p className="mt-0.5 text-xs text-[#71717A]">Model provider</p>
              </div>
            </div>
            {m.providerSlug ? (
              <Link href={`/companies/${m.providerSlug}`} className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-lg border border-white/[0.09] bg-white/[0.035] px-3 py-2 text-xs font-bold text-[#D4D4D8] transition hover:border-[#6E56CF]/40 hover:text-white">
                View company →
              </Link>
            ) : (
              <div className="mt-4 flex items-center gap-2 rounded-lg border border-white/[0.06] bg-black/20 px-3 py-2 text-xs text-[#62626B]">
                Company profile unavailable
              </div>
            )}
          </section>
        </aside>
      </div>
    </main>
  );
}
