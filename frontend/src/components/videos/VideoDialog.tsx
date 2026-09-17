"use client";

import VideoPlayer from "./VideoPlayer";
import { channelUrl } from "@/lib/videoFilters";
import type { VideoRow } from "./VideosTable";

export default function VideoDialog({ video, onClose }: { video: VideoRow; onClose: () => void }) {
  return (
    <div
      className="fixed inset-0 z-[80] flex items-center justify-center bg-black/85 p-3 sm:p-6"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={video.title}
    >
      <div
        className="relative w-full max-w-4xl overflow-hidden rounded-2xl border border-[#232326] bg-[#0d0d10] shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Close video"
          className="absolute top-3 right-3 z-20 flex h-9 w-9 cursor-pointer items-center justify-center rounded-full bg-black/60 text-white/80 backdrop-blur transition-all hover:bg-white/20 hover:text-white active:scale-95"
        >
          <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden="true">
            <path d="M4 4l8 8M12 4l-8 8" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
          </svg>
        </button>
        <div className="px-2 pt-10 sm:px-5 sm:pt-12">
          <h2 className="mb-3 truncate px-1 text-base font-bold text-white sm:text-lg">{video.title}</h2>
          <div className="relative w-full" style={{ aspectRatio: "16 / 9" }}>
            <VideoPlayer youtubeId={video.youtubeId} title={video.title} thumbnail={video.thumbnail} />
          </div>
        </div>
        <div className="flex h-12 shrink-0 items-center justify-between gap-4 px-4 sm:h-14 sm:px-6">
          <a
            href={channelUrl(video.channelId, video.authorName)}
            target="_blank"
            rel="noopener noreferrer"
            className="group flex shrink-0 items-center gap-1.5 rounded-full py-1 pr-2 pl-1 text-[12px] text-white/70 transition-colors hover:bg-white/5 hover:text-white sm:text-[13px]"
            style={{ maxWidth: "60%" }}
          >
            <span className="truncate">{video.authorName || "Channel"}</span>
            <svg width="13" height="13" viewBox="0 0 16 16" fill="none" style={{ flexShrink: 0, display: "block" }} className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" aria-hidden="true">
              <path d="M4 12L12 4M12 4H5.5M12 4V10.5" stroke="#ffffff" strokeOpacity="0.6" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </a>
          {video.toolCategory && (
            <span className="shrink-0 rounded-full border border-white/[0.08] px-2.5 py-0.5 font-mono text-[11px] tracking-[0.06em] text-white/50 uppercase sm:text-[12px]">
              {video.toolCategory}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
