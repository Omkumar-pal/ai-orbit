"use client";
import { useState } from "react";

type Props = {
  categories?: string[];
  sorts?: string[];
  onSearch?: (v: string) => void;
  onCategory?: (v: string) => void;
  onSort?: (v: string) => void;
};

export default function FilterBar({ categories = [], sorts = [], onSearch, onCategory, onSort }: Props) {
  const [q, setQ] = useState("");
  return (
    <div className="flex flex-col gap-3 rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
      <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <input
          placeholder="Search..."
          value={q}
          onChange={(e) => { setQ(e.target.value); onSearch?.(e.target.value); }}
          className="w-full rounded-full border border-zinc-200 bg-zinc-50 px-4 py-2 text-sm outline-none focus:border-zinc-400 dark:border-zinc-700 dark:bg-zinc-800"
        />
        {sorts.length > 0 && (
          <select onChange={(e) => onSort?.(e.target.value)} className="rounded-full border border-zinc-200 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-800">
            <option value="">Sort</option>
            {sorts.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        )}
      </div>
      {categories.length > 0 && (
        <div className="flex flex-wrap gap-2">
          <button onClick={() => onCategory?.("")} className="rounded-full bg-black px-3 py-1 text-xs font-medium text-white dark:bg-white dark:text-black">All</button>
          {categories.map(c => (
            <button key={c} onClick={() => onCategory?.(c)} className="rounded-full border border-zinc-200 px-3 py-1 text-xs hover:bg-zinc-50 dark:border-zinc-700 dark:hover:bg-zinc-800">{c}</button>
          ))}
        </div>
      )}
    </div>
  );
}
