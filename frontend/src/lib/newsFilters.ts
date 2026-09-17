// News category filtering + sorting — replica of the reference UI's logic.
// Pills send SLUGS; each pill matches keyword sets against a haystack of
// category + topics + filters + headline + (dek || aiSummary), all lowercased.

export const NEWS_PILLS: { label: string; key: string }[] = [
  { label: "All", key: "all" },
  { label: "AI Industry", key: "ai-industry" },
  { label: "Product Launches", key: "product-launches" },
  { label: "Innovations", key: "innovations" },
  { label: "Company Updates", key: "company-updates" },
  { label: "Open Source", key: "open-source" },
  { label: "Regulations", key: "regulations" },
  { label: "Interviews", key: "interviews" },
  { label: "Market Trends", key: "market-trends" },
  { label: "Breakthroughs", key: "breakthroughs" },
  { label: "Security", key: "security" },
  { label: "Agents", key: "agents" },
  { label: "LLMs", key: "llms" },
  { label: "Technology", key: "technology" },
];

export function newsPillKey(label: string): string {
  return NEWS_PILLS.find((p) => p.label === label)?.key ?? label;
}

export function isNewsKey(key: string): boolean {
  if (!key || key === "all") return true;
  return NEWS_PILLS.some((p) => p.key === key);
}

export type NewsLike = {
  category?: string | null;
  headline?: string | null;
  dek?: string | null;
  aiSummary?: string | null;
  topics?: unknown;
  filters?: unknown;
  hours?: number | null;
};

const strArr = (v: unknown): string[] => (Array.isArray(v) ? v.map(String) : []);

// Exact replica of the reference matcher. Unknown key → word-split fallback.
export function matchesNewsCategory(a: NewsLike, key: string): boolean {
  if (!key || key === "all") return true;
  if (key === "trending") return (a.hours ?? Infinity) <= 48;
  const k = key.toLowerCase();
  const words = k.split(/[-_\s]+/).filter(Boolean);
  const hay = [
    a.category ?? "",
    strArr(a.topics).join(" "),
    strArr(a.filters).join(" "),
    a.headline ?? "",
    a.dek || a.aiSummary || "",
  ]
    .join(" ")
    .toLowerCase();
  switch (k) {
    case "ai-industry":
      return ["industry", "market", "enterprise", "business", "company"].some((w) => hay.includes(w));
    case "product-launches":
      return ["product", "launch", "release", "announc", "introduce"].some((w) => hay.includes(w));
    case "innovations":
      return ["innovat", "new", "feature", "capability", "advance"].some((w) => hay.includes(w));
    case "company-updates":
      return ["company", "corporate", "google", "openai", "microsoft", "meta", "anthropic"].some((w) => hay.includes(w));
    case "open-source":
      return ["open source", "open-source", "github", "weights", "hugging"].some((w) => hay.includes(w));
    case "regulations":
      return ["regulation", "policy", "law", "gov", "legal", "safety", "eu"].some((w) => hay.includes(w));
    case "interviews":
      return ["interview", "podcast", "talk", "q&a", "ceo", "founder"].some((w) => hay.includes(w));
    case "market-trends":
      return ["trend", "market", "report", "growth", "investment", "funding"].some((w) => hay.includes(w));
    case "breakthroughs":
      return ["breakthrough", "benchmark", "state-of-the-art", "sota", "research", "paper"].some((w) => hay.includes(w));
    case "security":
      return ["security", "vulnerability", "privacy", "hack", "safety", "risk"].some((w) => hay.includes(w));
    case "agents":
      return ["agent", "autonomous", "action", "workflow"].some((w) => hay.includes(w));
    case "llms":
      return ["llm", "language model", "gpt", "claude", "gemini", "llama"].some((w) => hay.includes(w));
    case "technology":
      return ["tech", "model", "compute", "chip", "gpu", "infra"].some((w) => hay.includes(w));
    default:
      return words.some((w) => hay.includes(w));
  }
}

export type NewsSort = "newest" | "oldest" | "rating" | "name-asc" | "name-desc";

// Reference sort semantics: hours = article age (smaller = newer).
export function sortNews<T extends { hours?: number | null; headline?: string | null; up?: number | null; score?: number | null }>(
  rows: T[],
  sort: string | undefined
): T[] {
  const r = rows.slice();
  switch (sort) {
    case "oldest":
      return r.sort((a, b) => (b.hours ?? 0) - (a.hours ?? 0));
    case "rating":
      return r.sort((a, b) => (b.up ?? b.score ?? 0) - (a.up ?? a.score ?? 0));
    case "name-asc":
      return r.sort((a, b) => (a.headline ?? "").localeCompare(b.headline ?? ""));
    case "name-desc":
      return r.sort((a, b) => (b.headline ?? "").localeCompare(a.headline ?? ""));
    case "newest":
    default:
      return r.sort((a, b) => (a.hours ?? 0) - (b.hours ?? 0));
  }
}

// Live search semantics: headline / dek / aiSummary / topics / publisher name.
export function matchesNewsQuery(
  a: NewsLike & { publisherName?: string | null },
  q: string
): boolean {
  const needle = q.trim().toLowerCase();
  if (!needle) return true;
  return (
    (a.headline ?? "").toLowerCase().includes(needle) ||
    (a.dek ?? "").toLowerCase().includes(needle) ||
    (a.aiSummary ?? "").toLowerCase().includes(needle) ||
    strArr(a.topics).some((t) => t.toLowerCase().includes(needle)) ||
    (a.publisherName ?? "").toLowerCase().includes(needle)
  );
}

// "464" hours → "19d ago"; <24 → "Xh ago".
export function formatPosted(hours: number | null | undefined): string {
  const h = hours ?? 0;
  if (h < 1) return "just now";
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  if (d < 30) return `${d}d ago`;
  const m = Math.floor(d / 30);
  if (m < 12) return `${m}mo ago`;
  return `${Math.floor(m / 12)}y ago`;
}
