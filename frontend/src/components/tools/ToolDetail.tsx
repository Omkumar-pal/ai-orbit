"use client";

import { useState } from "react";
import Link from "next/link";

export type ToolDetailCategory = { slug: string; name: string };
export type ToolDetailTask = { slug: string; title: string };

export type ToolDetailData = {
  id: string;
  slug: string;
  name: string;
  logoUrl: string | null;
  description: string;
  websiteUrl: string | null;
  visitUrl: string | null;
  pricingModel: string;
  pricingAmount: string | null;
  billingFrequency: string | null;
  avgRating: number | null;
  reviewCount: number;
  upvoteCount: number;
  isOpenSource: boolean;
  isTrending: boolean;
  verified: boolean;
  compatibility: string | null;
  releaseDate: string | null;
  launchDate: string | null;
  hasApi: boolean;
  apiDocsUrl: string | null;
  useCases: string | null;
  categories: ToolDetailCategory[];
  tags: { slug: string; name: string }[];
  ttasks: ToolDetailTask[];
};

const iconProps = { fill: "none", stroke: "currentColor", strokeWidth: 2, strokeLinecap: "round", strokeLinejoin: "round" } as const;

function I({ d, size = 14, className = "", fill = "none" }: { d: React.ReactNode; size?: number; className?: string; fill?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" className={className} aria-hidden="true" {...iconProps} fill={fill}>
      {d}
    </svg>
  );
}

const P = {
  star: <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />,
  shield: (
    <>
      <path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1 1 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z" />
      <path d="m9 12 2 2 4-4" />
    </>
  ),
  trending: <path d="M16 7h6v6" />,
  trending2: (
    <>
      <path d="M16 7h6v6" />
      <path d="m22 7-8.5 8.5-5-5L2 17" />
    </>
  ),
  thumb: <path d="M7 10v12" />,
  thumb2: (
    <>
      <path d="M7 10v12" />
      <path d="M15 5.88 14 10h5.83a2 2 0 0 1 1.92 2.56l-2.33 8A2 2 0 0 1 17.5 22H4a2 2 0 0 1-2-2v-8a2 2 0 0 1 2-2h2.76a2 2 0 0 0 1.79-1.11L12 2a3.13 3.13 0 0 1 3 3.88Z" />
    </>
  ),
  bookmark: <path d="M19 21l-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />,
  share: (
    <>
      <circle cx="18" cy="5" r="3" />
      <circle cx="6" cy="12" r="3" />
      <circle cx="18" cy="19" r="3" />
      <path d="m8.59 13.51 6.83 3.98" />
      <path d="m15.41 6.51-6.83 3.98" />
    </>
  ),
  upRight: (
    <>
      <path d="M7 7h10v10" />
      <path d="M7 17 17 7" />
    </>
  ),
  chevD: <path d="m6 9 6 6 6-6" />,
  chevU: <path d="m18 15-6-6-6 6" />,
  ext: (
    <>
      <path d="M15 3h6v6" />
      <path d="M10 14 21 3" />
      <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
    </>
  ),
  file: (
    <>
      <path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z" />
      <path d="M14 2v4a2 2 0 0 0 2 2h4" />
    </>
  ),
  sparkles: (
    <>
      <path d="M9.94 15.5a2 2 0 0 0-1.44-1.44L2 12l6.5-2.06a2 2 0 0 0 1.44-1.44L12 2l2.06 6.5a2 2 0 0 0 1.44 1.44L22 12l-6.5 2.06a2 2 0 0 0-1.44 1.44L12 22z" />
    </>
  ),
  checks: (
    <>
      <path d="m3 17 2 2 4-4" />
      <path d="m3 7 2 2 4-4" />
      <path d="M13 6h8" />
      <path d="M13 12h8" />
      <path d="M13 18h8" />
    </>
  ),
  arrow: (
    <>
      <polygon points="0,0 10,5 0,10 3,5" fill="#6E56CF" />
    </>
  ),
};

function RatingStars({ rating, reviewCount, size = "sm" }: { rating: number | null; reviewCount?: number; size?: string }) {
  const filled = Math.round(rating ?? 0);
  return (
    <span className="inline-flex items-center gap-1">
      <span className="inline-flex items-center gap-0.5" aria-label={rating != null ? `Rated ${rating} out of 5` : "No rating yet"}>
        {[1, 2, 3, 4, 5].map((s) => (
          <I key={s} d={P.star} size={size === "sm" ? 13 : 16} className={s <= filled ? "text-[#F5C84C]" : "text-[#3a3a3e]"} fill={s <= filled ? "currentColor" : "none"} />
        ))}
      </span>
      {reviewCount != null && reviewCount > 0 && (
        <span className="text-[11px] text-[#71717A]">({reviewCount})</span>
      )}
    </span>
  );
}

function PricingBadge({ pricingModel, pricingAmount, billingFrequency }: { pricingModel: string; pricingAmount: string | null; billingFrequency: string | null }) {
  return (
    <span className="inline-flex items-center rounded-md border border-[#6E56CF]/25 bg-[#6E56CF]/10 px-2.5 py-1 text-[11px] font-bold text-[#A78BFA] leading-none">
      {pricingModel}
      {pricingAmount != null && pricingAmount !== "" ? ` $${pricingAmount}` : ""}
      {billingFrequency ? `/${billingFrequency}` : ""}
    </span>
  );
}

function SectionHead({ icon, title, badge }: { icon: React.ReactNode; title: string; badge?: string }) {
  return (
    <div className="flex items-center justify-between border-b border-[#232326]/50 pb-3">
      <div className="flex items-center gap-2.5">
        <span className="text-[#6E56CF] h-3.5 w-3.5 shrink-0 inline-flex">{icon}</span>
        <h2 className="text-sm font-bold text-white uppercase tracking-wide">{title}</h2>
      </div>
      {badge && (
        <span className="text-[10px] font-mono text-[#52525B] bg-[#131316] border border-[#232326] rounded-full px-2 py-0.5">{badge}</span>
      )}
    </div>
  );
}

function SpecRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between py-2 px-3 rounded-lg hover:bg-[#1e1e24] transition-colors border-b border-[#1a1a1e] last:border-0 text-xs">
      <span className="text-[#52525B] shrink-0">{label}</span>
      <span className="font-semibold text-white capitalize text-right ml-4">{value}</span>
    </div>
  );
}

function monthYear(value: string): string {
  try {
    return new Intl.DateTimeFormat("en-US", { month: "long", year: "numeric" }).format(new Date(value));
  } catch {
    return value;
  }
}

export default function ToolDetail({ tool }: { tool: ToolDetailData }) {
  const [upvoted, setUpvoted] = useState(false);
  const [upvotes, setUpvotes] = useState(tool.upvoteCount);
  const [bookmarked, setBookmarked] = useState(false);
  const [tab, setTab] = useState<"overview" | "pricing" | "reviews">("overview");
  const [shownTasks, setShownTasks] = useState(8);

  const toggleUpvote = () => {
    const next = !upvoted;
    setUpvoted(next);
    setUpvotes((v) => (next ? v + 1 : Math.max(0, v - 1)));
    try {
      localStorage.setItem(`upvoted-${tool.id}`, next ? "true" : "false");
    } catch {
      /* storage unavailable */
    }
  };

  const share = async () => {
    if (navigator.share) {
      try {
        await navigator.share({ title: tool.name, url: window.location.href });
      } catch {
        /* dismissed */
      }
    } else {
      navigator.clipboard.writeText(window.location.href).catch(() => {});
    }
  };

  const specs: { label: string; value: string }[] = [
    { label: "Pricing", value: tool.pricingModel.toLowerCase().replace("_", " ") },
    ...(tool.pricingAmount != null && tool.pricingAmount !== ""
      ? [{ label: "Starting at", value: `$${tool.pricingAmount}/${(tool.billingFrequency ?? "").toLowerCase()}` }]
      : []),
    { label: "Open Source", value: tool.isOpenSource ? "Yes" : "No" },
    { label: "API", value: tool.hasApi ? "Available" : "No" },
    ...(tool.launchDate ? [{ label: "Launch Date", value: tool.launchDate }] : []),
    ...(tool.releaseDate ? [{ label: "Release Date", value: monthYear(tool.releaseDate) }] : []),
  ];

  const compatList = (tool.compatibility ?? "").split(",").map((s) => s.trim()).filter(Boolean);
  const tasks = tool.ttasks;
  const visibleTasks = tasks.slice(0, shownTasks);
  const siteUrl = tool.websiteUrl ?? tool.visitUrl;

  return (
    <main className="mx-auto max-w-[1400px] px-4 pt-2 pb-5 md:px-6 md:pt-3 md:pb-8 text-white">
      <nav className="mb-2 text-xs font-semibold text-[#52525B] flex items-center gap-1.5 flex-wrap" aria-label="Breadcrumb">
        <Link href="/" className="hover:text-white transition-colors">Home</Link>
        <span>›</span>
        <Link href="/tools" className="hover:text-white transition-colors">AI Tools</Link>
        {tool.categories[0] && (
          <>
            <span>›</span>
            <Link href={`/tools?category=${encodeURIComponent(tool.categories[0].slug)}`} className="hover:text-white transition-colors">{tool.categories[0].name}</Link>
          </>
        )}
        <span>›</span>
        <span className="text-[#A1A1AA]">{tool.name}</span>
      </nav>

      <header className="relative rounded-2xl border border-[#1e1e22] bg-[#09090c] overflow-hidden mb-5">
        <div className="absolute inset-0 bg-gradient-to-br from-[#6E56CF]/6 via-[#6E56CF]/2 to-transparent pointer-events-none" />
        <div className="absolute right-0 top-0 w-80 h-80 bg-[#6E56CF]/5 rounded-full blur-3xl pointer-events-none" />
        <div className="relative p-4 md:p-8">
          {/* Mobile hero */}
          <div className="sm:hidden space-y-3">
            <div className="flex gap-3 items-center">
              <div className="shrink-0 relative">
                <div className="absolute inset-0 rounded-2xl bg-[#6E56CF]/20 blur-xl scale-110 pointer-events-none" />
                <div className="relative flex h-16 w-16 items-center justify-center overflow-hidden rounded-2xl border border-white/10 bg-white shadow-2xl shadow-black/50">
                  {tool.logoUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={tool.logoUrl} alt={tool.name} className="h-12 w-12 object-contain" />
                  ) : (
                    <span className="text-xl font-black text-neutral-900">{tool.name.charAt(0)}</span>
                  )}
                </div>
              </div>
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-1.5">
                  <h1 className="text-2xl font-black text-white tracking-tight leading-tight">{tool.name}</h1>
                  {tool.verified && <I d={P.shield} size={15} className="text-[#6E56CF] shrink-0" />}
                  {tool.isTrending && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-orange-500/15 border border-orange-500/20 px-2 py-0.5 text-[9px] font-bold text-orange-400">
                      <I d={P.trending2} size={8} /> Trending
                    </span>
                  )}
                </div>
                <div className="flex flex-wrap gap-1.5 mt-1">
                  {tool.categories.slice(0, 3).map((c) => (
                    <Link key={c.slug} href={`/tools?category=${encodeURIComponent(c.slug)}`} className="inline-block rounded-md border border-[#6E56CF]/25 bg-[#6E56CF]/10 px-2.5 py-1 text-[11px] font-semibold text-[#A78BFA] leading-none">
                      {c.name}
                    </Link>
                  ))}
                </div>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <PricingBadge pricingModel={tool.pricingModel} pricingAmount={tool.pricingAmount} billingFrequency={tool.billingFrequency} />
              <span className="text-[#3a3a3e]">•</span>
              <RatingStars rating={tool.avgRating} size="sm" />
            </div>
            <p className="text-[13px] text-[#A1A1AA] leading-relaxed">{tool.description}</p>
            <div className="flex flex-col gap-2">
              {siteUrl && (
                <a href={siteUrl} target="_blank" rel="noopener noreferrer nofollow" className="inline-flex w-full justify-center items-center gap-2 rounded-xl bg-[#6E56CF] px-4 py-2.5 text-sm font-extrabold text-white shadow-lg shadow-[#6E56CF]/25 hover:bg-[#7C66DF] transition-all active:scale-95">
                  Visit Website <I d={P.upRight} size={14} />
                </a>
              )}
              {tool.hasApi && tool.apiDocsUrl && (
                <a href={tool.apiDocsUrl} target="_blank" rel="noopener noreferrer nofollow" className="inline-flex w-full justify-center items-center gap-1.5 rounded-xl border border-[#2a2a2e] bg-[#0d0d10] px-4 py-2 text-xs font-semibold text-[#71717A] hover:text-white hover:border-white/10 transition-all">
                  View API Docs
                </a>
              )}
              <div className="grid grid-cols-3 gap-2">
                <button onClick={toggleUpvote} className={`flex flex-col items-center justify-center gap-0.5 rounded-xl border px-2 py-2.5 text-xs font-bold transition-all active:scale-95 cursor-pointer ${upvoted ? "bg-[#6E56CF] text-white border-[#6E56CF]" : "border-[#232326] bg-[#0d0d10] text-white"}`}>
                  <I d={P.thumb2} size={13} className={upvoted ? "fill-white" : ""} />
                  <span className="text-[10px] font-mono">{upvotes}</span>
                </button>
                <button onClick={() => setBookmarked((v) => !v)} className={`flex items-center justify-center rounded-xl border py-2.5 transition-all active:scale-95 cursor-pointer ${bookmarked ? "bg-[#6E56CF] text-white border-[#6E56CF]" : "border-[#232326] bg-[#0d0d10] text-white"}`}>
                  <I d={P.bookmark} size={14} className={bookmarked ? "fill-white" : ""} />
                </button>
                <button onClick={share} className="flex items-center justify-center rounded-xl border border-[#232326] bg-[#0d0d10] py-2.5 text-[#71717A] hover:text-white transition-all active:scale-95 cursor-pointer">
                  <I d={P.share} size={14} />
                </button>
              </div>
            </div>
          </div>

          {/* Desktop hero */}
          <div className="hidden sm:flex gap-6 items-start justify-between">
            <div className="flex gap-6 items-start">
              <div className="shrink-0 relative">
                <div className="absolute inset-0 rounded-2xl bg-[#6E56CF]/20 blur-xl scale-110 pointer-events-none" />
                <div className="relative flex h-28 w-28 md:h-32 md:w-32 items-center justify-center overflow-hidden rounded-2xl border border-white/10 bg-white shadow-2xl shadow-black/50">
                  {tool.logoUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={tool.logoUrl} alt={tool.name} className="h-20 w-20 md:h-24 md:w-24 object-contain" />
                  ) : (
                    <span className="text-3xl font-black text-neutral-900">{tool.name.charAt(0)}</span>
                  )}
                </div>
              </div>
              <div className="min-w-0 flex-1 pt-1">
                <div className="flex flex-wrap items-center gap-2 mb-1">
                  <h1 className="text-2xl md:text-3xl font-black text-white tracking-tight leading-none">{tool.name}</h1>
                  {tool.verified && <I d={P.shield} size={18} className="text-[#6E56CF] shrink-0" />}
                  {tool.isTrending && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-orange-500/15 border border-orange-500/20 px-2.5 py-0.5 text-[10px] font-bold text-orange-400">
                      <I d={P.trending2} size={9} /> Trending
                    </span>
                  )}
                </div>
                <div className="flex flex-wrap items-center gap-1.5 mt-2">
                  <PricingBadge pricingModel={tool.pricingModel} pricingAmount={tool.pricingAmount} billingFrequency={tool.billingFrequency} />
                  <span className="text-[#3a3a3e]">•</span>
                  <RatingStars rating={tool.avgRating} reviewCount={tool.reviewCount} size="sm" />
                  <span className="text-[#3a3a3e]">•</span>
                  {tool.categories.slice(0, 3).map((c) => (
                    <Link key={c.slug} href={`/tools?category=${encodeURIComponent(c.slug)}`} className="inline-block text-[10px] font-mono font-semibold px-2 py-0.5 rounded-md border border-[#2a2a2e] text-[#71717A] hover:text-white hover:border-white/10 transition-colors leading-none">
                      {c.name}
                    </Link>
                  ))}
                </div>
                <p className="text-[13px] md:text-sm text-[#A1A1AA] leading-relaxed mt-3 max-w-2xl">{tool.description}</p>
                {tool.releaseDate && (
                  <div className="flex flex-wrap items-center gap-1.5 mt-2">
                    <span className="text-[11px] text-[#A1A1AA] font-medium">{monthYear(tool.releaseDate)}</span>
                  </div>
                )}
                {compatList.length > 0 && (
                  <div className="flex flex-wrap items-center gap-1.5 mt-3">
                    <span className="text-[10px] text-[#52525B] font-bold shrink-0">Works on:</span>
                    {compatList.map((c) => (
                      <span key={c} className="rounded-md border border-[#232326] bg-[#131316] px-2 py-0.5 text-[10px] font-semibold text-[#A1A1AA]">{c}</span>
                    ))}
                  </div>
                )}
              </div>
            </div>
            <div className="flex flex-col gap-2 w-52 shrink-0">
              {siteUrl && (
                <a href={siteUrl} target="_blank" rel="noopener noreferrer nofollow" className="inline-flex w-full justify-center items-center gap-2 rounded-xl bg-[#6E56CF] px-4 py-3 text-sm font-extrabold text-white shadow-lg shadow-[#6E56CF]/25 hover:bg-[#7C66DF] hover:shadow-[#6E56CF]/40 transition-all active:scale-95">
                  Visit Website <I d={P.upRight} size={14} />
                </a>
              )}
              {tool.hasApi && tool.apiDocsUrl && (
                <a href={tool.apiDocsUrl} target="_blank" rel="noopener noreferrer nofollow" className="inline-flex w-full justify-center items-center gap-1.5 rounded-xl border border-[#2a2a2e] bg-[#0d0d10] px-4 py-2.5 text-xs font-semibold text-[#71717A] hover:text-white hover:border-white/10 transition-all">
                  View API Docs
                </a>
              )}
              <div className="grid grid-cols-3 gap-2 mt-0.5">
                <button onClick={toggleUpvote} className={`flex flex-col items-center justify-center gap-0.5 rounded-xl border px-2 py-2.5 text-xs font-bold transition-all ${upvoted ? "bg-[#6E56CF] text-white border-[#6E56CF] shadow-lg shadow-[#6E56CF]/20" : "border-[#232326] bg-[#0d0d10] text-white hover:border-[#6E56CF]/30 hover:bg-[#6E56CF]/5"}`}>
                  <I d={P.thumb2} size={12} className={upvoted ? "fill-white" : ""} />
                  <span className="text-[9px] font-mono">{upvotes}</span>
                </button>
                <button onClick={() => setBookmarked((v) => !v)} className={`flex items-center justify-center rounded-xl border py-2.5 transition-all ${bookmarked ? "bg-[#6E56CF] text-white border-[#6E56CF] shadow-lg shadow-[#6E56CF]/20" : "border-[#232326] bg-[#0d0d10] text-white hover:border-[#6E56CF]/30 hover:bg-[#6E56CF]/5"}`}>
                  <I d={P.bookmark} size={13} className={bookmarked ? "fill-white" : ""} />
                </button>
                <button onClick={share} className="flex items-center justify-center rounded-xl border border-[#232326] bg-[#0d0d10] py-2.5 text-[#71717A] hover:text-white hover:border-white/10 transition-all">
                  <I d={P.share} size={13} />
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="flex border-b border-[#232326] mb-5 overflow-x-auto scrollbar-none">
        {(["overview", "pricing", "reviews"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-5 py-2.5 text-xs font-bold uppercase tracking-wider whitespace-nowrap transition-all border-b-2 -mb-px ${tab === t ? "border-[#6E56CF] text-white bg-[#6E56CF]/5" : "border-transparent text-[#52525B] hover:text-[#A1A1AA]"}`}
          >
            {t === "reviews" ? `Reviews (${tool.reviewCount})` : t}
          </button>
        ))}
      </div>

      {tab === "overview" && (
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-5">
          <div className="space-y-4 min-w-0">
            <section className="rounded-xl border border-[#1e1e22] bg-[#09090c] p-5 space-y-3 relative overflow-hidden">
              <div className="absolute -top-10 -right-10 w-40 h-40 bg-blue-600/6 rounded-full blur-2xl pointer-events-none" />
              <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-indigo-600/5 rounded-full blur-2xl pointer-events-none" />
              <SectionHead icon={<I d={P.file} size={14} />} title="Overview" />
              <div className="text-[13px] leading-relaxed text-[#A1A1AA] space-y-2.5">
                {tool.description.split("\n\n").map((p, i) => (
                  <p key={i}>{p}</p>
                ))}
              </div>
              {(tool.categories.length > 0 || tool.tags.length > 0) && (
                <div className="pt-3 border-t border-[#232326]/60 space-y-2.5">
                  {tool.categories.length > 0 && (
                    <div className="flex flex-wrap items-center gap-1.5">
                      <span className="text-[10px] font-mono text-[#52525B] uppercase tracking-widest shrink-0">Categories</span>
                      <span className="text-[#2a2a2e]">•</span>
                      {tool.categories.map((c) => (
                        <Link key={c.slug} href={`/tools?category=${encodeURIComponent(c.slug)}`} className="inline-block rounded-md border border-[#232326] bg-[#131316] px-2.5 py-1 text-[11px] font-semibold text-[#A1A1AA] hover:border-[#6E56CF]/30 hover:text-white transition-all leading-none">
                          {c.name}
                        </Link>
                      ))}
                    </div>
                  )}
                  {tool.tags.length > 0 && (
                    <div className="flex flex-wrap items-center gap-1.5">
                      <span className="text-[10px] font-mono text-[#52525B] uppercase tracking-widest shrink-0">Tags</span>
                      <span className="text-[#2a2a2e]">•</span>
                      {tool.tags.map((t) => (
                        <Link key={t.slug} href={`/tools?tag=${t.slug}`} className="inline-block rounded-md border border-[#232326] bg-[#131316] px-2.5 py-1 text-[11px] font-mono font-semibold text-[#71717A] hover:border-[#6E56CF]/30 hover:text-[#A1A1AA] transition-all leading-none">
                          #{t.name}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </section>

            <section className="rounded-xl border border-[#1e1e22] bg-[#09090c] p-4 relative overflow-hidden lg:hidden">
              <div className="absolute -top-10 -right-10 w-36 h-36 bg-blue-600/6 rounded-full blur-2xl pointer-events-none" />
              <h3 className="text-sm font-bold text-white uppercase tracking-wide border-b border-[#232326]/50 pb-3 mb-1 flex items-center gap-2.5">
                <I d={P.file} size={13} className="text-[#6E56CF]" /> Specifications
              </h3>
              {specs.map((s) => (
                <SpecRow key={s.label} label={s.label} value={s.value} />
              ))}
            </section>

            {tasks.length > 0 && (
              <section className="rounded-xl border border-[#1e1e22] bg-[#09090c] p-5 space-y-3 relative overflow-hidden">
                <div className="absolute -top-12 -right-12 w-40 h-40 bg-[#6E56CF]/4 rounded-full blur-3xl pointer-events-none" />
                <SectionHead icon={<I d={P.checks} size={14} />} title="Use Cases" badge={`${tasks.length} tasks`} />
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-10">
                  {visibleTasks.map((t) => (
                    <Link key={t.slug} href={`/tasks/${t.slug}`} className="group flex items-center gap-2.5 py-2.5 border-b border-[#ffffff08] last:border-0 sm:[&:nth-last-child(2):nth-child(odd)]:border-0">
                      <svg className="shrink-0 mt-[3px] group-hover:fill-[#A78BFA] transition-colors" width="9" height="9" viewBox="0 0 10 10" fill="none">
                        <polygon points="0,0 10,5 0,10 3,5" fill="#6E56CF" />
                      </svg>
                      <span className="text-[13px] font-medium text-[#A1A1AA] group-hover:text-white transition-colors leading-snug truncate">{t.title}</span>
                    </Link>
                  ))}
                </div>
                <div className="flex items-center gap-4 mt-1">
                  {shownTasks < tasks.length && (
                    <button onClick={() => setShownTasks((v) => Math.min(v + 4, tasks.length))} className="flex items-center gap-1.5 text-xs font-bold text-[#6E56CF] hover:text-[#A78BFA] transition-colors group">
                      <I d={P.chevD} size={13} className="group-hover:translate-y-0.5 transition-transform" /> Show more
                    </button>
                  )}
                  {shownTasks > 8 && (
                    <button onClick={() => setShownTasks(8)} className="flex items-center gap-1.5 text-xs font-bold text-[#52525B] hover:text-[#A1A1AA] transition-colors group">
                      <I d={P.chevU} size={13} className="group-hover:-translate-y-0.5 transition-transform" /> Show less
                    </button>
                  )}
                </div>
              </section>
            )}

            {tool.useCases && (
              <section className="rounded-xl border border-[#1e1e22] bg-[#09090c] p-5 space-y-3 relative overflow-hidden">
                <div className="absolute -top-10 -right-10 w-36 h-36 bg-[#6E56CF]/4 rounded-full blur-2xl pointer-events-none" />
                <SectionHead icon={<I d={P.sparkles} size={14} />} title="Best Uses" />
                <p className="text-[13px] leading-relaxed text-[#A1A1AA]">{tool.useCases}</p>
              </section>
            )}
          </div>

          <aside className="space-y-4">
            <section className="hidden lg:block rounded-xl border border-[#1e1e22] bg-[#09090c] p-4 relative overflow-hidden">
              <div className="absolute -top-10 -right-10 w-36 h-36 bg-blue-600/6 rounded-full blur-2xl pointer-events-none" />
              <h3 className="text-sm font-bold text-white uppercase tracking-wide border-b border-[#232326]/50 pb-3 mb-1 flex items-center gap-2.5">
                <I d={P.file} size={13} className="text-[#6E56CF]" /> Specifications
              </h3>
              {specs.map((s) => (
                <SpecRow key={s.label} label={s.label} value={s.value} />
              ))}
            </section>
            {tasks.length >= 4 && siteUrl && (
              <section className="rounded-xl border border-[#1e1e22] bg-[#09090c] p-4 relative overflow-hidden">
                <div className="absolute -top-12 -right-12 w-40 h-40 bg-[#6E56CF]/4 rounded-full blur-3xl pointer-events-none" />
                <p className="text-[11px] text-[#71717A] mb-1">Starting at</p>
                <p className="text-lg font-extrabold text-white capitalize mb-3">
                  {tool.pricingModel.toLowerCase().replace("_", " ")}
                  {tool.pricingAmount ? ` $${tool.pricingAmount}` : ""}
                </p>
                <a href={siteUrl} target="_blank" rel="noopener noreferrer nofollow" className="inline-flex w-full justify-center items-center gap-2 rounded-xl bg-[#6E56CF] px-4 py-2.5 text-sm font-extrabold text-white shadow-lg shadow-[#6E56CF]/25 hover:bg-[#7C66DF] transition-all active:scale-95">
                  Visit Website <I d={P.upRight} size={14} />
                </a>
              </section>
            )}
          </aside>
        </div>
      )}

      {tab === "pricing" && (
        <div className="rounded-xl border border-[#232326] bg-[#0d0d10] p-8 text-center space-y-4">
          <p className="text-[#52525B] text-sm">Detailed pricing tiers not listed yet.</p>
          <div className="flex items-center justify-center gap-3 flex-wrap">
            <div className="flex flex-col items-center gap-1 px-5 py-3 rounded-xl border border-[#232326] bg-[#131316]">
              <span className="text-[10px] text-[#52525B]">Model</span>
              <span className="font-bold text-white capitalize">{tool.pricingModel.toLowerCase().replace("_", " ")}</span>
            </div>
            {tool.pricingAmount && (
              <div className="flex flex-col items-center gap-1 px-5 py-3 rounded-xl border border-[#6E56CF]/20 bg-[#6E56CF]/5">
                <span className="text-[10px] text-[#52525B]">Starting at</span>
                <span className="font-bold text-white">${tool.pricingAmount}/{(tool.billingFrequency ?? "").toLowerCase()}</span>
              </div>
            )}
          </div>
          {siteUrl && (
            <a href={siteUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-xs font-bold text-[#6E56CF] hover:underline">
              Check on website <I d={P.ext} size={11} />
            </a>
          )}
        </div>
      )}

      {tab === "reviews" && (
        <div className="rounded-xl border border-[#232326] bg-[#0d0d10] p-8 sm:p-12 text-center">
          <div className="flex justify-center mb-3">
            <RatingStars rating={tool.avgRating} size="lg" />
          </div>
          <p className="font-semibold text-white mb-1">No reviews yet</p>
          <p className="text-xs text-[#52525B]">Be the first to review {tool.name}.</p>
        </div>
      )}
    </main>
  );
}
