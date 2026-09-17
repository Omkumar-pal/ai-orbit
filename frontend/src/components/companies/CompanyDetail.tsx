"use client";

import { useState } from "react";
import Link from "next/link";
import type { Company } from "@/lib/types";

function formatMoney(value: string | null | undefined): string {
  if (value == null || value === "") return "—";
  const n = Number(value);
  if (Number.isNaN(n) || n <= 0) return "—";
  if (n >= 1e9) return `$${(n / 1e9).toFixed(2)}B`;
  if (n >= 1e6) return `$${(n / 1e6).toFixed(2)}M`;
  if (n >= 1e3) return `$${(n / 1e3).toFixed(2)}K`;
  return `$${n}`;
}

function formatJoined(value: string | Date | null | undefined): string {
  if (!value) return "—";
  const d = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function resolveLogo(company: Company): string | null {
  if (company.logoUrl && company.logoUrl.trim() && !company.logoUrl.startsWith("![")) {
    return company.logoUrl.trim();
  }
  if (company.website) {
    try {
      const host = new URL(
        company.website.startsWith("http") ? company.website : `https://${company.website}`
      ).hostname;
      if (host) return `https://www.google.com/s2/favicons?domain=${host}&sz=128`;
    } catch {
      return null;
    }
  }
  return null;
}

function websiteHref(website: string): string {
  return website.startsWith("http") ? website : `https://${website}`;
}

type TabId =
  | "tools"
  | "models"
  | "devices"
  | "repositories"
  | "robots"
  | "news"
  | "videos"
  | "fundraises"
  | "investments";

export default function CompanyDetail({ company }: { company: Company }) {
  const [active, setActive] = useState<TabId>("tools");

  const name = company.name;
  const initial = name.charAt(0).toUpperCase() || "A";
  const logo = resolveLogo(company);
  const sector = company.sector || "Artificial Intelligence";
  const description =
    company.description || `${name} is an artificial intelligence entity building software solutions.`;
  const location = [company.city, company.country].filter(Boolean).join(", ") || "—";

  const isAiNative = Array.isArray(company.type) && company.type.includes("AI_NATIVE");
  // Profitable rule (per directory.ts): bootstrapped / self-funded rounds only.
  const isProfitable =
    company.latestFundingRound === "Bootstrapped" || company.latestFundingRound === "Self-funded";

  const toolsCount =
    company.toolsCount ?? (Array.isArray(company.tools) ? company.tools.length : 0);
  const modelsCount =
    company.aiModelsCount ?? (Array.isArray(company.aiModels) ? company.aiModels.length : 0);

  const tabs: { id: TabId; label: string; count: number }[] = [
    { id: "tools", label: "Tools", count: toolsCount },
    { id: "models", label: "Models", count: modelsCount },
    { id: "devices", label: "Devices", count: 0 },
    { id: "repositories", label: "Repositories", count: 0 },
    { id: "robots", label: "Robots", count: 0 },
    { id: "news", label: "News", count: 0 },
    { id: "videos", label: "Videos", count: 0 },
    { id: "fundraises", label: "Fundraises", count: 0 },
    { id: "investments", label: "Investments", count: 0 },
  ];

  const sidebar = (extraClass: string) => (
    <aside className={`overflow-hidden rounded-2xl border border-[#1F1F24] bg-[#0D0D10] ${extraClass}`}>
      <div className="p-5 text-center sm:p-6">
        <div className="mx-auto mb-4 flex h-28 w-28 items-center justify-center overflow-hidden rounded-[24px] border border-[#26262B] bg-[#141418] p-2 shadow-lg sm:h-44 sm:w-44 sm:rounded-[30px]">
          {logo ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={logo} alt={name} className="h-full w-full rounded-[18px] object-contain" />
          ) : (
            <span className="text-4xl font-black text-white sm:text-5xl">{initial}</span>
          )}
        </div>
        <p className="truncate text-lg font-extrabold text-white">{name}</p>
        <div className="mt-4 grid gap-2.5 text-left text-xs text-[#A1A1AA]">
          <div className="flex items-center gap-2.5">
            <span aria-hidden="true" className="shrink-0 text-[#71717A]">📍</span>
            <span className="min-w-0 truncate">{location}</span>
          </div>
          {company.foundedYear ? (
            <div className="flex items-center gap-2.5">
              <span aria-hidden="true" className="shrink-0 text-[#71717A]">🏢</span>
              <span>Founded {company.foundedYear}</span>
            </div>
          ) : null}
        </div>
        <div className="mt-4 grid gap-2.5">
          <button
            type="button"
            className="flex h-10 w-full cursor-pointer items-center justify-center gap-1.5 rounded-xl bg-[#6E56CF] text-xs font-bold text-white transition-all hover:bg-[#7C63E8]"
          >
            ＋ Follow
          </button>
          {company.website ? (
            <a
              href={websiteHref(company.website)}
              target="_blank"
              rel="noopener noreferrer"
              className="flex h-10 w-full items-center justify-center gap-1.5 rounded-xl border border-[#2C2C32] bg-[#131316] px-4 text-xs font-bold text-white transition-all hover:bg-[#1A1A1E]"
            >
              ↗ Visit Website
            </a>
          ) : null}
          <div className="grid grid-cols-2 gap-2.5">
            <button
              type="button"
              title="Bookmark Company"
              className="flex h-10 cursor-pointer items-center justify-center rounded-xl border border-[#2C2C32] bg-[#131316] text-[#A1A1AA] transition-all hover:bg-[#1A1A1E] hover:text-white"
            >
              🔖
            </button>
            <button
              type="button"
              title="Share Company"
              className="flex h-10 cursor-pointer items-center justify-center rounded-xl border border-[#2C2C32] bg-[#131316] text-[#A1A1AA] transition-all hover:bg-[#1A1A1E] hover:text-white"
            >
              ⤴
            </button>
          </div>
        </div>
      </div>
      <div className="border-t border-[#1F1F24] p-5 text-left sm:p-6">
        <h3 className="mb-3 text-xs font-semibold text-[#A1A1AA]">Social Links</h3>
        <div className="grid gap-2.5">
          {company.linkedinUrl ? (
            <a
              href={company.linkedinUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-between gap-3 text-xs text-[#A1A1AA] transition-colors hover:text-white"
            >
              <span>in&nbsp;&nbsp;LinkedIn</span>
              <span className="text-[#52525B]">↗</span>
            </a>
          ) : null}
          {company.twitterUrl ? (
            <a
              href={company.twitterUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-between gap-3 text-xs text-[#A1A1AA] transition-colors hover:text-white"
            >
              <span>𝕏&nbsp;&nbsp;Twitter</span>
              <span className="text-[#52525B]">↗</span>
            </a>
          ) : null}
          {company.website ? (
            <a
              href={websiteHref(company.website)}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-between gap-3 text-xs text-[#A1A1AA] transition-colors hover:text-white"
            >
              <span>🌐&nbsp;&nbsp;Website</span>
              <span className="text-[#52525B]">↗</span>
            </a>
          ) : null}
          {!company.linkedinUrl && !company.twitterUrl && !company.website ? (
            <p className="text-xs text-[#52525B]">No public links listed.</p>
          ) : null}
        </div>
      </div>
      <div className="border-t border-[#1F1F24] p-5 text-left sm:p-6">
        <h3 className="mb-1.5 text-xs font-semibold text-[#A1A1AA]">Joined AIOrbit</h3>
        <p className="text-sm font-bold text-white">{formatJoined(company.createdAt)}</p>
      </div>
    </aside>
  );

  return (
    <div className="mx-auto w-full max-w-[1440px] flex-1 px-5 py-3 sm:px-8 sm:py-4 lg:px-10">
      <nav aria-label="Breadcrumb" className="mb-3 flex flex-wrap items-center gap-1.5 text-[11px] font-medium text-[#71717A] sm:mb-4 sm:gap-2 sm:text-xs">
        <Link href="/" className="inline-flex items-center gap-1 transition-colors hover:text-white">
          ⌂ <span>Home</span>
        </Link>
        <span className="text-[#52525B]">›</span>
        <Link href="/companies" className="transition-colors hover:text-white">
          Companies
        </Link>
        {company.sector ? (
          <>
            <span className="text-[#52525B]">›</span>
            <Link
              href={`/companies?filter=${encodeURIComponent(company.sector.toLowerCase())}`}
              className="transition-colors hover:text-white"
            >
              {company.sector}
            </Link>
          </>
        ) : null}
        <span className="text-[#52525B]">›</span>
        <span className="flex max-w-[220px] items-center gap-1.5 truncate font-semibold text-white sm:max-w-none">
          {logo ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={logo} alt="" className="h-4 w-4 shrink-0 rounded object-contain" />
          ) : (
            <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded bg-[#232326] text-[10px] font-bold">
              {initial}
            </span>
          )}
          <span className="truncate">{name}</span>
        </span>
      </nav>

      <div className="grid grid-cols-1 items-start gap-4 lg:grid-cols-[minmax(0,1fr)_320px] lg:gap-7">
        <div className="min-w-0 space-y-3 sm:space-y-5">
          <section className="relative overflow-hidden rounded-2xl border border-[#1F1F24] bg-[#0D0D10] p-5 shadow-2xl sm:p-6 lg:p-7">
            <div className="pointer-events-none absolute -top-24 -right-20 h-80 w-80 rounded-full bg-[#F5C84C]/10 blur-3xl" />
            <div className="pointer-events-none absolute top-0 right-0 h-full w-1/2 overflow-hidden opacity-40">
              <div className="absolute -top-8 right-8 h-44 w-80 bg-[radial-gradient(circle_at_center,_rgba(110,86,207,0.35)_1px,_transparent_1px)] [background-size:14px_14px] [mask-image:linear-gradient(to_bottom_left,black,transparent_75%)]" />
            </div>
            <div className="relative z-10">
              <div className="mb-4 flex flex-wrap items-end gap-3">
                <h1 className="text-3xl leading-none font-black tracking-tight text-white sm:text-4xl lg:text-[42px]">
                  {name}
                </h1>
                <Link
                  href={`/companies?filter=${encodeURIComponent(sector.toLowerCase())}`}
                  className="rounded-lg border border-[#2B2B30] bg-[#1C1C20] px-2.5 py-1 text-xs font-bold text-white transition-colors hover:border-[#6E56CF] hover:text-[#A78BFA]"
                >
                  {sector}
                </Link>
              </div>
              <p className="mb-6 max-w-3xl text-sm leading-7 text-[#A1A1AA] sm:text-[15px]">
                {description}
              </p>
              <div className="grid grid-cols-2 gap-x-4 gap-y-4 border-t border-[#1F1F24] pt-5 sm:grid-cols-4 lg:grid-cols-8">
                <div>
                  <div className="mb-1.5 text-[11px] font-semibold text-[#71717A]">AI Native</div>
                  <div className="text-sm font-bold">
                    {isAiNative ? <span className="text-emerald-400">Yes</span> : <span className="text-red-400">No</span>}
                  </div>
                </div>
                <div>
                  <div className="mb-1.5 text-[11px] font-semibold text-[#71717A]">Profitable</div>
                  <div className="text-sm font-bold">
                    {isProfitable ? <span className="text-emerald-400">Yes</span> : <span className="text-red-400">No</span>}
                  </div>
                </div>
                <div>
                  <div className="mb-1.5 text-[11px] font-semibold text-[#71717A]">Valuation</div>
                  <div className="text-sm font-bold text-white">{formatMoney(company.valuation)}</div>
                </div>
                <div>
                  <div className="mb-1.5 text-[11px] font-semibold text-[#71717A]">$ Raised</div>
                  <div className="text-sm font-bold text-white">{formatMoney(company.fundingRaised)}</div>
                </div>
                <div>
                  <div className="mb-1.5 text-[11px] font-semibold text-[#71717A]">Employees</div>
                  <div className="text-sm font-bold text-white">
                    {company.employeeCount ? company.employeeCount.toLocaleString() : <span className="text-[#52525B]">—</span>}
                  </div>
                </div>
                <div>
                  <div className="mb-1.5 text-[11px] font-semibold text-[#71717A]">Total Tools</div>
                  <div className="text-sm font-bold text-white">{toolsCount}</div>
                </div>
                <div>
                  <div className="mb-1.5 text-[11px] font-semibold text-[#71717A]">Total Models</div>
                  <div className="text-sm font-bold text-white">{modelsCount}</div>
                </div>
                <div className="min-w-0">
                  <div className="mb-1.5 text-[11px] font-semibold text-[#71717A]">Flagship Tool</div>
                  <div className="text-sm font-bold text-[#52525B]">—</div>
                </div>
              </div>
            </div>
          </section>

          {sidebar("lg:hidden")}

          <div className="flex items-center gap-1.5 overflow-x-auto border-b border-[#1F1F24] pb-3 sm:pb-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {tabs.map((t) => {
              const selected = active === t.id;
              return (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setActive(t.id)}
                  className={`flex shrink-0 cursor-pointer items-center gap-2 rounded-xl border px-3.5 py-2.5 text-xs font-bold whitespace-nowrap transition-all active:scale-95 ${
                    selected
                      ? "border-[#6E56CF] bg-[#6E56CF] text-white shadow-md shadow-[#6E56CF]/20"
                      : "border-[#232326] bg-[#131316] text-[#A1A1AA] hover:border-[#333] hover:text-white"
                  }`}
                >
                  <span>{t.label}</span>
                  <span
                    className={`rounded-full px-1.5 py-0.5 text-[10px] ${
                      selected ? "bg-white/15 text-white" : "bg-[#1C1C20] text-[#71717A]"
                    }`}
                  >
                    {t.count}
                  </span>
                </button>
              );
            })}
          </div>

          <div className="space-y-6">
            {active === "tools" && (
              <div>
                <h2 className="mb-3 text-xl font-extrabold text-white sm:mb-4 sm:text-2xl">Tools ({toolsCount})</h2>
                <div className="rounded-2xl border border-[#1F1F24] bg-[#0D0D10] p-8 text-center text-xs text-[#71717A] sm:p-12 sm:text-sm">
                  No public AI tools listed yet for {name}.
                </div>
              </div>
            )}
            {active === "models" && (
              <div>
                <h2 className="mb-4 text-xl font-extrabold text-white sm:mb-5 sm:text-2xl">Models ({modelsCount})</h2>
                <div className="rounded-2xl border border-[#1F1F24] bg-[#0D0D10] p-8 text-center text-xs text-[#71717A] sm:p-12 sm:text-sm">
                  No foundation models listed yet for {name}.
                </div>
              </div>
            )}
            {active === "devices" && (
              <div>
                <h2 className="mb-4 text-xl font-extrabold text-white sm:mb-5 sm:text-2xl">Devices (0)</h2>
                <div className="rounded-2xl border border-[#1F1F24] bg-[#0D0D10] p-8 text-center text-xs text-[#71717A] sm:p-12 sm:text-sm">
                  No public devices listed yet for {name}.
                </div>
              </div>
            )}
            {active === "repositories" && (
              <div>
                <h2 className="mb-4 text-xl font-extrabold text-white sm:mb-5 sm:text-2xl">Repositories (0)</h2>
                <div className="rounded-2xl border border-[#1F1F24] bg-[#0D0D10] p-8 text-center text-xs text-[#71717A] sm:p-12 sm:text-sm">
                  No public repositories listed yet for {name}.
                </div>
              </div>
            )}
            {active === "robots" && (
              <div>
                <h2 className="mb-4 text-xl font-extrabold text-white sm:mb-5 sm:text-2xl">Robots (0)</h2>
                <div className="rounded-2xl border border-[#1F1F24] bg-[#0D0D10] p-8 text-center text-xs text-[#71717A] sm:p-12 sm:text-sm">
                  No public robots listed yet for {name}.
                </div>
              </div>
            )}
            {active === "news" && (
              <div className="rounded-2xl border border-[#1F1F24] bg-[#0D0D10] p-8 text-center text-xs text-[#71717A] sm:p-12 sm:text-sm">
                <p className="mb-1 font-semibold text-white">No news listed yet</p>
                <p className="text-xs text-[#52525B]">There are currently no public news records indexed for {name}.</p>
              </div>
            )}
            {active === "videos" && (
              <div>
                <h2 className="mb-3 text-xl font-extrabold text-white sm:mb-4 sm:text-2xl">Videos (0)</h2>
                <div className="rounded-2xl border border-[#1F1F24] bg-[#0D0D10] p-8 text-center text-xs text-[#71717A] sm:p-12 sm:text-sm">
                  <p className="mb-1 font-semibold text-white">No videos listed yet</p>
                  <p className="text-xs text-[#52525B]">There are currently no public videos indexed for {name}.</p>
                </div>
              </div>
            )}
            {active === "fundraises" && (
              <div className="rounded-2xl border border-[#1F1F24] bg-[#0D0D10] p-8 text-center text-xs text-[#71717A] sm:p-12 sm:text-sm">
                <p className="mb-1 font-semibold text-white">No fundraises listed yet</p>
                <p className="text-xs text-[#52525B]">There are currently no public fundraise records indexed for {name}.</p>
              </div>
            )}
            {active === "investments" && (
              <div className="rounded-2xl border border-[#1F1F24] bg-[#0D0D10] p-8 text-center text-xs text-[#71717A] sm:p-12 sm:text-sm">
                <p className="mb-1 font-semibold text-white">No investments listed yet</p>
                <p className="text-xs text-[#52525B]">There are currently no public investment records indexed for {name}.</p>
              </div>
            )}
          </div>
        </div>

        {sidebar("hidden lg:block lg:sticky lg:top-24")}
      </div>
    </div>
  );
}
