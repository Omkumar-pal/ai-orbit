"use client";

import { useState } from "react";

type PageToken = number | "ellipsis";

function pageWindow(page: number, total: number): PageToken[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  if (page <= 4) return [1, 2, 3, 4, 5, "ellipsis", total];
  if (page >= total - 3) return [1, "ellipsis", total - 4, total - 3, total - 2, total - 1, total];
  return [1, "ellipsis", page - 1, page, page + 1, "ellipsis", total];
}

export default function ProfessionalPagination({
  page,
  totalPages,
  totalCount,
  pageSize,
  pageSizeOptions = [10, 25, 50, 100],
  onPageChange,
  onPageSizeChange,
  label = "results",
}: {
  page: number;
  totalPages: number;
  totalCount?: number;
  pageSize: number;
  pageSizeOptions?: number[];
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
  label?: string;
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const total = Math.max(1, totalPages);
  const current = Math.min(Math.max(1, page), total);
  const tokens = pageWindow(current, total);

  const start = totalCount ? (current - 1) * pageSize + 1 : 0;
  const end = totalCount ? Math.min(current * pageSize, totalCount) : 0;

  const go = (p: number) => {
    if (p >= 1 && p <= total && p !== current) onPageChange(p);
  };

  return (
    <nav aria-label="Pagination" className="flex w-full flex-col items-center justify-center gap-3 py-6">
      {totalCount != null && totalCount > 0 && (
        <p className="text-xs text-[#71717A]">
          Showing <span className="font-semibold text-[#D4D4D8]">{start}–{end}</span> of{" "}
          <span className="font-semibold text-[#D4D4D8]">{totalCount.toLocaleString()}</span> {label}
        </p>
      )}
      <div className="inline-flex items-center gap-1 rounded-full border border-[#232326] bg-[#131316]/95 p-1 text-xs text-[#A1A1AA] shadow-xl backdrop-blur-md sm:gap-1.5 sm:p-1.5">
        <button
          type="button"
          onClick={() => go(current - 1)}
          disabled={current <= 1}
          aria-disabled={current <= 1}
          aria-label="Previous page"
          className={`flex h-7 w-7 cursor-pointer items-center justify-center rounded-full text-[#A1A1AA] transition-all hover:bg-[#1A1A1E] hover:text-white sm:h-8 sm:w-8 ${current <= 1 ? "pointer-events-none cursor-not-allowed opacity-30" : ""}`}
        >
          ‹
        </button>
        <div className="flex items-center gap-1 px-1">
          {tokens.map((t, i) =>
            t === "ellipsis" ? (
              <span key={`e-${i}`} aria-hidden="true" className="px-1 font-mono text-xs text-[#A1A1AA] select-none">
                …
              </span>
            ) : (
              <button
                key={t}
                type="button"
                onClick={() => go(t)}
                aria-current={t === current ? "page" : undefined}
                aria-label={`Page ${t}`}
                className={`flex h-7 w-7 cursor-pointer items-center justify-center rounded-full text-xs font-semibold transition-all sm:h-8 sm:w-8 ${
                  t === current
                    ? "border border-[#6E56CF]/60 bg-[#6E56CF]/25 font-bold text-[#A78BFA] shadow-sm"
                    : "text-[#A1A1AA] hover:bg-[#1A1A1E] hover:text-white"
                }`}
              >
                {t}
              </button>
            )
          )}
        </div>
        <button
          type="button"
          onClick={() => go(current + 1)}
          disabled={current >= total}
          aria-disabled={current >= total}
          aria-label="Next page"
          className={`flex h-7 w-7 cursor-pointer items-center justify-center rounded-full text-[#A1A1AA] transition-all hover:bg-[#1A1A1E] hover:text-white sm:h-8 sm:w-8 ${current >= total ? "pointer-events-none cursor-not-allowed opacity-30" : ""}`}
        >
          ›
        </button>
        <div className="relative ml-1 border-l border-[#232326] pl-1.5">
          <button
            type="button"
            onClick={() => setMenuOpen((v) => !v)}
            aria-label="Items per page"
            aria-expanded={menuOpen}
            className="flex cursor-pointer items-center gap-1 rounded-full border border-[#232326] bg-[#0A0A0C] px-2.5 py-1 text-[11px] font-medium text-[#D4D4D8] transition-all hover:border-[#3A3A3E] hover:text-white sm:text-[11.5px]"
          >
            <span>{pageSize} / page</span>
            <span aria-hidden="true" className="text-[9px]">▾</span>
          </button>
          {menuOpen && (
            <>
              <button
                type="button"
                aria-label="Close page size menu"
                className="fixed inset-0 z-10 cursor-default"
                onClick={() => setMenuOpen(false)}
              />
              <div className="absolute right-0 bottom-full z-20 mb-2 min-w-[110px] overflow-hidden rounded-xl border border-[#232326] bg-[#131316] p-1 shadow-2xl">
                {pageSizeOptions.map((size) => (
                  <button
                    key={size}
                    type="button"
                    onClick={() => {
                      onPageSizeChange(size);
                      setMenuOpen(false);
                    }}
                    className={`flex w-full cursor-pointer items-center justify-between rounded-lg px-3 py-2 text-[11px] font-semibold transition-colors ${
                      size === pageSize
                        ? "bg-[#6E56CF]/20 text-[#A78BFA]"
                        : "text-[#A1A1AA] hover:bg-[#1A1A1E] hover:text-white"
                    }`}
                  >
                    <span>{size} / page</span>
                    {size === pageSize && <span aria-hidden="true">✓</span>}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
