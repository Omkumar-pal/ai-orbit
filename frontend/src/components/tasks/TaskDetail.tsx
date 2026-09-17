"use client";

import { useState } from "react";
import Link from "next/link";

export type TaskDetailTool = {
  slug: string;
  name: string;
  logoUrl: string | null;
  tagline: string | null;
  pricingModel: string | null;
  pricingAmount: string | null;
  billingFrequency: string | null;
  hasApi: boolean;
  isOpenSource: boolean;
  compatibility: string | null;
  releaseDate: string | null;
  position: number | null;
};

export type TaskDetailData = {
  title: string;
  slug: string;
  description: string;
  iconUrl: string | null;
  categoryName: string;
  categorySlug: string | null;
  subscribers: number;
  difficulty: string | null;
  pricingModel: string | null;
  likes: number;
  saves: number;
  toolsCount: number;
  modelsCount: number;
  robotsCount: number;
  devicesCount: number;
  popular: { name: string; logoUrl: string | null } | null;
  tools: TaskDetailTool[];
};

// Subtask pills per category — mirrors the reference UI's static map.
const SUBTASK_PILLS: Record<string, { label: string; count: number }[]> = {
  "image-creation": [
    { label: "Illustrations", count: 210 },
    { label: "Image editing", count: 180 },
    { label: "Product images", count: 92 },
    { label: "Background removal", count: 74 },
    { label: "Upscaling", count: 63 },
    { label: "Portraits", count: 58 },
    { label: "Fantasy images", count: 41 },
    { label: "Vector art", count: 33 },
    { label: "Funny images", count: 22 },
  ],
  "content-creation": [
    { label: "Blog posts", count: 210 },
    { label: "Ad copy", count: 140 },
    { label: "Paraphrasing", count: 118 },
    { label: "SEO content", count: 95 },
    { label: "Social captions", count: 80 },
    { label: "Product descriptions", count: 62 },
    { label: "Creative writing", count: 40 },
  ],
  "video-creation": [
    { label: "Talking avatars", count: 90 },
    { label: "Text to video", count: 75 },
    { label: "Video editing", count: 60 },
    { label: "Short clips", count: 34 },
    { label: "Captions", count: 28 },
    { label: "Voiceover", count: 19 },
  ],
  coding: [
    { label: "Code completion", count: 55 },
    { label: "App building", count: 44 },
    { label: "Debugging", count: 40 },
    { label: "Code review", count: 30 },
    { label: "Terminal agents", count: 24 },
    { label: "Test generation", count: 20 },
  ],
};

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

// Compact count — mirrors the reference UI (1.0k / 1.0m).
function compact(n: number | null | undefined): string {
  if (n == null) return "0";
  if (n >= 1e6) return `${(n / 1e6).toFixed(1)}m`;
  if (n >= 1e3) return `${(n / 1e3).toFixed(1)}k`;
  return n.toLocaleString("en-US");
}

function formatRelease(value: string | null): string {
  if (!value) return "—";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "—";
  return `${MONTHS[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`;
}

function formatAmount(value: string | null): string | null {
  if (value == null || value === "") return null;
  const n = Number(value);
  if (Number.isNaN(n)) return value;
  return n.toLocaleString("en-US", { maximumFractionDigits: 2 });
}

const GRID_COLS =
  "grid-cols-[48px_200px_minmax(150px,1.6fr)_minmax(110px,1.1fr)_minmax(60px,0.6fr)_minmax(90px,0.9fr)_minmax(80px,0.7fr)_44px_44px_60px_60px] md:grid-cols-[60px_minmax(280px,3.5fr)_minmax(150px,1.6fr)_minmax(110px,1.1fr)_minmax(60px,0.6fr)_minmax(90px,0.9fr)_minmax(80px,0.7fr)_44px_44px_60px_60px]";
const GRID_MIN = "min-w-fit md:min-w-[1070px]";
const TH = "text-[9.5px] font-mono font-semibold tracking-wider text-[#71717A]";

function YesNo({ value, trueLabel, falseLabel }: { value: boolean; trueLabel: string; falseLabel: string }) {
  return (
    <span className="inline-flex items-center rounded-full border border-[#232326]/60 bg-[#18181C] px-2 py-0.5 text-[10px] font-mono font-semibold text-[#A1A1AA] transition-colors hover:border-[#3a3a3d] hover:text-white">
      {value ? trueLabel : falseLabel}
    </span>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-xs text-[#71717A] mb-1.5">{label}</div>
      <div className="text-lg font-bold text-white tabular-nums">{value}</div>
    </div>
  );
}

const iconProps = { fill: "none", stroke: "currentColor", strokeWidth: 2, strokeLinecap: "round", strokeLinejoin: "round" } as const;

export default function TaskDetail({ task }: { task: TaskDetailData }) {
  const [liked, setLiked] = useState(false);
  const [saved, setSaved] = useState(false);
  const [subscribed, setSubscribed] = useState(false);
  const [copied, setCopied] = useState(false);
  const [shared, setShared] = useState(false);
  const [selectedPill, setSelectedPill] = useState<string | null>(null);
  const [showAllPills, setShowAllPills] = useState(false);

  const pills = task.categorySlug ? (SUBTASK_PILLS[task.categorySlug] ?? []) : [];
  const visiblePills = showAllPills ? pills : pills.slice(0, 6);
  const hiddenPillCount = pills.length - visiblePills.length;

  const copyLink = async () => {
    const url = `${window.location.origin}/tasks/${task.slug}`;
    try {
      await navigator.clipboard.writeText(url);
    } catch {
      const el = document.createElement("textarea");
      el.value = url;
      document.body.appendChild(el);
      el.select();
      document.execCommand("copy");
      el.remove();
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const shareTask = async () => {
    const url = `${window.location.origin}/tasks/${task.slug}`;
    if (navigator.share) {
      try {
        await navigator.share({ title: task.title, text: task.description, url });
      } catch {
        /* dismissed */
      }
      return;
    }
    await copyLink();
  };

  const shareTool = async (slug: string, name: string, tagline: string | null) => {
    const url = `${window.location.origin}/tools/${slug}`;
    if (navigator.share) {
      try {
        await navigator.share({ title: name, text: tagline ?? "", url });
      } catch {
        /* dismissed */
      }
      return;
    }
    try {
      await navigator.clipboard.writeText(url);
    } catch {
      /* clipboard unavailable */
    }
    setShared(true);
    setTimeout(() => setShared(false), 2000);
  };

  return (
    <div className="w-full px-3 sm:px-6 lg:px-10 py-4 sm:py-6 flex-1">
      <Link href="/tasks" className="inline-flex items-center gap-1 text-xs text-[#71717A] hover:text-white transition-colors duration-200 mb-3">
        ‹ Back to Tasks
      </Link>

      <div className="w-full rounded-2xl bg-[#0B0B0E] ring-1 ring-[#232326]/60 p-4 sm:p-7 mb-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex min-w-0 items-start gap-3">
            {task.iconUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={task.iconUrl} alt="" className="h-12 w-12 shrink-0 rounded-lg bg-[#18181C] object-contain p-1 ring-1 ring-[#232326]/70" />
            ) : (
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-[#18181C] text-lg font-black text-white ring-1 ring-[#232326]/70">
                {task.title.charAt(0)}
              </span>
            )}
            <div className="min-w-0">
              <h1 className="text-2xl sm:text-4xl font-black tracking-tight text-white">{task.title}</h1>
              <div className="flex flex-wrap items-center gap-2 mt-3">
                <span className="inline-flex items-center px-2.5 py-1 rounded-md bg-[#18181C] ring-1 ring-[#232326]/70 text-[11px] text-[#A1A1AA] font-mono">
                  {task.categoryName}
                </span>
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[#18181C] ring-1 ring-[#232326]/70 text-[11px] text-[#A1A1AA]">
                  <svg viewBox="0 0 24 24" className="h-3 w-3" aria-hidden="true" {...iconProps}>
                    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                    <circle cx="9" cy="7" r="4" />
                    <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
                    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                  </svg>
                  {task.subscribers} subscribers
                </span>
                {task.difficulty && (
                  <span className="inline-flex items-center px-2.5 py-1 rounded-md bg-[#18181C] ring-1 ring-[#232326]/70 text-[11px] text-[#A1A1AA] font-mono">
                    {task.difficulty}
                  </span>
                )}
                {task.pricingModel && (
                  <span className="inline-flex items-center px-2.5 py-1 rounded-md bg-[#18181C] ring-1 ring-[#232326]/70 text-[11px] text-[#A1A1AA] font-mono">
                    {task.pricingModel}
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => setLiked((v) => !v)}
              aria-pressed={liked}
              aria-label={`Like ${task.title}`}
              className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-2.5 text-xs font-semibold transition-all duration-200 active:scale-95 ${liked ? "bg-[#18181C]/80 ring-1 ring-[#3A3A3E] text-white" : "bg-[#18181C]/80 ring-1 ring-[#232326]/70 text-[#A1A1AA] hover:text-white hover:ring-[#3A3A3E]"}`}
            >
              <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" aria-hidden="true" {...iconProps} fill={liked ? "currentColor" : "none"}>
                <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
              </svg>
              {compact(task.likes + (liked ? 1 : 0))}
            </button>
            <button
              type="button"
              onClick={() => setSaved((v) => !v)}
              aria-pressed={saved}
              aria-label={`Save ${task.title}`}
              title="Save task (coming soon)"
              className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-2.5 text-xs font-semibold transition-all duration-200 active:scale-95 ${saved ? "bg-[#18181C]/80 ring-1 ring-[#3A3A3E] text-white" : "bg-[#18181C]/80 ring-1 ring-[#232326]/70 text-[#A1A1AA] hover:text-white hover:ring-[#3A3A3E]"}`}
            >
              <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" aria-hidden="true" {...iconProps} fill={saved ? "currentColor" : "none"}>
                <path d="M19 21l-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
              </svg>
              {task.saves + (saved ? 1 : 0)} saves
            </button>
            <button
              type="button"
              onClick={() => setSubscribed((v) => !v)}
              aria-pressed={subscribed}
              className={`inline-flex items-center gap-1.5 rounded-lg transition-all duration-200 text-xs font-semibold px-4 py-2.5 active:scale-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#6E56CF]/60 focus-visible:ring-offset-2 focus-visible:ring-offset-black ${subscribed ? "bg-[#18181C]/80 ring-1 ring-[#3A3A3E] text-white" : "bg-gradient-to-b from-[#7C63E0] to-[#6E56CF] hover:from-[#8A73EA] hover:to-[#7C63E0] text-white shadow-[0_4px_16px_-4px_rgba(110,86,207,0.5)]"}`}
            >
              <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" aria-hidden="true" {...iconProps}>
                <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
                <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
              </svg>
              {subscribed ? "Subscribed" : "Subscribe"}
            </button>
            <button
              type="button"
              onClick={shareTask}
              aria-label="Share this task"
              className="inline-flex items-center justify-center h-9 w-9 rounded-lg bg-[#18181C]/80 ring-1 ring-[#232326]/70 text-[#A1A1AA] hover:text-white hover:ring-[#3A3A3E] active:scale-95 transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#6E56CF]/60"
            >
              <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" aria-hidden="true" {...iconProps}>
                <circle cx="18" cy="5" r="3" />
                <circle cx="6" cy="12" r="3" />
                <circle cx="18" cy="19" r="3" />
                <path d="m8.59 13.51 6.83 3.98" />
                <path d="m15.41 6.51-6.83 3.98" />
              </svg>
            </button>
            <button
              type="button"
              onClick={copyLink}
              aria-label="Copy link"
              className="relative inline-flex items-center justify-center h-9 w-9 rounded-lg bg-[#18181C]/80 ring-1 ring-[#232326]/70 text-[#A1A1AA] hover:text-white hover:ring-[#3A3A3E] active:scale-95 transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#6E56CF]/60"
            >
              {copied ? (
                <svg viewBox="0 0 24 24" className="h-3.5 w-3.5 text-emerald-400" aria-hidden="true" {...iconProps}>
                  <path d="M20 6 9 17l-5-5" />
                </svg>
              ) : (
                <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" aria-hidden="true" {...iconProps}>
                  <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
                  <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
                </svg>
              )}
              {copied && (
                <span className="absolute -bottom-8 right-0 whitespace-nowrap rounded-md bg-[#18181C] ring-1 ring-[#232326] px-2 py-1 text-[10px] text-white">
                  Copied!
                </span>
              )}
            </button>
            <button
              type="button"
              aria-label="More options"
              className="inline-flex items-center justify-center h-9 w-9 rounded-lg bg-[#18181C]/80 ring-1 ring-[#232326]/70 text-[#A1A1AA] hover:text-white hover:ring-[#3A3A3E] transition-all duration-200"
            >
              <svg viewBox="0 0 24 24" className="h-4 w-4" aria-hidden="true" {...iconProps}>
                <circle cx="12" cy="12" r="1" />
                <circle cx="19" cy="12" r="1" />
                <circle cx="5" cy="12" r="1" />
              </svg>
            </button>
          </div>
        </div>

        {task.description && (
          <p className="text-sm text-[#A1A1AA] mt-4 max-w-2xl">{task.description}</p>
        )}
        <p className="text-sm text-[#A1A1AA] mt-1">
          There are {compact(task.toolsCount)} AI tools for {task.title}.
        </p>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:flex lg:flex-wrap gap-4 sm:gap-x-10 sm:gap-y-4 mt-6">
          <Stat label="Number of tools" value={compact(task.toolsCount)} />
          <Stat label="Number of models" value={compact(task.modelsCount)} />
          <Stat label="Number of robots" value={compact(task.robotsCount)} />
          <Stat label="Number of devices" value={compact(task.devicesCount)} />
          {task.popular && (
            <div>
              <div className="text-xs text-[#71717A] mb-1.5">Most popular</div>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-[#18181C] ring-1 ring-[#232326]/70 px-3 py-1.5 text-sm text-white">
                {task.popular.logoUrl && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={task.popular.logoUrl} alt="" className="h-4 w-4 rounded" />
                )}
                {task.popular.name}
              </span>
            </div>
          )}
        </div>

        {pills.length > 0 && (
          <div className="flex flex-wrap items-center gap-2 mt-6 pt-6 border-t border-[#232326]/60">
            <button
              type="button"
              onClick={() => setSelectedPill(null)}
              className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold transition-all duration-150 ${selectedPill === null ? "bg-white text-black" : "bg-[#18181C] ring-1 ring-[#232326]/70 text-[#D4D4D8] hover:text-white hover:ring-[#3A3A3E]"}`}
            >
              All
              <span className={selectedPill === null ? "text-black/60" : "text-[#71717A]"}>{task.tools.length}</span>
            </button>
            {visiblePills.map((p) => {
              const selected = selectedPill === p.label;
              return (
                <button
                  key={p.label}
                  type="button"
                  onClick={() => setSelectedPill(selected ? null : p.label)}
                  className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold transition-all duration-150 ${selected ? "bg-white text-black" : "bg-[#18181C] ring-1 ring-[#232326]/70 text-[#D4D4D8] hover:text-white hover:ring-[#3A3A3E]"}`}
                >
                  {p.label}
                  <span className={selected ? "text-black/60" : "text-[#71717A]"}>{p.count}</span>
                </button>
              );
            })}
            {hiddenPillCount > 0 && (
              <button
                type="button"
                onClick={() => setShowAllPills(true)}
                className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold bg-[#18181C] ring-1 ring-[#232326]/70 text-[#A78BFA] hover:text-white hover:ring-[#3A3A3E] transition-all duration-150"
              >
                +{hiddenPillCount} more
              </button>
            )}
            {showAllPills && pills.length > 6 && (
              <button
                type="button"
                onClick={() => setShowAllPills(false)}
                className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold bg-[#18181C] ring-1 ring-[#232326]/70 text-[#A78BFA] hover:text-white hover:ring-[#3A3A3E] transition-all duration-150"
              >
                Show less
              </button>
            )}
          </div>
        )}
      </div>

      {task.tools.length > 0 ? (
        <div className="mb-6">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-base font-bold text-white">
              Tools <span className="font-normal text-[#71717A]">({task.tools.length})</span>
            </h2>
          </div>
          <div className="overflow-x-auto rounded-lg border border-[#232326]/60 [&::-webkit-scrollbar]:h-1.5 [&::-webkit-scrollbar-track]:bg-[#131316] [&::-webkit-scrollbar-thumb]:bg-[#6E56CF]/40 [&::-webkit-scrollbar-thumb]:rounded-full">
            <div className={`relative bg-[#000000] ${GRID_MIN}`}>
              <div className="border-b border-[#232326]/60 bg-[#131316]">
                <div className={`grid ${GRID_COLS} ${GRID_MIN} items-center gap-3 py-3`}>
                  <div className="h-full pl-4" />
                  <div className={TH}>TOOL</div>
                  <div className={TH}>TASK</div>
                  <div className={TH}>PRICING</div>
                  <div className={TH}>API</div>
                  <div className={TH}>OPEN-SOURCE</div>
                  <div className={TH}>COMPATIBILITY</div>
                  <div className={TH}>RELEASED</div>
                  <div className={TH}>SHARE</div>
                  <div className={TH}>SAVE</div>
                  <div className={`${TH} pr-4`}>CMP</div>
                </div>
              </div>
              <div role="list" className="flex flex-col">
                {task.tools.map((tool) => {
                  const amount = formatAmount(tool.pricingAmount);
                  return (
                    <div key={tool.slug} role="listitem" className={`group grid ${GRID_COLS} ${GRID_MIN} items-center gap-3 border-b border-[#232326]/60 py-3 transition-all duration-200 hover:bg-[#18181C]`}>
                      <div className="flex h-full items-center pl-4">
                        <div className="flex h-8 w-8 md:h-11 md:w-11 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-[#232326]/60 bg-white transition-colors group-hover:border-[#6E56CF]">
                          {tool.logoUrl ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={tool.logoUrl} alt={tool.name} className="h-6 w-6 md:h-8 md:w-8 object-contain" />
                          ) : (
                            <span className="text-[10px] md:text-xs font-bold text-neutral-900">{tool.name.charAt(0)}</span>
                          )}
                        </div>
                      </div>
                      <Link href={`/tools/${tool.slug}`} className="min-w-0 flex flex-col justify-center pr-4 md:pr-0">
                        <div className="flex items-center gap-1.5 min-w-0">
                          <h3 className="truncate text-[11.5px] md:text-[13px] font-semibold leading-tight text-white transition-colors duration-200 group-hover:text-[#6E56CF]">
                            {tool.name}
                          </h3>
                          <svg viewBox="0 0 24 24" width={13} height={13} className="hidden md:inline-flex shrink-0 text-[#71717A]" aria-hidden="true" {...iconProps}>
                            <path d="M15 3h6v6" />
                            <path d="M10 14 21 3" />
                            <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                          </svg>
                        </div>
                        {tool.tagline && (
                          <p className="mt-0.5 hidden md:block truncate text-[11px] leading-snug text-[#A1A1AA]">{tool.tagline}</p>
                        )}
                      </Link>
                      <div className="min-w-0">
                        <span title={task.title} className="inline-flex max-w-full items-center rounded-full border border-[#232326]/60 bg-[#18181C] px-2 py-0.5 text-[10px] font-mono font-semibold leading-tight text-[#A1A1AA] whitespace-normal break-words">
                          {task.title}
                        </span>
                      </div>
                      <div className="min-w-0">
                        {tool.pricingModel ? (
                          <span className="inline-flex items-center rounded-full border border-[#232326]/60 bg-[#18181C] px-2 py-0.5 text-[10px] font-mono font-semibold text-[#A1A1AA] whitespace-nowrap">
                            {tool.pricingModel}
                            {amount !== null && ` $${amount}`}
                            {tool.billingFrequency && `/${tool.billingFrequency}`}
                          </span>
                        ) : (
                          <span className="text-[11px] text-[#71717A] font-mono">—</span>
                        )}
                      </div>
                      <div><YesNo value={tool.hasApi} trueLabel="YES" falseLabel="NO" /></div>
                      <div><YesNo value={tool.isOpenSource} trueLabel="YES" falseLabel="NO" /></div>
                      <div className="min-w-0">
                        {tool.compatibility ? (
                          <span title={tool.compatibility} className="block truncate text-[11px] text-[#A1A1AA]">{tool.compatibility}</span>
                        ) : (
                          <span className="text-[11px] text-[#71717A] font-mono">—</span>
                        )}
                      </div>
                      <div className="text-[10px] font-mono text-[#A1A1AA]">{formatRelease(tool.releaseDate)}</div>
                      <div onClick={(e) => e.preventDefault()}>
                        <button
                          type="button"
                          onClick={() => shareTool(tool.slug, tool.name, tool.tagline)}
                          aria-label={`Share ${tool.name}`}
                          className={`inline-flex items-center justify-center rounded-md border p-1.5 transition-colors ${shared ? "border-[#6E56CF] text-[#6E56CF]" : "border-[#232326]/60 bg-[#18181C] text-[#A1A1AA] hover:border-[#3a3a3d] hover:text-white"}`}
                        >
                          <svg viewBox="0 0 24 24" width={14} height={14} aria-hidden="true" {...iconProps}>
                            <circle cx="18" cy="5" r="3" />
                            <circle cx="6" cy="12" r="3" />
                            <circle cx="18" cy="19" r="3" />
                            <path d="m8.59 13.51 6.83 3.98" />
                            <path d="m15.41 6.51-6.83 3.98" />
                          </svg>
                        </button>
                      </div>
                      <div>
                        <button
                          type="button"
                          aria-label={`Save ${tool.name}`}
                          className="inline-flex items-center justify-center rounded-md border border-[#232326]/60 bg-[#18181C] p-1.5 text-[#A1A1AA] transition-colors hover:border-[#3a3a3d] hover:text-white"
                        >
                          <svg viewBox="0 0 24 24" width={14} height={14} aria-hidden="true" {...iconProps}>
                            <path d="M19 21l-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
                          </svg>
                        </button>
                      </div>
                      <div className="pr-4">
                        <Link
                          href={`/tools/${tool.slug}`}
                          aria-label={`Compare ${tool.name}`}
                          className="inline-flex items-center justify-center rounded-md border border-[#232326]/60 bg-[#18181C] p-1.5 text-[#A1A1AA] transition-colors hover:border-[#3a3a3d] hover:text-white"
                        >
                          <svg viewBox="0 0 24 24" width={14} height={14} aria-hidden="true" {...iconProps}>
                            <path d="M8 3 4 7l4 4" />
                            <path d="M4 7h16" />
                            <path d="m16 21 4-4-4-4" />
                            <path d="M20 17H4" />
                          </svg>
                        </Link>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="mb-6">
          <div className="w-full rounded-xl bg-[#0B0B0E] p-8 text-center text-sm text-[#71717A] ring-1 ring-[#232326]/60">
            No tools available for this task.
          </div>
        </div>
      )}
    </div>
  );
}
