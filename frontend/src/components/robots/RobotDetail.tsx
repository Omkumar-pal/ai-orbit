"use client";

import { useState } from "react";
import Link from "next/link";

export type RobotRelated = { slug: string; name: string; logoUrl: string | null; company: string | null };
export type RobotTaskLink = { slug: string; title: string };

export type RobotDetailData = {
  slug: string;
  name: string;
  logoUrl: string | null;
  thumbnailUrl: string | null;
  company: string | null;
  country: string | null;
  category: string | null;
  availability: string | null;
  price: string | null;
  releaseDate: string | null;
  mainTask: string | null;
  autonomyLevel: string | null;
  primaryUseCases: string[];
  websiteUrl: string | null;
  about: string | null;
  specs: string | null;
  linkedTasks: RobotTaskLink[];
  related: RobotRelated[];
};

function fmtTitle(v: string | null | undefined): string {
  if (!v) return "—";
  return v.toLowerCase().replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

function fmtDate(value: string | null): string {
  if (!value) return "—";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  return d.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
}

export default function RobotDetail({ robot: r }: { robot: RobotDetailData }) {
  const [saved, setSaved] = useState(false);
  const [copied, setCopied] = useState(false);

  const share = async () => {
    const url = window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({ title: r.name, text: r.about ?? "", url });
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
    <div className="flex min-h-screen flex-col bg-black text-white selection:bg-neutral-800 selection:text-white">
      <div className="mx-auto w-full max-w-[1280px] space-y-4 px-4 py-4">
        <nav className="flex items-center gap-1.5 text-xs text-[#71717A]" aria-label="Breadcrumb">
          <Link href="/" className="hover:text-white">Home</Link>
          <span>›</span>
          <Link href="/robots" className="hover:text-white">Robots</Link>
          <span>›</span>
          <span className="truncate text-[#D4D4D8]">{r.name}</span>
        </nav>

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-12">
          <div className="lg:col-span-6">
            <div className="flex h-[380px] items-center justify-center overflow-hidden rounded-xl border border-white/5 bg-white/[0.02]">
              {r.thumbnailUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={r.thumbnailUrl} alt={r.name} className="h-full w-full object-cover" />
              ) : r.logoUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={r.logoUrl} alt={r.name} className="h-32 w-32 rounded-2xl border border-white/10 bg-white object-contain p-2" />
              ) : (
                <span className="text-7xl font-black text-[#232326]">{r.name.charAt(0)}</span>
              )}
            </div>
          </div>
          <div className="space-y-3 lg:col-span-6">
            <div className="rounded-xl border border-white/5 bg-white/[0.02] p-5">
              {r.category && (
                <span className="inline-flex items-center rounded-full border border-[#6E56CF]/25 bg-[#6E56CF]/10 px-2.5 py-1 text-[10px] font-semibold text-[#B8A7FF]">
                  {fmtTitle(r.category)}
                </span>
              )}
              <h1 className="mt-2 text-3xl font-bold tracking-tight text-white">{r.name}</h1>
              <p className="mt-1.5 text-sm text-[#A1A1AA]">
                {r.company && <span className="font-bold text-white">{r.company}</span>}
                {r.company && r.country && <span> · </span>}
                {r.country && <span>{r.country}</span>}
              </p>
              <div className="mt-4 flex flex-wrap items-center gap-2">
                <span className="rounded-full border border-white/[0.08] bg-white/[0.04] px-2.5 py-1 text-[10px] font-semibold text-[#A1A1AA]">
                  {fmtTitle(r.availability)}
                </span>
                {r.price && (
                  <span className="rounded-full border border-[#F5C84C]/30 bg-[#F5C84C]/10 px-2.5 py-1 text-[10px] font-bold text-[#F5C84C]">
                    {r.price.length > 80 ? r.price.slice(0, 80) + "…" : r.price}
                  </span>
                )}
              </div>
              <div className="mt-5 flex gap-2">
                <button
                  type="button"
                  onClick={() => setSaved((v) => !v)}
                  aria-pressed={saved}
                  title="Save robot (coming soon)"
                  className={`inline-flex flex-1 items-center justify-center gap-2 rounded-xl border px-3 py-2.5 text-xs font-bold transition ${saved ? "border-[#6E56CF]/60 bg-[#6E56CF]/20 text-white" : "border-white/[0.1] bg-white/[0.04] text-[#D4D4D8] hover:bg-white/[0.08] hover:text-white"}`}
                >
                  {saved ? "Saved ✓" : "☆ Save"}
                </button>
                {r.websiteUrl && (
                  <a href={r.websiteUrl} target="_blank" rel="noopener noreferrer nofollow" className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-[#6E56CF] px-3 py-2.5 text-xs font-extrabold text-white shadow-lg shadow-[#6E56CF]/25 transition hover:bg-[#7C66DF] active:scale-95">
                    Visit ↗
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
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              {[
                ["Autonomy", fmtTitle(r.autonomyLevel)],
                ["Release", fmtDate(r.releaseDate)],
                ["Country", r.country],
              ].map(([k, v]) => (
                <div key={k} className="rounded-xl border border-white/5 bg-white/[0.02] p-4">
                  <p className="text-[10px] font-medium tracking-wide text-[#66666E] uppercase">{k}</p>
                  <p className="mt-1.5 truncate text-xs font-semibold text-white" title={v ?? "—"}>{v ?? "—"}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {r.about && (
          <section className="rounded-xl border border-white/5 bg-white/[0.02] p-5">
            <h2 className="mb-3 text-[21px] font-bold tracking-tight text-white">About</h2>
            <p className="text-sm leading-7 text-[#A1A1AA]">{r.about}</p>
          </section>
        )}

        {r.mainTask && (
          <section className="rounded-xl border border-white/5 bg-white/[0.02] p-5">
            <h2 className="mb-3 text-[21px] font-bold tracking-tight text-white">Main task</h2>
            <p className="text-sm leading-7 text-[#A1A1AA]">{r.mainTask}</p>
          </section>
        )}

        {r.specs && (
          <section className="rounded-xl border border-white/5 bg-white/[0.02] p-5">
            <h2 className="mb-3 text-[21px] font-bold tracking-tight text-white">Specifications</h2>
            <p className="text-xs leading-6 whitespace-pre-wrap text-[#A1A1AA]">{r.specs}</p>
          </section>
        )}

        {r.primaryUseCases.length > 0 && (
          <section className="rounded-xl border border-white/5 bg-white/[0.02] p-5">
            <h2 className="mb-3 text-[21px] font-bold tracking-tight text-white">Use cases</h2>
            <div className="flex flex-wrap gap-2">
              {r.primaryUseCases.map((u) => (
                <span key={u} className="rounded-lg border border-[#6E56CF]/25 bg-[#6E56CF]/10 px-3 py-1.5 text-xs font-semibold text-[#C4B8FF]">
                  {u}
                </span>
              ))}
            </div>
          </section>
        )}

        {r.linkedTasks.length > 0 && (
          <section className="rounded-xl border border-white/5 bg-white/[0.02] p-5">
            <h2 className="mb-3 text-[21px] font-bold tracking-tight text-white">
              Tasks <span className="rounded-full bg-[#17171A] px-2 py-0.5 align-middle text-[10px] font-semibold text-[#71717A]">{r.linkedTasks.length}</span>
            </h2>
            <div className="grid gap-2 sm:grid-cols-2">
              {r.linkedTasks.map((t) => (
                <Link key={t.slug} href={`/tasks/${t.slug}`} className="group flex items-center gap-2.5 rounded-xl border border-[#232326] bg-[#121214] px-4 py-3 transition hover:border-[#6E56CF]/40">
                  <span className="truncate text-[13px] font-medium text-[#A1A1AA] group-hover:text-white">{t.title}</span>
                  <span className="ml-auto shrink-0 text-[#52525B] group-hover:text-[#B8A7FF]">→</span>
                </Link>
              ))}
            </div>
          </section>
        )}

        {r.related.length > 0 && (
          <section>
            <h2 className="mb-3 text-[21px] font-bold tracking-tight text-white">
              Similar robots <span className="rounded-full bg-[#17171A] px-2 py-0.5 align-middle text-[10px] font-semibold text-[#71717A]">{r.related.length}</span>
            </h2>
            <div className="grid gap-3 md:grid-cols-2">
              {r.related.map((s) => (
                <Link key={s.slug} href={`/robots/${s.slug}`} className="flex items-center gap-3 rounded-xl border border-[#232326] bg-[#121214] p-4 transition hover:border-[#39393E]">
                  {s.logoUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={s.logoUrl} alt="" className="h-10 w-10 shrink-0 rounded-xl border border-white/10 bg-white object-contain p-1" />
                  ) : (
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#18181C] text-sm font-black text-white">
                      {s.name.charAt(0)}
                    </span>
                  )}
                  <span className="min-w-0">
                    <span className="block truncate text-sm font-semibold text-white">{s.name}</span>
                    {s.company && <span className="mt-1 block truncate text-xs text-[#71717A]">{s.company}</span>}
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
