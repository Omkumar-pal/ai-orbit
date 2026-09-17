"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  videoLevel,
  VIDEO_LEVEL_STYLES,
  formatDuration,
  formatPosted,
  channelUrl,
} from "@/lib/videoFilters";

export type VideoRow = {
  id: string;
  slug: string;
  title: string;
  youtubeId: string;
  thumbnail: string | null;
  durationSeconds: number;
  views: number;
  publishedAt: string | null;
  toolCategory: string | null;
  channelId: string | null;
  authorName: string | null;
  accent: string | null;
};

export type VideoSortKey = "name" | "posted" | "duration" | "views" | "level";

function SaveButton({ id, accent }: { id: string; accent: string | null }) {
  const key = `aiorbit_video_saved_${id}`;
  const [saved, setSaved] = useState(false);
  useEffect(() => {
    try {
      setSaved(window.localStorage.getItem(key) === "1");
    } catch {
      /* storage unavailable */
    }
  }, [key]);
  return (
    <button
      type="button"
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        const next = !saved;
        setSaved(next);
        try {
          if (next) window.localStorage.setItem(key, "1");
          else window.localStorage.removeItem(key);
        } catch {
          /* storage unavailable */
        }
      }}
      aria-pressed={saved}
      aria-label={saved ? "Remove from saved videos" : "Save video"}
      title={saved ? "Saved" : "Save"}
      style={saved && accent ? { borderColor: "transparent", color: "#000", background: accent } : undefined}
      className={`inline-flex items-center justify-center rounded-md border p-1.5 transition-colors ${saved ? "border-transparent bg-white text-black" : "border-[#232326]/60 bg-[#18181C] text-[#A1A1AA] hover:border-white/20 hover:text-white"}`}
    >
      <svg width="12" height="12" viewBox="0 0 24 24" fill={saved ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M19 21l-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
      </svg>
    </button>
  );
}

function ShareButton({ slug, title }: { slug: string; title: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      type="button"
      onClick={async (e) => {
        e.preventDefault();
        e.stopPropagation();
        const url = `${window.location.origin}/videos/${slug}`;
        try {
          if (navigator.share) {
            await navigator.share({ title, text: title, url });
            return;
          }
        } catch {
          return;
        }
        try {
          await navigator.clipboard.writeText(url);
        } catch {
          /* unavailable */
        }
        setCopied(true);
        setTimeout(() => setCopied(false), 1400);
      }}
      aria-label={copied ? "Link copied" : "Share"}
      title={copied ? "Link copied" : "Share"}
      className="inline-flex items-center justify-center rounded-md border border-[#232326]/60 bg-[#18181C] p-1.5 text-[#A1A1AA] transition-colors hover:border-white/20 hover:text-white"
    >
      {copied ? (
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M20 6 9 17l-5-5" />
        </svg>
      ) : (
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <circle cx="18" cy="5" r="3" />
          <circle cx="6" cy="12" r="3" />
          <circle cx="18" cy="19" r="3" />
          <path d="m8.59 13.51 6.83 3.98" />
          <path d="m15.41 6.51-6.83 3.98" />
        </svg>
      )}
    </button>
  );
}

function SortIcon({ active, dir }: { active: boolean; dir: "asc" | "desc" }) {
  if (!active) {
    return (
      <svg width="12" height="12" viewBox="0 0 16 16" fill="none" className="shrink-0 opacity-50" aria-hidden="true">
        <path d="M4.5 6.5 8 3l3.5 3.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M4.5 9.5 8 13l3.5-3.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    );
  }
  return (
    <svg width="12" height="12" viewBox="0 0 16 16" fill="none" className={`shrink-0 transition-transform ${dir === "asc" ? "" : "rotate-180"}`} aria-hidden="true">
      <path d="M4.5 9.5 8 6l3.5 3.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export default function VideosTable({
  videos,
  sortBy,
  sortDir,
  onSortChange,
  onVideoSelect,
}: {
  videos: VideoRow[];
  sortBy: VideoSortKey;
  sortDir: "asc" | "desc";
  onSortChange: (key: VideoSortKey) => void;
  onVideoSelect: (video: VideoRow) => void;
}) {
  const toggleSort = (key: VideoSortKey) => onSortChange(key);

  const open = (v: VideoRow) => (e: React.MouseEvent) => {
    const t = e.target as HTMLElement;
    if (t?.closest("a[target='_blank'], button, [role='button']")) return;
    if (e.ctrlKey || e.metaKey || e.shiftKey) return;
    e.preventDefault();
    onVideoSelect(v);
  };

  const headers: { key: VideoSortKey; label: string; right?: boolean }[] = [
    { key: "name", label: "Name" },
    { key: "posted", label: "Posted" },
    { key: "duration", label: "Duration" },
    { key: "views", label: "Views", right: true },
  ];

  return (
    <div>
      {/* Mobile sort pills */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-2 scrollbar-none sm:hidden">
        {headers.map((h) => {
          const active = sortBy === h.key;
          return (
            <button
              key={h.key}
              onClick={() => toggleSort(h.key)}
              className={`inline-flex shrink-0 items-center gap-1 rounded-full border px-3 py-1 font-mono text-[9.5px] font-medium transition-colors ${active ? "border-[#6E56CF]/60 bg-[#6E56CF]/10 text-[#A78BFA]" : "border-[#232326] text-[#A1A1AA]"}`}
            >
              {h.label}
              {active && <SortIcon active dir={sortDir} />}
            </button>
          );
        })}
      </div>

      {/* Mobile compact table */}
      <div className="sm:hidden">
        <table className="w-full table-fixed border-collapse">
          <colgroup>
            <col />
            <col className="w-[92px]" />
          </colgroup>
          <thead>
            <tr className="border-b border-white/[0.05]">
              <th className="py-2 pr-2 pl-0 text-left font-mono text-[11.5px] font-semibold tracking-[0.08em] text-[#71717A] uppercase">Name</th>
              <th className="py-2 pr-0 pl-2 text-right font-mono text-[11.5px] font-semibold tracking-[0.08em] text-[#71717A] uppercase">Posted</th>
            </tr>
          </thead>
          <tbody>
            {videos.map((v) => (
              <tr key={v.id} className="border-b border-white/[0.04]" onClick={open(v)}>
                <td className="py-2.5 pr-2">
                  <div className="flex min-w-0 items-center gap-2.5">
                    {v.thumbnail ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={v.thumbnail} alt="" className="h-[46px] w-[80px] shrink-0 rounded-md object-cover" loading="lazy" />
                    ) : (
                      <div className="h-[46px] w-[80px] shrink-0 rounded-md bg-[#18181c]" />
                    )}
                    <div className="flex min-w-0 flex-1 flex-col gap-1.5">
                      <span className="truncate text-[13px] font-medium text-white">{v.title}</span>
                      <span className="font-mono text-[11px] text-[#71717A]">{formatDuration(v.durationSeconds)}</span>
                    </div>
                  </div>
                </td>
                <td className="py-2.5 pl-2 text-right font-mono text-[12px] text-[#A1A1AA]">{formatPosted(v.publishedAt)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Desktop table */}
      <div className="hidden w-full max-w-full overflow-x-auto overflow-y-hidden sm:block">
        <table className="w-full min-w-[760px] table-fixed border-collapse">
          <colgroup>
            <col className="w-[34%]" />
            <col className="w-[100px]" />
            <col className="w-[90px]" />
            <col className="w-[90px]" />
            <col className="w-[110px]" />
            <col className="w-[120px]" />
            <col className="w-[140px]" />
            <col className="w-20" />
          </colgroup>
          <thead>
            <tr className="border-b border-white/[0.05]">
              {headers.map((h) => (
                <th
                  key={h.key}
                  className={`px-4 py-[9.6px] font-mono text-[12.5px] font-semibold tracking-[0.08em] text-[#71717A] uppercase select-none ${h.right ? "text-right" : "text-left"} ${h.key === "name" ? "pl-4" : ""}`}
                >
                  <button onClick={() => toggleSort(h.key)} className={`inline-flex items-center gap-1.5 transition-colors hover:text-white ${sortBy === h.key ? "text-white" : ""}`}>
                    {h.label}
                    <SortIcon active={sortBy === h.key} dir={sortBy === h.key ? sortDir : "asc"} />
                  </button>
                </th>
              ))}
              <th className="px-4 py-[9.6px] text-left font-mono text-[12.5px] font-semibold tracking-[0.08em] text-[#71717A] uppercase select-none">
                Level
              </th>
              <th className="px-4 py-[9.6px] text-left font-mono text-[12.5px] font-semibold tracking-[0.08em] text-[#71717A] uppercase">Category</th>
              <th className="px-4 py-[9.6px] text-left font-mono text-[12.5px] font-semibold tracking-[0.08em] text-[#71717A] uppercase">Channel</th>
              <th className="px-4 py-[9.6px]" aria-hidden="true" />
            </tr>
          </thead>
          <tbody>
            {videos.map((v) => {
              const level = videoLevel(v.id);
              return (
                <tr
                  key={v.id}
                  onClick={open(v)}
                  className="group relative cursor-pointer border-b border-white/[0.03] transition-all duration-200 ease-out hover:-translate-y-[1px] hover:bg-[#18181C] hover:shadow-[0_1px_2px_rgba(0,0,0,0.35),0_8px_24px_rgba(0,0,0,0.18)]"
                  style={{ "--row-accent": v.accent ?? "#6E56CF" } as React.CSSProperties}
                >
                  <td className="relative py-[9.6px] pr-4 pl-4">
                    <span className="absolute top-1/2 left-0 h-0 w-[3px] -translate-y-1/2 rounded-full bg-[var(--row-accent)] transition-all duration-200 group-hover:h-[70%]" />
                    <Link
                      href={`/videos/${v.slug}`}
                      onClick={(e) => {
                        if (e.ctrlKey || e.metaKey || e.shiftKey) return;
                        e.preventDefault();
                        onVideoSelect(v);
                      }}
                      className="flex items-center gap-3.5"
                    >
                      <span className="relative block h-[48px] w-[85px] shrink-0 overflow-hidden bg-[#18181C] transition-transform duration-300 ease-out group-hover:scale-[1.04] group-hover:shadow-[0_0_0_1.5px_var(--row-accent)]">
                        {v.thumbnail ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={v.thumbnail} alt="" className="h-full w-full object-cover" loading="lazy" />
                        ) : null}
                        <span className="pointer-events-none absolute inset-0 flex items-center justify-center opacity-0 transition-opacity duration-200 group-hover:opacity-100">
                          <span className="flex h-7 w-7 items-center justify-center rounded-full bg-white/95 shadow-md">
                            <svg width="11" height="11" viewBox="0 0 16 16" fill="#08090a" aria-hidden="true">
                              <path d="M3 1.7a.7.7 0 0 1 1.06-.6l10.6 6.3a.7.7 0 0 1 0 1.2L4.06 14.9A.7.7 0 0 1 3 14.3V1.7Z" />
                            </svg>
                          </span>
                        </span>
                        <span className="absolute right-1 bottom-1 z-10 flex items-center gap-1 rounded bg-black/75 px-1.5 py-[2px] text-[11px] font-medium text-white">
                          {formatDuration(v.durationSeconds)}
                        </span>
                      </span>
                      <span className="min-w-0">
                        <span className="block truncate text-[15px] leading-snug font-medium text-white transition-colors group-hover:text-[var(--row-accent)]">
                          {v.title}
                        </span>
                      </span>
                    </Link>
                  </td>
                  <td className="px-4 py-[9.6px] font-mono whitespace-nowrap text-[13.5px] text-[#A1A1AA]">{formatPosted(v.publishedAt)}</td>
                  <td className="px-4 py-[9.6px] font-mono whitespace-nowrap text-[13.5px] text-[#A1A1AA]">{formatDuration(v.durationSeconds)}</td>
                  <td className="px-4 py-[9.6px] text-right font-mono whitespace-nowrap text-[13.5px] text-[#A1A1AA]">{v.views.toLocaleString("en-US")}</td>
                  <td className="px-4 py-[9.6px] whitespace-nowrap">
                    <span className={`inline-flex items-center rounded-full px-2.5 py-1 font-mono text-[12px] font-semibold ${VIDEO_LEVEL_STYLES[level]}`}>
                      {level}
                    </span>
                  </td>
                  <td className="px-4 py-[9.6px] whitespace-nowrap">
                    {v.toolCategory && (
                      <span className="inline-flex items-center rounded-full border border-[#232326] px-2.5 py-1 font-mono text-[12px] font-medium text-[#A1A1AA]">
                        {v.toolCategory}
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-[9.6px]">
                    <a href={channelUrl(v.channelId, v.authorName)} target="_blank" rel="noopener noreferrer" className="group/channel inline-flex items-start gap-1.5">
                      <span className="line-clamp-2 text-[13.5px] leading-snug font-medium break-words whitespace-normal text-[#A1A1AA] transition-colors group-hover/channel:text-white">
                        {v.authorName || "Channel"}
                      </span>
                      <svg width="12" height="12" viewBox="0 0 16 16" fill="none" style={{ flexShrink: 0, display: "block" }} className="mt-0.5 text-[#A1A1AA] transition-all group-hover/channel:translate-x-0.5 group-hover/channel:-translate-y-0.5 group-hover/channel:text-white" aria-hidden="true">
                        <path d="M4 12L12 4M12 4H5.5M12 4V10.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </a>
                  </td>
                  <td className="px-4 py-[9.6px] whitespace-nowrap">
                    <div className="flex items-center justify-end gap-1.5">
                      <ShareButton slug={v.slug} title={v.title} />
                      <SaveButton id={v.id} accent={v.accent} />
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
