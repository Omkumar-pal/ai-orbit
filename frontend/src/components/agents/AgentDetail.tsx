"use client";

import { useState } from "react";
import Link from "next/link";

export type AgentSimilar = {
  slug: string;
  name: string;
  logoUrl: string | null;
  primaryTask: string | null;
  category: string | null;
};

export type AgentDetailData = {
  slug: string;
  name: string;
  description: string;
  websiteUrl: string | null;
  logoUrl: string | null;
  category: string | null;
  categorySlug: string | null;
  primaryTask: string | null;
  pricingModel: string | null;
  hasApi: boolean;
  isOpenSource: boolean;
  verified: boolean;
  compatibility: string[];
  avgRating: number | null;
  upvoteCount: number;
  views: number;
  shortDescription: string | null;
  longDescription: string | null;
  features: string[];
  useCases: string[];
  integrations: string[];
  apiDocsUrl: string | null;
  githubUrl: string | null;
  provider: string | null;
  providerWebsite: string | null;
  releaseDate: string | null;
  pros: string[];
  cons: string[];
  createdAt: string | null;
  similar: AgentSimilar[];
};

const iconProps = { fill: "none", stroke: "currentColor", strokeWidth: 2, strokeLinecap: "round", strokeLinejoin: "round" } as const;

function str(v: string | null | undefined): string {
  return v ?? "—";
}

function pricingLabel(v: string | null | undefined): string {
  if (!v) return "—";
  const s = v.toLowerCase().replace(/_/g, " ");
  return s.charAt(0).toUpperCase() + s.slice(1);
}

function fmtDate(value: string | null): string {
  if (!value) return "—";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function domainOf(url: string): string {
  return url.replace(/^https?:\/\//, "").replace(/\/$/, "");
}

function Avatar({ name, logoUrl, small = false }: { name: string; logoUrl: string | null; small?: boolean }) {
  const [failed, setFailed] = useState(false);
  const size = small ? "h-10 w-10 rounded-xl text-sm" : "h-20 w-20 rounded-2xl text-3xl";
  if (!logoUrl || failed) {
    return (
      <div className={`flex shrink-0 items-center justify-center border border-[#29292D] bg-[#18181C] font-bold text-white ${size}`}>
        {name.charAt(0).toUpperCase()}
      </div>
    );
  }
  return (
    <div className={`flex shrink-0 items-center justify-center overflow-hidden border border-[#29292D] bg-[#18181C] ${size}`}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={logoUrl} alt={name} className="h-full w-full object-contain p-2" onError={() => setFailed(true)} />
    </div>
  );
}

function SectionTitle({ title, count }: { title: string; count?: number }) {
  return (
    <div className="mb-3 flex items-center gap-2">
      <h2 className="text-[21px] font-bold tracking-tight text-white">{title}</h2>
      {typeof count === "number" && count > 0 && (
        <span className="rounded-full bg-[#17171A] px-2 py-0.5 text-[10px] font-semibold text-[#71717A]">{count}</span>
      )}
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center gap-3 py-1.5">
      <span className="min-w-0 flex-1 text-xs text-[#A1A1AA]">{label}</span>
      <span className="max-w-[58%] truncate text-right text-xs font-semibold text-white">{value}</span>
    </div>
  );
}

function ExtIcon() {
  return (
    <svg viewBox="0 0 24 24" width={10} height={10} aria-hidden="true" {...iconProps} className="ml-1 inline-block text-[10px] leading-none text-[#66666E]">
      <path d="M7 7h10v10" />
      <path d="M7 17 17 7" />
    </svg>
  );
}

export default function AgentDetail({ agent: h }: { agent: AgentDetailData }) {
  const [shared, setShared] = useState(false);
  const [saved, setSaved] = useState(false);

  const shareUrl = `${typeof window !== "undefined" ? window.location.origin : ""}/agents/${h.slug}`;
  const share = async () => {
    if (navigator.share) {
      try {
        await navigator.share({ title: h.name, text: h.shortDescription || h.description, url: shareUrl });
        return;
      } catch {
        /* dismissed */
      }
    }
    try {
      await navigator.clipboard.writeText(shareUrl);
    } catch {
      /* unavailable */
    }
    setShared(true);
    window.setTimeout(() => setShared(false), 1800);
  };

  return (
    <main className="min-h-screen bg-black px-4 pb-20 pt-5 text-white sm:px-6 lg:px-8">
      <div className="mx-auto max-w-[1450px]">
        <div className="mb-5 flex items-center gap-2 overflow-hidden text-xs text-[#71717A]">
          <Link href="/" className="shrink-0 hover:text-white">Home</Link>
          <span>›</span>
          <Link href="/agents" className="shrink-0 hover:text-white">Agents</Link>
          <span>›</span>
          <span className="truncate text-[#D4D4D8]">{h.name}</span>
        </div>

        <div className="grid items-start gap-7 lg:grid-cols-[minmax(0,1fr)_335px]">
          <div className="min-w-0">
            <section className="relative overflow-hidden rounded-2xl border border-[#202024] bg-[#101012] px-7 py-7 sm:px-8 sm:py-8">
              <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_88%_20%,rgba(118,104,58,0.14),transparent_34%)]" />
              <div className="relative">
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="text-3xl font-bold tracking-tight text-white sm:text-[38px]">{h.name}</h1>
                  {h.verified && (
                    <span title="Verified agent" className="text-[18px] text-[#8F75FF]">✓</span>
                  )}
                </div>
                <div className="mt-3 inline-flex rounded-full border border-[#29292D] bg-[#18181B] px-3 py-1 text-[11px] font-semibold text-[#D4D4D8]">
                  AI Agent
                </div>
                <p className="mt-5 max-w-5xl text-sm leading-6 text-[#A1A1AA] sm:text-[15px]">
                  {str(h.shortDescription || h.description)}
                </p>
                <div className="mt-7 border-t border-[#242428] pt-6">
                  <div className="grid grid-cols-2 gap-x-6 gap-y-5 sm:grid-cols-3 lg:grid-cols-6">
                    <div>
                      <p className="text-[10px] font-medium uppercase tracking-wide text-[#66666E]">Provider</p>
                      <p className="mt-1.5 truncate text-xs font-semibold text-white">{str(h.provider)}</p>
                    </div>
                    <div>
                      <p className="text-[10px] font-medium uppercase tracking-wide text-[#66666E]">Pricing</p>
                      <p className="mt-1.5 text-xs font-semibold text-white">{pricingLabel(h.pricingModel)}</p>
                    </div>
                    <div>
                      <p className="text-[10px] font-medium uppercase tracking-wide text-[#66666E]">API Available</p>
                      <p className="mt-1.5 text-xs font-semibold text-white">{h.hasApi ? "Yes" : "No"}</p>
                    </div>
                    <div>
                      <p className="text-[10px] font-medium uppercase tracking-wide text-[#66666E]">Focus</p>
                      <p className="mt-1.5 truncate text-xs font-semibold text-white">{str(h.primaryTask)}</p>
                    </div>
                    <div>
                      <p className="text-[10px] font-medium uppercase tracking-wide text-[#66666E]">Release Date</p>
                      <p className="mt-1.5 text-xs font-semibold text-white">{fmtDate(h.releaseDate)}</p>
                    </div>
                    <div>
                      <p className="text-[10px] font-medium uppercase tracking-wide text-[#66666E]">Category</p>
                      <p className="mt-1.5 truncate text-xs font-semibold text-white">{str(h.category)}</p>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {h.longDescription && (
              <section className="mt-7">
                <SectionTitle title="About" />
                <div className="rounded-2xl border border-[#202024] bg-[#101012] px-5 py-5 sm:px-6">
                  <p className="text-sm leading-7 text-[#A1A1AA]">{h.longDescription}</p>
                </div>
              </section>
            )}

            {h.features.length > 0 && (
              <section className="mt-7">
                <SectionTitle title="Key Features" count={h.features.length} />
                <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                  {h.features.map((f, i) => (
                    <div key={`${f}-${i}`} className="flex min-h-[78px] items-center gap-3 rounded-xl border border-[#202024] bg-[#111113] p-4 transition-colors hover:border-[#303036]">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-[#30265B] bg-[#1D1834] text-sm font-bold text-[#9B7CFF]">
                        {i + 1}
                      </div>
                      <p className="text-sm font-semibold leading-5 text-[#E4E4E7]">{f}</p>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {h.useCases.length > 0 && (
              <section className="mt-7">
                <SectionTitle title="Use Cases" count={h.useCases.length} />
                <div className="grid max-w-[1100px] gap-2.5 md:grid-cols-2 xl:grid-cols-3">
                  {h.useCases.map((u, i) => (
                    <div key={`${u}-${i}`} className="flex h-[58px] items-center rounded-xl border border-[#202024] bg-[#111113] px-4 transition-colors hover:border-[#303036]">
                      <p className="text-sm font-semibold leading-5 text-[#E4E4E7]">{u}</p>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {h.integrations.length > 0 && (
              <section className="mt-7">
                <SectionTitle title="Integrations" count={h.integrations.length} />
                <div className="flex flex-wrap gap-2">
                  {h.integrations.map((x) => (
                    <span key={x} className="rounded-xl border border-[#232326] bg-[#121214] px-3.5 py-2.5 text-xs font-medium text-[#D4D4D8]">{x}</span>
                  ))}
                </div>
              </section>
            )}

            {h.compatibility.length > 0 && (
              <section className="mt-7">
                <SectionTitle title="Compatibility" count={h.compatibility.length} />
                <div className="flex flex-wrap gap-2">
                  {h.compatibility.map((x) => (
                    <span key={x} className="rounded-xl border border-[#232326] bg-[#121214] px-3.5 py-2.5 text-xs font-medium text-[#D4D4D8]">{x}</span>
                  ))}
                </div>
              </section>
            )}

            {(h.pros.length > 0 || h.cons.length > 0) && (
              <section className="mt-7">
                <SectionTitle title="Pros & Cons" />
                <div className="grid gap-3 md:grid-cols-2">
                  {h.pros.length > 0 && (
                    <div className="rounded-2xl border border-[#202024] bg-[#101012] p-5">
                      <h3 className="mb-4 text-sm font-semibold text-white">Pros</h3>
                      <div className="space-y-3">
                        {h.pros.map((p) => (
                          <div key={p} className="flex gap-2.5 text-xs leading-5 text-[#A1A1AA]">
                            <span className="mt-0.5 shrink-0 text-[#9B7CFF]">✓</span>
                            <span>{p}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  {h.cons.length > 0 && (
                    <div className="rounded-2xl border border-[#202024] bg-[#101012] p-5">
                      <h3 className="mb-4 text-sm font-semibold text-white">Cons</h3>
                      <div className="space-y-3">
                        {h.cons.map((c) => (
                          <div key={c} className="flex gap-2.5 text-xs leading-5 text-[#A1A1AA]">
                            <span className="mt-0.5 shrink-0 text-[#71717A]">✕</span>
                            <span>{c}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </section>
            )}

            {h.similar.length > 0 && (
              <section className="mt-8">
                <SectionTitle title="Similar Agents" count={h.similar.length} />
                <div className="grid gap-3 md:grid-cols-2">
                  {h.similar.map((s) => (
                    <Link key={s.slug} href={`/agents/${s.slug}`} className="flex items-center gap-3 rounded-xl border border-[#232326] bg-[#121214] p-4 text-left transition-colors hover:border-[#39393E]">
                      <Avatar name={s.name} logoUrl={s.logoUrl} small />
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-white">{s.name}</p>
                        <p className="mt-1 truncate text-xs text-[#71717A]">{s.primaryTask || s.category}</p>
                      </div>
                    </Link>
                  ))}
                </div>
              </section>
            )}
          </div>

          <aside className="overflow-hidden rounded-2xl border border-[#202024] bg-[#101012] lg:sticky lg:top-6">
            <div className="flex flex-col items-center border-b border-[#202024] px-6 pb-6 pt-6 text-center">
              <Avatar name={h.name} logoUrl={h.logoUrl} />
              <h2 className="mt-5 text-lg font-bold text-white">{h.name}</h2>
              {h.verified && (
                <div className="mt-2 inline-flex items-center gap-1.5 text-xs font-semibold text-white">
                  <span className="text-[#8F75FF]">✓</span> Verified Agent
                </div>
              )}
              {h.websiteUrl && (
                <a href={h.websiteUrl} target="_blank" rel="noreferrer" className="mt-5 flex w-full items-center gap-2 text-left text-xs text-[#A1A1AA] hover:text-white">
                  <span className="min-w-0 flex-1 truncate">{domainOf(h.websiteUrl)}</span>
                  <ExtIcon />
                </a>
              )}
              <div className="mt-5 grid w-full gap-2">
                <button
                  type="button"
                  onClick={() => setSaved((v) => !v)}
                  aria-pressed={saved}
                  title="Save agent (coming soon)"
                  className={`inline-flex h-11 items-center justify-center rounded-xl text-xs font-semibold transition-colors ${saved ? "bg-[#7B62DE] text-white" : "bg-[#6E56CF] text-white hover:bg-[#7B62DE]"}`}
                >
                  {saved ? "Saved ✓" : "Save Agent"}
                </button>
                {h.websiteUrl && (
                  <a href={h.websiteUrl} target="_blank" rel="noreferrer" className="inline-flex h-11 items-center justify-center rounded-xl border border-[#29292D] bg-[#151518] text-xs font-semibold text-[#E4E4E7] hover:border-[#414146] hover:text-white">
                    Visit Website <ExtIcon />
                  </a>
                )}
                <div className="grid grid-cols-2 gap-2">
                  {h.apiDocsUrl && (
                    <a href={h.apiDocsUrl} target="_blank" rel="noreferrer" className="inline-flex h-11 items-center justify-center rounded-xl border border-[#29292D] bg-[#151518] text-xs font-semibold text-[#A1A1AA] hover:border-[#414146] hover:text-white">
                      API Docs <ExtIcon />
                    </a>
                  )}
                  <button
                    type="button"
                    onClick={share}
                    className={`inline-flex h-11 items-center justify-center rounded-xl border border-[#29292D] bg-[#151518] text-xs font-semibold text-[#A1A1AA] hover:border-[#414146] hover:text-white ${!h.apiDocsUrl ? "col-span-2" : ""}`}
                  >
                    {shared ? "Copied" : "Share"}
                  </button>
                </div>
              </div>
            </div>

            <div className="border-b border-[#202024] px-6 py-5">
              <h3 className="mb-2 text-xs font-semibold text-[#D4D4D8]">Agent Info</h3>
              <InfoRow label="Provider" value={str(h.provider)} />
              <InfoRow label="Category" value={str(h.category)} />
              <InfoRow label="Pricing" value={pricingLabel(h.pricingModel)} />
              <InfoRow label="API Available" value={h.hasApi ? "Yes" : "No"} />
              <InfoRow label="Release Date" value={fmtDate(h.releaseDate)} />
              <InfoRow label="Open Source" value={h.isOpenSource ? "Yes" : "No"} />
              <InfoRow label="Focus" value={str(h.primaryTask)} />
            </div>

            {(h.providerWebsite || h.githubUrl || h.apiDocsUrl) && (
              <div className="border-b border-[#202024] px-6 py-5">
                <h3 className="mb-3 text-xs font-semibold text-[#D4D4D8]">Links</h3>
                <div className="space-y-3">
                  {h.providerWebsite && (
                    <a href={h.providerWebsite} target="_blank" rel="noreferrer" className="flex items-center gap-3 text-xs text-[#A1A1AA] hover:text-white">
                      <span className="min-w-0 flex-1 truncate">Provider Website</span>
                      <ExtIcon />
                    </a>
                  )}
                  {h.githubUrl && (
                    <a href={h.githubUrl} target="_blank" rel="noreferrer" className="flex items-center gap-3 text-xs text-[#A1A1AA] hover:text-white">
                      <span className="min-w-0 flex-1 truncate">GitHub</span>
                      <ExtIcon />
                    </a>
                  )}
                  {h.apiDocsUrl && (
                    <a href={h.apiDocsUrl} target="_blank" rel="noreferrer" className="flex items-center gap-3 text-xs text-[#A1A1AA] hover:text-white">
                      <span className="min-w-0 flex-1 truncate">API Documentation</span>
                      <ExtIcon />
                    </a>
                  )}
                </div>
              </div>
            )}

            {h.createdAt && (
              <div className="px-6 py-5">
                <p className="text-xs font-medium text-[#8A8A93]">Added to AIOrbit</p>
                <p className="mt-2 text-sm font-semibold text-white">{fmtDate(h.createdAt)}</p>
              </div>
            )}
          </aside>
        </div>
      </div>
    </main>
  );
}
