// Shared metadata for cross-resource search (client-safe, no Prisma).
// Detail routes mirror our listing pages; plural labels feed the type chips.

export type SearchEntityType =
  | "tools"
  | "companies"
  | "models"
  | "devices"
  | "robots"
  | "repositories"
  | "videos"
  | "agents"
  | "news"
  | "mcp";

export type SearchSuggestion = {
  id: string;
  type: SearchEntityType | string;
  title: string;
  category: string | null;
  slug: string;
  logoUrl: string | null;
};

export const ENTITY_META: Record<string, { plural: string; tint: string; glyph: string }> = {
  tools: { plural: "Tools", tint: "bg-[#6E56CF]/15 text-[#A78BFA]", glyph: "T" },
  companies: { plural: "Companies", tint: "bg-blue-500/15 text-blue-400", glyph: "C" },
  models: { plural: "Models", tint: "bg-emerald-400/15 text-emerald-400", glyph: "M" },
  devices: { plural: "Devices", tint: "bg-orange-500/15 text-orange-400", glyph: "D" },
  robots: { plural: "Robots", tint: "bg-amber-400/15 text-amber-400", glyph: "R" },
  repositories: { plural: "Repositories", tint: "bg-zinc-500/15 text-zinc-300", glyph: "G" },
  videos: { plural: "Videos", tint: "bg-rose-500/15 text-rose-400", glyph: "V" },
  agents: { plural: "Agents", tint: "bg-teal-400/15 text-teal-300", glyph: "A" },
  news: { plural: "News", tint: "bg-yellow-400/15 text-yellow-300", glyph: "N" },
  mcp: { plural: "MCP", tint: "bg-cyan-400/15 text-cyan-300", glyph: "P" },
};

export const ALL_ENTITY_TYPES = Object.keys(ENTITY_META);

export function detailPath(s: Pick<SearchSuggestion, "type" | "slug">): string {
  const t = ENTITY_META[s.type] ? s.type : "tools";
  return `/${t}/${s.slug}`;
}

const RECENT_KEY = "aiorbit-recent-searches";
const RECENT_MAX = 8;

export function loadRecent(): string[] {
  try {
    const raw = window.localStorage.getItem(RECENT_KEY);
    const arr = raw ? JSON.parse(raw) : [];
    return Array.isArray(arr) ? arr.filter((x) => typeof x === "string").slice(0, RECENT_MAX) : [];
  } catch {
    return [];
  }
}

export function addRecent(term: string): string[] {
  const t = term.trim();
  if (!t) return loadRecent();
  const next = [t, ...loadRecent().filter((x) => x.toLowerCase() !== t.toLowerCase())].slice(0, RECENT_MAX);
  try {
    window.localStorage.setItem(RECENT_KEY, JSON.stringify(next));
  } catch {
    /* storage unavailable */
  }
  return next;
}

export function clearRecent(): void {
  try {
    window.localStorage.removeItem(RECENT_KEY);
  } catch {
    /* storage unavailable */
  }
}
