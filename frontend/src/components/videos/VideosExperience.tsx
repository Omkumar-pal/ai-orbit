"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import ProfessionalPagination from "@/components/directory/ProfessionalPagination";
import VideosTable, { type VideoRow, type VideoSortKey } from "./VideosTable";
import VideoDialog from "./VideoDialog";
import { VIDEO_PILLS } from "@/lib/videoFilters";

type ApiResult = {
  videos: any[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
};

function toRow(v: any): VideoRow {
  return {
    id: v.id,
    slug: v.slug,
    title: v.title,
    youtubeId: v.youtubeId,
    thumbnail: v.thumbnail ?? null,
    durationSeconds: v.durationSeconds ?? 0,
    views: v.views ?? 0,
    publishedAt: v.publishedAt ? new Date(v.publishedAt).toISOString() : null,
    toolCategory: v.toolCategory ?? null,
    channelId: v.channelId ?? null,
    authorName: v.authorName ?? null,
    accent: v.accent ?? null,
  };
}

function listingUrl(category: string, page: number): string {
  const s = new URLSearchParams();
  if (category) s.set("category", category);
  if (page > 1) s.set("page", String(page));
  const q = s.toString();
  return `/videos${q ? `?${q}` : ""}`;
}

export default function VideosExperience({
  initialVideos,
  initialTotal,
  pageSize = 100,
  defaultCategory = "",
  initialQuery = "",
  initialSelected = null,
}: {
  initialVideos: any[];
  initialTotal: number;
  pageSize?: number;
  defaultCategory?: string;
  initialQuery?: string;
  initialSelected?: any | null;
}) {
  const [query, setQuery] = useState(initialQuery);
  const [category, setCategory] = useState(defaultCategory);
  const [page, setPage] = useState(1);
  const [size, setSize] = useState(pageSize);
  const [sortBy, setSortBy] = useState<VideoSortKey>("posted");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");
  const [videos, setVideos] = useState<VideoRow[]>(initialVideos.map(toRow));
  const [total, setTotal] = useState(initialTotal);
  const [totalPages, setTotalPages] = useState(() => Math.max(1, Math.ceil(initialTotal / pageSize)));
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState<VideoRow | null>(
    initialSelected ? toRow(initialSelected) : null
  );
  const firstRun = useRef(true);

  const load = useCallback(
    async (opts: { category: string; page: number; pageSize: number; q: string; sort: VideoSortKey; dir: "asc" | "desc" }) => {
      setLoading(true);
      try {
        const params = new URLSearchParams({
          page: String(opts.page),
          pageSize: String(opts.pageSize),
          sort: opts.sort,
          dir: opts.dir,
        });
        if (opts.category) params.set("category", opts.category);
        if (opts.q) params.set("q", opts.q);
        const res = await fetch(`/api/v1/videos?${params.toString()}`);
        if (!res.ok) throw new Error(String(res.status));
        const json: ApiResult = await res.json();
        setVideos((json.videos ?? []).map(toRow));
        setTotal(json.total ?? 0);
        setTotalPages(Math.max(1, json.totalPages ?? 1));
      } catch {
        setVideos([]);
        setTotal(0);
        setTotalPages(1);
      } finally {
        setLoading(false);
      }
    },
    [pageSize]
  );

  // Refetch on filter/sort/page change (skip the SSR-hydrated first run).
  useEffect(() => {
    if (firstRun.current) {
      firstRun.current = false;
      return;
    }
    load({ category, page, pageSize: size, q: query, sort: sortBy, dir: sortDir });
  }, [category, page, size, query, sortBy, sortDir, load]);

  // Debounced search input.
  const [draft, setDraft] = useState(initialQuery);
  useEffect(() => {
    const t = setTimeout(() => {
      setQuery(draft);
      setPage(1);
    }, 350);
    return () => clearTimeout(t);
  }, [draft]);

  const choose = (slug: string) => {
    setCategory(slug);
    setPage(1);
    window.history.pushState(null, "", listingUrl(slug, 1));
  };

  const changePage = (p: number) => {
    setPage(p);
    window.history.pushState(null, "", listingUrl(category, p));
  };

  const changeSort = (key: VideoSortKey) => {
    if (key === sortBy) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortBy(key);
      setSortDir(key === "name" ? "asc" : "desc");
    }
    setPage(1);
  };

  const openVideo = (v: VideoRow) => {
    setSelected(v);
    window.history.pushState(null, "", `/videos/${v.slug}`);
  };

  const closeDialog = () => {
    setSelected(null);
    window.history.pushState(null, "", listingUrl(category, page));
  };

  return (
    <section className="directory-page">
      <div className="directory-heading">
        <p className="eyebrow">DIRECTORY</p>
        <h1>AI Videos</h1>
        <p>Watch AI tutorials, demos, and talks from across the ecosystem.</p>
      </div>
      <div className="directory-controls">
        <div className="category-scroll" aria-label="Video categories">
          {VIDEO_PILLS.map((pill) => (
            <button
              key={pill.slug}
              onClick={() => choose(pill.slug)}
              className={(category || "") === pill.slug ? "category active" : "category"}
            >
              {pill.label}
            </button>
          ))}
        </div>
        <label className="directory-search">
          <span>⌕</span>
          <input
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            placeholder="Search videos..."
          />
        </label>
      </div>
      <div className="directory-table-wrap" style={{ border: 0, background: "transparent" }}>
        {videos.length === 0 && !loading ? (
          <div className="empty-results">
            <strong>No videos match your filters</strong>
            <span>Try a different search term or clear a filter.</span>
          </div>
        ) : (
          <div style={{ opacity: loading ? 0.55 : 1, transition: "opacity .15s" }}>
            <VideosTable
              videos={videos}
              sortBy={sortBy}
              sortDir={sortDir}
              onSortChange={changeSort}
              onVideoSelect={openVideo}
            />
          </div>
        )}
      </div>
      <ProfessionalPagination
        page={page}
        totalPages={totalPages}
        totalCount={total}
        pageSize={size}
        pageSizeOptions={[25, 50, 100, 200]}
        onPageChange={changePage}
        onPageSizeChange={(s) => {
          setSize(s);
          setPage(1);
        }}
        label="videos"
      />
      {selected && <VideoDialog video={selected} onClose={closeDialog} />}
    </section>
  );
}
