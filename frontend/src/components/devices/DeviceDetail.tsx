"use client";

import { useState } from "react";
import Link from "next/link";

export type DeviceRelated = { slug: string; name: string; imageUrl: string | null; manufacturer: string | null };

export type DeviceDetailData = {
  slug: string;
  name: string;
  description: string | null;
  imageUrl: string | null;
  images: string[];
  manufacturer: string | null;
  manufacturerSlug: string | null;
  manufacturerLogo: string | null;
  category: string | null;
  availability: string | null;
  price: string | null;
  year: string | null;
  month: string | null;
  mainTask: string | null;
  formFactor: string | null;
  country: string | null;
  aiFeatures: string[];
  primaryUseCases: string[];
  buyUrl: string | null;
  related: DeviceRelated[];
};

function fmtTitle(v: string | null | undefined): string {
  if (!v) return "—";
  return v.toLowerCase().replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

export default function DeviceDetail({ device: d }: { device: DeviceDetailData }) {
  const [saved, setSaved] = useState(false);
  const [copied, setCopied] = useState(false);

  const share = async () => {
    const url = window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({ title: d.name, text: d.description ?? "", url });
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
    <main className="mx-auto w-full max-w-[1400px] px-4 py-8 md:px-6">
      <nav className="mb-5 flex items-center gap-1.5 text-xs text-[#71717A]" aria-label="Breadcrumb">
        <Link href="/" className="hover:text-white">Home</Link>
        <span>›</span>
        <Link href="/devices" className="hover:text-white">Devices</Link>
        <span>›</span>
        <span className="truncate text-[#D4D4D8]">{d.name}</span>
      </nav>

      <section className="relative overflow-hidden rounded-2xl border border-[#202024] bg-[#101012] p-5 sm:p-7">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_85%_15%,rgba(110,86,207,0.12),transparent_40%)]" />
        <div className="relative flex flex-col gap-6 md:flex-row md:items-start">
          <div className="shrink-0">
            {d.imageUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={d.imageUrl} alt={d.name} className="h-44 w-auto rounded-xl border border-white/10 bg-white object-cover" />
            ) : (
              <div className="flex h-44 w-44 items-center justify-center rounded-xl border border-white/10 bg-[#18181C] text-4xl font-black text-white">
                {d.name.charAt(0)}
              </div>
            )}
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">{d.name}</h1>
            </div>
            <p className="mt-1.5 text-sm text-[#A1A1AA]">
              {d.manufacturer && <span className="font-bold text-white">{d.manufacturer}</span>}
              {d.manufacturer && d.category && <span> · </span>}
              {d.category && <span>{d.category}</span>}
            </p>
            <div className="mt-3 flex flex-wrap items-center gap-2">
              {d.availability && (
                <span className="rounded-full border border-white/[0.08] bg-white/[0.04] px-2.5 py-1 text-[10px] font-semibold text-[#A1A1AA]">
                  {fmtTitle(d.availability)}
                </span>
              )}
              {d.price && (
                <span className="rounded-full border border-[#F5C84C]/30 bg-[#F5C84C]/10 px-2.5 py-1 text-[10px] font-bold text-[#F5C84C]">
                  {d.price}
                </span>
              )}
              {d.mainTask && (
                <span className="rounded-full border border-[#6E56CF]/25 bg-[#6E56CF]/10 px-2.5 py-1 text-[10px] font-semibold text-[#B8A7FF]">
                  {d.mainTask}
                </span>
              )}
            </div>
            {d.description && (
              <p className="mt-4 max-w-3xl text-sm leading-6 text-[#A1A1AA] sm:text-[15px] sm:leading-7">{d.description}</p>
            )}
            <div className="mt-5 grid grid-cols-2 gap-x-6 gap-y-4 border-t border-[#242428] pt-5 sm:grid-cols-4">
              {[
                ["Manufacturer", d.manufacturer],
                ["Form factor", d.formFactor],
                ["Country", d.country],
                ["Released", d.year ?? d.month],
              ].map(([k, v]) => (
                <div key={k}>
                  <p className="text-[10px] font-medium tracking-wide text-[#66666E] uppercase">{k}</p>
                  <p className="mt-1.5 truncate text-xs font-semibold text-white">{v ?? "—"}</p>
                </div>
              ))}
            </div>
          </div>
          <div className="flex shrink-0 flex-row gap-2 md:w-48 md:flex-col">
            <button
              type="button"
              onClick={() => setSaved((v) => !v)}
              aria-pressed={saved}
              title="Save device (coming soon)"
              className={`inline-flex flex-1 items-center justify-center gap-2 rounded-xl border px-3 py-2.5 text-xs font-bold transition ${saved ? "border-[#6E56CF]/60 bg-[#6E56CF]/20 text-white" : "border-white/[0.1] bg-white/[0.04] text-[#D4D4D8] hover:bg-white/[0.08] hover:text-white"}`}
            >
              {saved ? "Saved ✓" : "☆ Save"}
            </button>
            {d.buyUrl && (
              <a href={d.buyUrl} target="_blank" rel="noopener noreferrer nofollow" className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-[#6E56CF] px-3 py-2.5 text-xs font-extrabold text-white shadow-lg shadow-[#6E56CF]/25 transition hover:bg-[#7C66DF] active:scale-95">
                Buy ↗
              </a>
            )}
            <button
              type="button"
              onClick={share}
              className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl border border-white/[0.1] bg-white/[0.04] px-3 py-2.5 text-xs font-bold text-[#D4D4D8] transition hover:bg-white/[0.08] hover:text-white"
            >
              {copied ? "Copied ✓" : "⤴ Share"}
            </button>
          </div>
        </div>
      </section>

      <div className="mt-5 grid items-start gap-5 lg:grid-cols-[1fr_300px]">
        <div className="min-w-0 space-y-4">
          {d.aiFeatures.length > 0 && (
            <section className="rounded-xl border border-[#1e1e22] bg-[#09090c] p-5">
              <h2 className="mb-3 text-base font-bold text-white">AI features</h2>
              <div className="grid gap-2.5 sm:grid-cols-2">
                {d.aiFeatures.map((f) => (
                  <div key={f} className="flex items-center gap-2.5 rounded-xl border border-[#202024] bg-[#111113] px-4 py-3">
                    <span className="text-[#9B7CFF]">◆</span>
                    <p className="text-sm font-semibold text-[#E4E4E7]">{f}</p>
                  </div>
                ))}
              </div>
            </section>
          )}
          {d.primaryUseCases.length > 0 && (
            <section className="rounded-xl border border-[#1e1e22] bg-[#09090c] p-5">
              <h2 className="mb-3 text-base font-bold text-white">Primary use cases</h2>
              <div className="flex flex-wrap gap-2">
                {d.primaryUseCases.map((u) => (
                  <span key={u} className="rounded-lg border border-[#6E56CF]/25 bg-[#6E56CF]/10 px-3 py-1.5 text-xs font-semibold text-[#C4B8FF]">
                    {u}
                  </span>
                ))}
              </div>
            </section>
          )}
          {d.images.length > 0 && (
            <section className="rounded-xl border border-[#1e1e22] bg-[#09090c] p-5">
              <h2 className="mb-3 text-base font-bold text-white">Gallery</h2>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                {d.images.slice(0, 6).map((src) => (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img key={src} src={src} alt={d.name} loading="lazy" className="h-32 w-full rounded-lg border border-white/10 bg-white object-cover" />
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
                ["Manufacturer", d.manufacturer],
                ["Category", d.category],
                ["Availability", fmtTitle(d.availability)],
                ["Price", d.price],
                ["Released", d.year ?? d.month],
                ["Country", d.country],
              ].map(([k, v]) => (
                <div key={k} className="flex items-start justify-between gap-4 py-2.5 first:pt-0 last:pb-0">
                  <dt className="text-xs text-[#71717A]">{k}</dt>
                  <dd className="max-w-[60%] text-right text-xs font-semibold text-[#D4D4D8]">{v ?? "—"}</dd>
                </div>
              ))}
            </dl>
          </section>
          {d.related.length > 0 && (
            <section className="rounded-xl border border-white/[0.08] bg-[#111114] p-4">
              <h2 className="mb-3 text-sm font-bold text-white">Related devices</h2>
              <div className="space-y-2">
                {d.related.map((r) => (
                  <Link key={r.slug} href={`/devices/${r.slug}`} className="flex items-center gap-3 rounded-lg border border-transparent p-2 transition hover:border-[#6E56CF]/40 hover:bg-white/[0.03]">
                    {r.imageUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={r.imageUrl} alt="" className="h-9 w-9 shrink-0 rounded-lg border border-white/10 bg-white object-cover" />
                    ) : (
                      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#18181C] text-sm font-black text-white">
                        {r.name.charAt(0)}
                      </span>
                    )}
                    <span className="min-w-0">
                      <span className="block truncate text-[13px] font-bold text-white">{r.name}</span>
                      {r.manufacturer && <span className="block truncate text-[11px] text-[#71717A]">{r.manufacturer}</span>}
                    </span>
                  </Link>
                ))}
              </div>
            </section>
          )}
        </aside>
      </div>
    </main>
  );
}
