"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { ENTITY_META, detailPath, type SearchSuggestion } from "@/lib/searchMeta";

// Resource quick-links shown when the box is empty (reference: icon + label rows).
// Trending / Leaderboard deliberately excluded.
const RESOURCE_LINKS: { type: string; label: string; href: string }[] = [
  { type: "tools", label: "Tools", href: "/tools" },
  { type: "companies", label: "Companies", href: "/companies" },
  { type: "models", label: "Models", href: "/models" },
  { type: "devices", label: "Devices", href: "/devices" },
  { type: "robots", label: "Robots", href: "/robots" },
  { type: "repositories", label: "Repositories", href: "/repositories" },
  { type: "videos", label: "Videos", href: "/videos" },
  { type: "agents", label: "Agents", href: "/agents" },
  { type: "news", label: "News", href: "/news" },
  { type: "mcp", label: "MCP", href: "/mcp" },
  { type: "tasks", label: "Tasks", href: "/tasks" },
];

const GROUP_LIMIT = 5;

async function fetchSuggestions(q: string): Promise<SearchSuggestion[]> {
  const res = await fetch(`/api/v1/search/autocomplete?q=${encodeURIComponent(q)}`);
  if (!res.ok) throw new Error("Couldn't load suggestions.");
  const json = await res.json();
  return json.suggestions ?? [];
}

export default function SearchDropdown() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [debounced, setDebounced] = useState("");
  const [open, setOpen] = useState(false);
  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([]);
  const [activeType, setActiveType] = useState<string | null>(null);
  const [doneQuery, setDoneQuery] = useState("");
  const [error, setError] = useState<string | null>(null);
  const requestId = useRef(0);
  const boxRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // ⌘K / Ctrl+K focuses the search box from anywhere.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        inputRef.current?.focus();
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  // Outside click + Escape close the dropdown.
  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (boxRef.current && !boxRef.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open ]);

  // Debounced autocomplete with race guard — only the latest response renders.
  useEffect(() => {
    const t = setTimeout(() => setDebounced(query.trim()), 250);
    return () => clearTimeout(t);
  }, [query]);

  useEffect(() => {
    if (!debounced) return;
    const id = ++requestId.current;
    fetchSuggestions(debounced)
      .then((s) => {
        if (id !== requestId.current) return;
        setSuggestions(s);
        setError(null);
        setDoneQuery(debounced);
      })
      .catch(() => {
        if (id !== requestId.current) return;
        setError("Couldn't load suggestions.");
        setSuggestions([]);
        setDoneQuery(debounced);
      });
  }, [debounced]);

  const goSuggestion = (s: SearchSuggestion) => {
    setOpen(false);
    setQuery("");
    router.push(detailPath(s));
  };

  const goSeeAll = (q: string) => {
    const term = q.trim();
    if (!term) return;
    setOpen(false);
    setQuery("");
    router.push(`/tools?q=${encodeURIComponent(term)}`);
  };

  // Derived during render (never synced in an effect): an emptied query
  // shows the components list, never stale suggestions.
  const shownSuggestions = debounced ? suggestions : [];
  const showLoading = debounced.length > 0 && debounced !== doneQuery;
  const showError = debounced ? error : null;

  const groups = new Map<string, SearchSuggestion[]>();
  for (const s of shownSuggestions) {
    const list = groups.get(s.type) ?? [];
    list.push(s);
    groups.set(s.type, list);
  }
  const visibleTypes = activeType ? [activeType].filter((t) => groups.has(t)) : [...groups.keys()];
  const activeMeta = activeType ? (ENTITY_META[activeType] ?? { plural: activeType }) : null;

  return (
    <div ref={boxRef} className="relative mx-auto w-full max-w-[575px]">
      <form
        className="global-search"
        onSubmit={(e) => {
          e.preventDefault();
          if (debounced) goSeeAll(debounced);
          else if (query.trim()) goSeeAll(query);
        }}
      >
        <span>⌕</span>
        <input
          ref={inputRef}
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          placeholder="Search AI tools, models, companies..."
          aria-label="Search the AI ecosystem"
          aria-expanded={open}
          role="combobox"
          aria-autocomplete="list"
          aria-controls="global-search-listbox"
        />
        <kbd>⌘ K</kbd>
      </form>

      {open && (
        <div className="absolute top-full right-0 left-0 z-[80] mt-2 overflow-hidden rounded-2xl border border-[#232326] bg-[#101014] shadow-[0_24px_64px_rgba(0,0,0,0.65)]">
          <div className="max-h-[46vh] overflow-y-auto p-2.5" role="listbox" id="global-search-listbox">
            {showLoading ? (
              <div className="space-y-2 p-1.5" aria-label="Loading suggestions">
                {[0, 1, 2, 3].map((i) => (
                  <div key={i} className="h-9 w-full animate-pulse rounded-lg bg-[#18181C]" />
                ))}
              </div>
            ) : !debounced ? (
              <div>
                {RESOURCE_LINKS.map((r) => {
                  const meta = ENTITY_META[r.type] ?? { tint: "bg-zinc-500/15 text-zinc-300", glyph: "•" };
                  return (
                    <button
                      key={r.type}
                      onClick={() => {
                        setOpen(false);
                        setQuery("");
                        router.push(r.href);
                      }}
                      className="flex w-full cursor-pointer items-center gap-3.5 rounded-xl px-3.5 py-2.5 text-left transition-colors hover:bg-white/[0.05]"
                    >
                      <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-sm font-black ${meta.tint}`}>
                        {meta.glyph}
                      </span>
                      <span className="text-[15px] font-medium text-white">{r.label}</span>
                    </button>
                  );
                })}
              </div>
            ) : showError ? (
              <p className="p-6 text-center text-sm text-[#71717A]">{showError}</p>
            ) : shownSuggestions.length === 0 ? (
              <div className="p-6 text-center text-sm text-[#71717A]">
                No matches for “{debounced}”.{" "}
                <button onClick={() => goSeeAll(debounced)} className="cursor-pointer text-[#A78BFA] hover:text-white">
                  Search anyway
                </button>
              </div>
            ) : (
              <div>
                {activeMeta && (
                  <div className="mx-1 mb-1.5 flex items-center justify-between rounded-lg bg-white/[0.06] px-3 py-2">
                    <span className="text-[11px] font-bold tracking-[0.08em] text-[#A1A1AA] uppercase">
                      {activeMeta.plural} only
                    </span>
                    <button
                      onClick={() => setActiveType(null)}
                      aria-label="Show all types"
                      className="cursor-pointer text-[#71717A] hover:text-white"
                    >
                      ✕
                    </button>
                  </div>
                )}
                {visibleTypes.map((type) => {
                  const items = groups.get(type) ?? [];
                  const meta = ENTITY_META[type] ?? { plural: type, tint: "bg-zinc-500/15 text-zinc-300", glyph: "•" };
                  const shown = items.slice(0, GROUP_LIMIT);
                  const rest = items.length - shown.length;
                  return (
                    <div key={type} className="mb-1.5 last:mb-0">
                      <div className="flex items-center gap-2.5 rounded-lg bg-white/[0.06] px-3.5 py-2.5">
                        <span className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-lg text-[11px] font-black ${meta.tint}`}>
                          {meta.glyph}
                        </span>
                        <span className="text-[11px] font-bold tracking-[0.08em] text-[#A1A1AA] uppercase">
                          {meta.plural}
                        </span>
                      </div>
                      {shown.map((s) => (
                        <button
                          key={s.id}
                          onClick={() => goSuggestion(s)}
                          className="flex w-full cursor-pointer items-center gap-3 rounded-xl px-3 py-2 text-left transition-colors hover:bg-white/[0.05]"
                        >
                          {s.logoUrl ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={s.logoUrl} alt="" className="h-7 w-7 shrink-0 rounded-full border border-[#232326] bg-white object-cover" loading="lazy" />
                          ) : (
                            <span className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-black ${meta.tint}`}>
                              {meta.glyph}
                            </span>
                          )}
                          <span className="min-w-0 flex-1 truncate text-[14px] font-medium text-white">{s.title}</span>
                        </button>
                      ))}
                      {rest > 0 && (
                        <button
                          onClick={() => setActiveType(type)}
                          className="flex w-full cursor-pointer items-center justify-center rounded-lg px-2.5 py-1.5 text-xs text-[#71717A] transition-colors hover:bg-white/[0.05] hover:text-white"
                        >
                          View {rest} more
                        </button>
                      )}
                    </div>
                  );
                })}
                <button
                  onClick={() => goSeeAll(debounced)}
                  className="mt-1 flex w-full cursor-pointer items-center rounded-xl px-3 py-2.5 text-left text-sm font-semibold text-[#A78BFA] transition-colors hover:bg-white/[0.05]"
                >
                  See all results for “{debounced}”
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
