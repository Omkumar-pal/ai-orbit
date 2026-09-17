"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { OrbitFilter, useOrbitFilter } from "@/components/layout/FilterContext";

const tabs = [["New", "/"], ["Tools", "/tools"], ["Agents", "/agents"], ["Tasks", "/tasks"], ["Companies", "/companies"], ["News", "/news"], ["Videos", "/videos"], ["Robots", "/robots"], ["Devices", "/devices"], ["Models", "/models"], ["Repositories", "/repositories"], ["MCP", "/mcp"], ["Personal", "/personal"], ["Creativity", "/creativity"]] as const;
const topFilters: { label: string; value: OrbitFilter; icon: string }[] = [{ label: "Trending", value: "trending", icon: "◉" }, { label: "Popular", value: "popular", icon: "◎" }, { label: "New", value: "new", icon: "✦" }, { label: "Free", value: "free", icon: "◌" }, { label: "Top Rated", value: "top-rated", icon: "◉" }];

export default function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const { activeFilter, setActiveFilter } = useOrbitFilter();
  const [search, setSearch] = useState("");
  const submitSearch = (event: FormEvent) => { event.preventDefault(); router.push(`/tools?q=${encodeURIComponent(search)}`); };
  // Detail pages (e.g. /companies/txt-outlines, /tasks/storyboard-videos) render
  // only the slim topbar — no hero title, search, filter pills, or rail tabs.
  const isCompanyDetail = pathname.startsWith("/companies/") && pathname.length > "/companies/".length;
  const isTaskDetail = pathname.startsWith("/tasks/") && pathname.length > "/tasks/".length;
  const isToolDetail = pathname.startsWith("/tools/") && pathname.length > "/tools/".length;
  const isAgentDetail = pathname.startsWith("/agents/") && pathname.length > "/agents/".length;
  const isNewsDetail = pathname.startsWith("/news/") && pathname.length > "/news/".length;
  const isVideoDetail = pathname.startsWith("/videos/") && pathname.length > "/videos/".length;
  const isModelDetail = pathname.startsWith("/models/") && pathname.length > "/models/".length;
  const isDeviceDetail = pathname.startsWith("/devices/") && pathname.length > "/devices/".length;
  const isRobotDetail = pathname.startsWith("/robots/") && pathname.length > "/robots/".length;
  const isRepoDetail = pathname.startsWith("/repositories/") && pathname.length > "/repositories/".length;
  const isMcpDetail = pathname.startsWith("/mcp/") && pathname.length > "/mcp/".length;
  const isDetailPage = isCompanyDetail || isTaskDetail || isToolDetail || isAgentDetail || isNewsDetail || isVideoDetail || isModelDetail || isDeviceDetail || isRobotDetail || isRepoDetail || isMcpDetail;
  return (
    <header className="site-header">
      <div className="topbar"><div className="brand"><button className="menu-button" aria-label="Open navigation menu">☰</button><Link href="/" className="brand"><span className="orbit">◒</span>AIORBIT</Link></div><div className="header-actions"><Link href="/submit" className="submit-button">＋ Submit Tool</Link><span className="login-button">Log In</span></div></div>
      {!isDetailPage && (
      <div className="hero-rail"><h1>The Home of Everything AI</h1><form className="global-search" onSubmit={submitSearch}><span>⌕</span><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search AI tools, models, companies..." aria-label="Search the AI ecosystem" /><kbd>⌘ K</kbd></form><div className="filter-pills">{topFilters.map((filter) => <button key={filter.value} onClick={() => setActiveFilter(activeFilter === filter.value ? null : filter.value)} className={activeFilter === filter.value ? "active" : ""}>{filter.icon} {filter.label}</button>)}</div><nav className="rail-tabs">{tabs.map(([label, href]) => <Link key={label} href={href} className={pathname === href ? "active" : ""}>{label}</Link>)}</nav></div>
      )}
    </header>
  );
}
