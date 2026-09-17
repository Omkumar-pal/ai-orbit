// Videos category filtering, level hash, and formatters — replica of the reference UI.
// Pill slugs filter server-side; raw toolCategory covers 5 of 16 pills, so the rest
// use explicit keyword sets over title + tags + description + toolName.

export const VIDEO_PILLS: { label: string; slug: string }[] = [
  { label: "All", slug: "" },
  { label: "General AI", slug: "general-ai" },
  { label: "LLMs", slug: "llm" },
  { label: "AI Agents", slug: "agents" },
  { label: "Multimodal AI", slug: "multimodal-ai" },
  { label: "Robotics", slug: "robotics" },
  { label: "Educational Content", slug: "educational-content" },
  { label: "Coding", slug: "coding" },
  { label: "Model Showcases", slug: "model-showcases" },
  { label: "Tutorials", slug: "tutorials" },
  { label: "Podcasts", slug: "podcasts" },
  { label: "AI Trends", slug: "ai-trends" },
  { label: "Comparisons", slug: "comparisons" },
  { label: "Prompting", slug: "prompting" },
  { label: "Product Demos", slug: "product-demos" },
  { label: "Case Studies", slug: "case-studies" },
];

export function videoPillSlug(label: string): string {
  return VIDEO_PILLS.find((p) => p.label === label)?.slug ?? label;
}

// Keyword sets for pills with no raw toolCategory value. Raw slugs match exactly.
const KEYWORDS: Record<string, string[]> = {
  "educational-content": ["tutorial", "learn", "course", "lesson", "education", "guide", "how to", "explained", "study"],
  coding: ["code", "coding", "programming", "developer", "software", "github", "python"],
  "model-showcases": ["gpt", "claude", "gemini", "llama", "model", "showcase", "demo", "review"],
  tutorials: ["tutorial", "how to", "guide", "course", "learn", "step by step"],
  podcasts: ["podcast", "interview", "talk", "conversation", "discussion"],
  "ai-trends": ["trend", "future", "news", "update", "2024", "2025", "2026", "prediction"],
  comparisons: [" vs ", "versus", "comparison", "compare", "better", "alternative"],
  prompting: ["prompt", "prompting", "prompt engineering"],
  "product-demos": ["demo", "showcase", "walkthrough", "overview", "first look", "launch"],
  "case-studies": ["case study", "results", "experiment", "test", "review", "breakdown"],
};

export type VideoLike = {
  toolCategory?: string | null;
  title?: string | null;
  description?: string | null;
  toolName?: string | null;
  tags?: unknown;
};

// Exact-match on raw slug first; otherwise keyword heuristic. "" (All) matches all.
export function matchesVideoCategory(v: VideoLike, slug: string): boolean {
  if (!slug) return true;
  const s = slug.toLowerCase();
  if ((v.toolCategory ?? "").toLowerCase() === s) return true;
  const keys = KEYWORDS[s];
  if (!keys) return false;
  const tags = Array.isArray(v.tags) ? v.tags.map(String).join(" ") : "";
  const hay = [v.title ?? "", v.description ?? "", v.toolName ?? "", tags].join(" ").toLowerCase();
  return keys.some((k) => hay.includes(k.toLowerCase()));
}

// Level is hash-derived from the video id — exact port of the reference:
// h = ["Beginner","Intermediate","Advanced","Expert"]; h[hash(id) % 4]
export const VIDEO_LEVELS = ["Beginner", "Intermediate", "Advanced", "Expert"] as const;
export type VideoLevel = (typeof VIDEO_LEVELS)[number];

export function videoLevel(id: string): VideoLevel {
  let t = 0;
  for (let s = 0; s < id.length; s++) t = ((31 * t + id.charCodeAt(s)) >>> 0);
  return VIDEO_LEVELS[t % VIDEO_LEVELS.length];
}

export const VIDEO_LEVEL_RANK: Record<VideoLevel, number> = {
  Beginner: 0,
  Intermediate: 1,
  Advanced: 2,
  Expert: 3,
};

export const VIDEO_LEVEL_STYLES: Record<VideoLevel, string> = {
  Beginner: "bg-emerald-400/10 text-emerald-400",
  Intermediate: "bg-[#6E56CF]/10 text-[#A78BFA]",
  Advanced: "bg-amber-400/10 text-amber-400",
  Expert: "bg-rose-400/10 text-rose-400",
};

export function formatDuration(totalSeconds: number | null | undefined): string {
  const t = Math.max(0, Math.floor(totalSeconds ?? 0));
  const h = Math.floor(t / 3600);
  const m = Math.floor((t % 3600) / 60);
  const s = t % 60;
  const mm = h > 0 ? String(m).padStart(2, "0") : String(m);
  return `${h > 0 ? `${h}:` : ""}${mm}:${String(s).padStart(2, "0")}`;
}

export function formatPosted(value: string | Date | null | undefined): string {
  if (!value) return "—";
  const d = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

export function channelUrl(channelId: string | null | undefined, name: string | null | undefined): string {
  if (channelId) return `https://www.youtube.com/channel/${channelId}`;
  if (name) return `https://www.youtube.com/results?search_query=${encodeURIComponent(name)}`;
  return "https://www.youtube.com";
}
