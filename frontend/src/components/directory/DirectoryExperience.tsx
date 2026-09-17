"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import type { DirectoryItem } from "@/lib/mock-data";
import { useOrbitFilter } from "@/components/layout/FilterContext";
import ProfessionalPagination from "@/components/directory/ProfessionalPagination";
import { matchesToolCategory, toolPillSlug, isToolCategorySlug } from "@/lib/toolFilters";
import { matchesNewsCategory, newsPillKey, isNewsKey, formatPosted } from "@/lib/newsFilters";
import {
  matchesModelCategory,
  matchesDeviceCategory,
  matchesRobotCategory,
  matchesRepositoryCategory,
  matchesMcpCategory,
  matchesPersonalCategory,
  PERSONAL_CATEGORIES,
  CREATIVITY_PILLS,
  creativityPillSlug,
} from "@/lib/entityFilters";

const companyCategories = ["All","AI Model Providers","Infrastructure","Enterprise","Healthcare","Generative AI","Marketing","Developer Tools","Robotics","Education","Open Source","Finance","AI Native","Profitable"];
const taskCategories = ["All","Content Creation","Image Creation","Video Creation","Audio","Coding","Data Analysis","Research","Productivity","Marketing","Customer Support","Translation","Presentation","Brainstorming","Prompting","Website Building"];
const toolCategories = ["All","Writing","Image Generation","Video Generation","Audio","Chatbots","Coding","Marketing","Productivity","Business","Education","Agents","Presentations","3D Generation","No-Code AI Builders","Workflow Automation"];
const agentCategories = ["All","AI Agent Development","AI Agent Directory","AI Agents","Browser AI Agents","Productivity Agents","Software Testing","Frontier LLM","Vision LLM","Coding","Embedding","Video Generation","OCR / Document","Image Generation","Speech","Speech / Translation","Audio / Music"];
const newsCategories = ["All","AI Industry","Product Launches","Innovations","Company Updates","Open Source","Regulations","Interviews","Market Trends","Breakthroughs","Security","Agents","LLMs","Technology"];
const modelCategories = ["All","Code Generation","E-commerce","Embedding","Image Generation","LLM","Multimodal","Open Source Models","Project Management","Reasoning","Recruitment","Speech","Testing","Translation","Video Generation","Vision Models"];
const deviceCategories = ["All","AI PCs","Smartphones","Smart Home","Wearables","AI Cameras","Audio","AR/VR","Edge AI","Robotics Hardware","Medical","Development Boards","Smart Sensors","Automotive AI Devices","Microphones","Farming"];
const robotCategories = ["All","Humanoid Robots","Industrial","Service","Healthcare","Educational","Autonomous Mobile Robots","Drones","Companion","Agricultural","Research","Multi-Agent","Task-Specific","Autonomous Navigation","Reinforcement Learning","Surveillance"];
const repoCategories = ["All","LLMs","Generative AI","AI Frameworks","NLP","Frameworks","Robotics","RAG Systems","Deployment","Data Science","Prompt Engineering","Search Engines","Knowledge Graphs","AI Agents","Cloud"];
const mcpCategories = ["All","APIs","Browser","Cloud","Community","Databases","Developer Tools","File Systems","MCP Servers","ML Platforms","Productivity","Core MCP Servers","SDKs & Frameworks","Specialized MCP Servers","Testing Tools","Version Control","Automation","Smart Devices","Data Analytics","MCP Clients"];
const personalCategories = ["All", ...PERSONAL_CATEGORIES];
const creativityCategories = CREATIVITY_PILLS.map((p) => p.label);

function fmtRelease(value: string | null | undefined): string {
  if (!value) return "--";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "--";
  return d.toLocaleDateString("en-US", { month: "short", year: "numeric" });
}
const defaultCategories = ["All", "Writing", "Image Generation", "Video Generation", "Audio", "Chatbots", "Coding", "Marketing", "Productivity", "Business", "Education", "Agents"];

export default function DirectoryExperience({ resource, title, intro, items, initialQuery = "", initialCategory = "All" }: { resource: string; title: string; intro: string; items: any[]; initialQuery?: string; initialCategory?: string }) {
  const categories = resource === "companies" ? companyCategories : resource === "tasks" ? taskCategories : resource === "tools" ? toolCategories : resource === "agents" ? agentCategories : resource === "news" ? newsCategories : resource === "models" ? modelCategories : resource === "devices" ? deviceCategories : resource === "robots" ? robotCategories : resource === "repositories" ? repoCategories : resource === "mcp" ? mcpCategories : resource === "personal" ? personalCategories : resource === "creativity" ? creativityCategories : defaultCategories;
  // Personal/creativity are tool views — their rows link to the tool detail page.
  const linkBase = resource === "personal" || resource === "creativity" ? "tools" : resource;
  const [query, setQuery] = useState(initialQuery);
  const [selected, setSelected] = useState(
    categories.includes(initialCategory)
      ? initialCategory
      : resource === "tools" && isToolCategorySlug(initialCategory)
        ? initialCategory
        : resource === "news" && isNewsKey(initialCategory)
          ? initialCategory
          : "All"
  );
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(100);
  const [toast, setToast] = useState<string | null>(null);
  const { activeFilter } = useOrbitFilter();
  const filtered = useMemo(() => (items as any[]).filter((item: any) =>
    (resource === "tools"
      ? matchesToolCategory(item, toolPillSlug(selected))
      : resource === "news"
        ? matchesNewsCategory(item, newsPillKey(selected))
        : resource === "models"
          ? matchesModelCategory(item, selected)
          : resource === "devices"
            ? matchesDeviceCategory(item, selected)
            : resource === "robots"
              ? matchesRobotCategory(item, selected)
              : resource === "repositories"
                ? matchesRepositoryCategory(item, selected)
                : resource === "mcp"
                  ? matchesMcpCategory(item, selected)
                  : resource === "personal"
                    ? matchesPersonalCategory(item.categories, selected)
                    : resource === "creativity"
                      ? matchesToolCategory(item, creativityPillSlug(selected))
                      : (selected === "All" || item.category === selected)) && `${item.name} ${item.description} ${item.task ?? item.sectorRaw ?? ""}`.toLowerCase().includes(query.toLowerCase()) &&
    (!activeFilter || (activeFilter === "trending" && item.isTrending) || (activeFilter === "popular" && (item.popularity ?? 0) >= 85) || (activeFilter === "new" && item.isNew) || (activeFilter === "free" && item.pricing === "Free") || (activeFilter === "top-rated" && (item.rating ?? 0) >= 4.8)),
  ), [activeFilter, items, query, resource, selected]);
  const pages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const visible = filtered.slice((page - 1) * pageSize, page * pageSize);
  const choose = (category: string) => { setSelected(category); setPage(1); };
  const handleShare = async (slug: string) => {
    const url = `${window.location.origin}/${linkBase}/${slug}`;
    try { await navigator.clipboard.writeText(url); } catch { const el=document.createElement("textarea"); el.value=url; document.body.appendChild(el); el.select(); document.execCommand("copy"); el.remove(); }
    setToast("Copied text to clipboard"); setTimeout(()=>setToast(null), 2000);
  };

  return <section className="directory-page">
    <div className="directory-heading">
      <p className="eyebrow">DIRECTORY</p>
      <h1>{title}</h1>
      <p>{intro}</p>
    </div>
    <div className="directory-controls">
      <div className="category-scroll" aria-label={`${title} categories`}>
        {categories.map((category) => <button key={category} onClick={() => choose(category)} className={selected === category ? "category active" : "category"}>{category}</button>)}
      </div>
      <label className="directory-search"><span>⌕</span><input value={query} onChange={(event) => { setQuery(event.target.value); setPage(1); }} placeholder={`Search ${resource}...`} /></label>
    </div>
    <div className="directory-table-wrap">
      {resource === "companies" ? (
      <table className="directory-table companies">
        <thead><tr><th>Company ↕</th><th>country</th><th>valuation</th><th>val/emp</th><th>ai native</th><th>profitable</th><th>sector</th><th>models</th><th>tools</th><th>share</th><th>bookmark</th></tr></thead>
        <tbody>{visible.map((item: any) => <tr key={item.slug}>
          <td><Link href={`/${resource}/${item.slug}`} className="entity"><span className="entity-mark" style={{ background: item.accent }}>{item.name.slice(0, 1)}</span><span>{item.name}{item.verified && <i title="Verified">✓</i>}</span></Link></td>
          <td>{item.country ?? "--"}</td>
          <td>{item.valuationFmt ?? "--"}</td>
          <td>{item.valEmpFmt ?? "--"}</td>
          <td><span className={item.aiNative ? "api-pill yes" : "api-pill"}>{item.aiNative ? "YES" : "NO"}</span></td>
          <td><span className={item.profitable ? "api-pill yes" : "api-pill"}>{item.profitable ? "YES" : "NO"}</span></td>
          <td>{item.sectorRaw ?? "--"}</td>
          <td>{item.models ?? 0}</td>
          <td>{item.tools ?? 0}</td>
          <td><button onClick={()=>handleShare(item.slug)} aria-label="Share" style={{ border:"1px solid #2d2b31", background:"#1a1a20", color:"#cfc9d4", width:28, height:28, borderRadius:999, display:"grid", placeItems:"center", cursor:"pointer", fontSize:12 }}>⤴</button></td>
          <td><button aria-label="Bookmark" title="Save company (coming soon)" style={{ border:"1px solid #2d2b31", background:"#1a1a20", color:"#cfc9d4", width:28, height:28, borderRadius:999, display:"grid", placeItems:"center", fontSize:12 }}>☆</button></td>
        </tr>)}</tbody>
      </table>
      ) : resource === "tasks" ? (
      <table className="directory-table tasks">
        <thead><tr><th>TASK ↕</th><th>TOOLS</th><th>MODELS</th><th>ROBOTS</th><th>DEVICES</th><th>ACTIONS</th></tr></thead>
        <tbody>{visible.map((item: any) => <tr key={item.slug}>
          <td><Link href={`/${resource}/${item.slug}`} className="entity">{item.iconUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={item.iconUrl} alt="" style={{ width: 31, height: 31, borderRadius: 9, objectFit: "cover", background: item.accent }} />
          ) : (
            <span className="entity-mark" style={{ background: item.accent }}>{item.name.slice(0, 1)}</span>
          )}<span>{item.name}</span></Link></td>
          <td>{item.toolsCount ?? 0}</td>
          <td>{item.modelsCount ?? 0}</td>
          <td>{item.robotsCount ?? 0}</td>
          <td>{item.devicesCount ?? 0}</td>
          <td><span style={{ display: "inline-flex", gap: 8 }}><button onClick={()=>handleShare(item.slug)} aria-label="Share" style={{ border:"1px solid #2d2b31", background:"#1a1a20", color:"#cfc9d4", width:28, height:28, borderRadius:999, display:"grid", placeItems:"center", cursor:"pointer", fontSize:12 }}>⤴</button><button aria-label="Bookmark" title="Save task (coming soon)" style={{ border:"1px solid #2d2b31", background:"#1a1a20", color:"#cfc9d4", width:28, height:28, borderRadius:999, display:"grid", placeItems:"center", fontSize:12 }}>☆</button></span></td>
        </tr>)}</tbody>
      </table>
      ) : resource === "tools" || resource === "personal" || resource === "creativity" ? (
      <table className="directory-table tools">
        <thead><tr><th>TOOL ↕</th><th>TASK</th><th>PRICING</th><th>API</th><th>OPEN-SOURCE</th><th>COMPATIBILITY</th><th>RELEASED ↕</th><th>SHARE</th><th>SAVE</th><th>COMPARE</th></tr></thead>
        <tbody>{visible.map((item: any) => <tr key={item.slug}>
          <td><Link href={`/${linkBase}/${item.slug}`} className="entity">{item.logoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={item.logoUrl} alt="" style={{ width: 31, height: 31, borderRadius: 9, objectFit: "cover", background: item.accent }} />
          ) : (
            <span className="entity-mark" style={{ background: item.accent }}>{item.name.slice(0, 1)}</span>
          )}<span>{item.name}{item.verified && <i title="Verified">✓</i>}</span></Link></td>
          <td><span className="task-pill">{item.task}</span></td>
          <td><span className={`price-pill ${item.pricing.toLowerCase()}`}>• {item.pricing}</span></td>
          <td><span className={item.api ? "api-pill yes" : "api-pill"}>{item.api ? "YES" : "NO"}</span></td>
          <td><span className={item.hasOpenSource ? "api-pill yes" : "api-pill"}>{item.hasOpenSource ? "YES" : "NO"}</span></td>
          <td>{item.compatibility ?? "--"}</td>
          <td>{fmtRelease(item.releaseDate)}</td>
          <td><button onClick={()=>handleShare(item.slug)} aria-label="Share" style={{ border:"1px solid #2d2b31", background:"#1a1a20", color:"#cfc9d4", width:28, height:28, borderRadius:999, display:"grid", placeItems:"center", cursor:"pointer", fontSize:12 }}>⤴</button></td>
          <td><button aria-label="Bookmark" title="Save tool (coming soon)" style={{ border:"1px solid #2d2b31", background:"#1a1a20", color:"#cfc9d4", width:28, height:28, borderRadius:999, display:"grid", placeItems:"center", fontSize:12 }}>☆</button></td>
          <td><Link href={`/${linkBase}/${item.slug}`} aria-label={`Compare ${item.name}`} style={{ border:"1px solid #2d2b31", background:"#1a1a20", color:"#cfc9d4", width:28, height:28, borderRadius:999, display:"grid", placeItems:"center", fontSize:12 }}>⥂</Link></td>
        </tr>)}</tbody>
      </table>
      ) : resource === "agents" ? (
      <table className="directory-table agents">
        <thead><tr><th>AGENT</th><th>CATEGORY</th><th>PRIMARY TASK</th><th>PRICING</th><th>API</th><th>RELEASED</th><th>SHARE</th><th>SAVE</th><th>COMPARE</th></tr></thead>
        <tbody>{visible.map((item: any) => <tr key={item.slug}>
          <td><Link href={`/${resource}/${item.slug}`} className="entity">{item.logoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={item.logoUrl} alt="" style={{ width: 31, height: 31, borderRadius: 9, objectFit: "cover", background: item.accent }} />
          ) : (
            <span className="entity-mark" style={{ background: item.accent }}>{item.name.slice(0, 1)}</span>
          )}<span>{item.name}{item.verified && <i title="Verified">✓</i>}</span></Link></td>
          <td>{item.category}</td>
          <td><span className="task-pill">{item.task}</span></td>
          <td><span className={`price-pill ${item.pricing.toLowerCase()}`}>• {item.pricing}</span></td>
          <td><span className={item.api ? "api-pill yes" : "api-pill"}>{item.api ? "YES" : "NO"}</span></td>
          <td>{fmtRelease(item.releaseDate)}</td>
          <td><button onClick={()=>handleShare(item.slug)} aria-label="Share" style={{ border:"1px solid #2d2b31", background:"#1a1a20", color:"#cfc9d4", width:28, height:28, borderRadius:999, display:"grid", placeItems:"center", cursor:"pointer", fontSize:12 }}>⤴</button></td>
          <td><button aria-label="Bookmark" title="Save agent (coming soon)" style={{ border:"1px solid #2d2b31", background:"#1a1a20", color:"#cfc9d4", width:28, height:28, borderRadius:999, display:"grid", placeItems:"center", fontSize:12 }}>☆</button></td>
          <td><Link href={`/${resource}/${item.slug}`} aria-label={`Compare ${item.name}`} style={{ border:"1px solid #2d2b31", background:"#1a1a20", color:"#cfc9d4", width:28, height:28, borderRadius:999, display:"grid", placeItems:"center", fontSize:12 }}>⥂</Link></td>
        </tr>)}</tbody>
      </table>
      ) : resource === "news" ? (
      <table className="directory-table news">
        <thead><tr><th>HEADLINE</th><th>POSTED</th><th>CATEGORY</th><th>PUBLISHER</th><th>ACTION</th></tr></thead>
        <tbody>{visible.map((item: any) => <tr key={item.slug}>
          <td><Link href={`/${resource}/${item.slug}`} className="entity" title={item.dek ?? item.name}><span className="entity-mark" style={{ background: item.accent }}>{item.name.slice(0, 1)}</span><span>{item.name}</span></Link></td>
          <td>{formatPosted(item.hours)}</td>
          <td>{item.category}</td>
          <td><span className="entity">{item.publisherLogo ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={item.publisherLogo} alt="" style={{ width: 20, height: 20, borderRadius: 6, objectFit: "cover" }} />
          ) : (
            <span className="entity-mark" style={{ width: 20, height: 20, fontSize: 10, borderRadius: 6, background: item.accent }}>{String(item.publisherName ?? "?").slice(0, 1)}</span>
          )}<span>{item.publisherName}</span></span></td>
          <td><span style={{ display: "inline-flex", gap: 8 }}><button onClick={()=>handleShare(item.slug)} aria-label="Share" style={{ border:"1px solid #2d2b31", background:"#1a1a20", color:"#cfc9d4", width:28, height:28, borderRadius:999, display:"grid", placeItems:"center", cursor:"pointer", fontSize:12 }}>⤴</button><button aria-label="Bookmark" title="Save article (coming soon)" style={{ border:"1px solid #2d2b31", background:"#1a1a20", color:"#cfc9d4", width:28, height:28, borderRadius:999, display:"grid", placeItems:"center", fontSize:12 }}>☆</button></span></td>
        </tr>)}</tbody>
      </table>
      ) : resource === "models" ? (
      <table className="directory-table models">
        <thead><tr><th>NAME</th><th>COMPANY</th><th>TYPE</th><th>PRIMARY TASK</th><th>RELEASED</th><th>OPEN SOURCE</th><th>COMPARE</th></tr></thead>
        <tbody>{visible.map((item: any) => <tr key={item.slug}>
          <td><Link href={`/${resource}/${item.slug}`} className="entity">{item.logoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={item.logoUrl} alt="" style={{ width: 31, height: 31, borderRadius: 9, objectFit: "cover", background: item.accent }} />
          ) : (
            <span className="entity-mark" style={{ background: item.accent }}>{item.name.slice(0, 1)}</span>
          )}<span>{item.name}</span></Link></td>
          <td>{item.providerName ?? "--"}</td>
          <td><span className="task-pill">{item.modelType ?? "--"}</span></td>
          <td><span className="task-pill">{item.task}</span></td>
          <td>{item.releaseDate ?? "--"}</td>
          <td><span className={item.openSource ? "api-pill yes" : "api-pill"}>{item.openSource ? "YES" : "NO"}</span></td>
          <td><Link href={`/${resource}/${item.slug}`} aria-label={`Compare ${item.name}`} style={{ border:"1px solid #2d2b31", background:"#1a1a20", color:"#cfc9d4", width:28, height:28, borderRadius:999, display:"grid", placeItems:"center", fontSize:12 }}>⥂</Link></td>
        </tr>)}</tbody>
      </table>
      ) : resource === "devices" ? (
      <table className="directory-table devices">
        <thead><tr><th>DEVICE ↕</th><th>COMPANY</th><th>CATEGORY</th><th>COUNTRY</th><th>AVAIL. ↕</th><th>PRICE ↕</th><th>RELEASE DATE ↕</th><th>MAIN TASK</th><th>ACTIONS</th></tr></thead>
        <tbody>{visible.map((item: any) => <tr key={item.slug}>
          <td><Link href={`/${resource}/${item.slug}`} className="entity">{item.logoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={item.logoUrl} alt="" style={{ width: 31, height: 31, borderRadius: 9, objectFit: "cover", background: item.accent }} />
          ) : (
            <span className="entity-mark" style={{ background: item.accent }}>{item.name.slice(0, 1)}</span>
          )}<span>{item.name}</span></Link></td>
          <td>{item.manufacturer ?? "--"}</td>
          <td>{item.category}</td>
          <td>{item.country ?? "--"}</td>
          <td><span className="api-pill">{item.availability}</span></td>
          <td>{item.price ?? "--"}</td>
          <td>{fmtRelease(item.releaseDate) !== "--" ? fmtRelease(item.releaseDate) : (item.releaseDate ?? "--")}</td>
          <td><span className="task-pill">{item.task}</span></td>
          <td><span style={{ display: "inline-flex", gap: 8 }}><button onClick={()=>handleShare(item.slug)} aria-label="Share" style={{ border:"1px solid #2d2b31", background:"#1a1a20", color:"#cfc9d4", width:28, height:28, borderRadius:999, display:"grid", placeItems:"center", cursor:"pointer", fontSize:12 }}>⤴</button><button aria-label="Bookmark" title="Save device (coming soon)" style={{ border:"1px solid #2d2b31", background:"#1a1a20", color:"#cfc9d4", width:28, height:28, borderRadius:999, display:"grid", placeItems:"center", fontSize:12 }}>☆</button></span></td>
        </tr>)}</tbody>
      </table>
      ) : resource === "robots" ? (
      <table className="directory-table robots">
        <thead><tr><th>NAME</th><th>CATEGORY</th><th>COMPANY</th><th>COUNTRY</th><th>AVAILABILITY</th><th>PRICE</th><th>RELEASE DATE</th></tr></thead>
        <tbody>{visible.map((item: any) => <tr key={item.slug}>
          <td><Link href={`/${resource}/${item.slug}`} className="entity">{item.logoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={item.logoUrl} alt="" style={{ width: 31, height: 31, borderRadius: 9, objectFit: "cover", background: item.accent }} />
          ) : (
            <span className="entity-mark" style={{ background: item.accent }}>{item.name.slice(0, 1)}</span>
          )}<span>{item.name}</span></Link></td>
          <td>{item.category}</td>
          <td>{item.company ?? "--"}</td>
          <td>{item.country ?? "--"}</td>
          <td><span className="api-pill">{item.availability}</span></td>
          <td>{item.price ?? "--"}</td>
          <td>{fmtRelease(item.releaseDate)}</td>
        </tr>)}</tbody>
      </table>
      ) : resource === "repositories" ? (
      <table className="directory-table repositories">
        <thead><tr><th>Repository</th><th>company</th><th>stars</th><th>forks</th><th>license</th><th>updated</th></tr></thead>
        <tbody>{visible.map((item: any) => <tr key={item.slug}>
          <td><Link href={`/${resource}/${item.slug}`} className="entity">{item.logoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={item.logoUrl} alt="" style={{ width: 31, height: 31, borderRadius: 9, objectFit: "cover", background: item.accent }} />
          ) : (
            <span className="entity-mark" style={{ background: item.accent }}>{item.name.slice(0, 1)}</span>
          )}<span>{item.name}</span></Link></td>
          <td>{item.owner ?? "--"}</td>
          <td>{(item.stars ?? 0).toLocaleString("en-US")}</td>
          <td>{(item.forks ?? 0).toLocaleString("en-US")}</td>
          <td>{item.license ?? "--"}</td>
          <td>{fmtRelease(item.syncedAt)}</td>
        </tr>)}</tbody>
      </table>
      ) : resource === "mcp" ? (
      <table className="directory-table mcp">
        <thead><tr><th>MCP ITEM</th><th>COMPANY</th><th>TYPE</th><th>CLASSIFICATION</th><th>PRICING</th><th>RELEASED</th></tr></thead>
        <tbody>{visible.map((item: any) => <tr key={item.slug}>
          <td><Link href={`/${resource}/${item.slug}`} className="entity"><span className="entity-mark" style={{ background: item.accent }}>{item.name.slice(0, 1)}</span><span>{item.name}</span></Link></td>
          <td>{item.providerName ?? "--"}</td>
          <td><span className="task-pill">{item.itemType ?? "--"}</span></td>
          <td>{item.classification ?? "--"}</td>
          <td><span className={`price-pill ${(item.pricing ?? "Freemium").toLowerCase()}`}>• {item.pricing ?? "Freemium"}</span></td>
          <td>{fmtRelease(item.releaseDate)}</td>
        </tr>)}</tbody>
      </table>
      ) : (
      <table className="directory-table">
        <thead><tr><th>{resource.slice(0, -1).toUpperCase()} ↕</th><th>DESCRIPTION</th><th>TASK</th><th>PRICING</th><th>API</th></tr></thead>
        <tbody>{visible.map((item) => <tr key={item.slug}>
          <td><Link href={`/${resource}/${item.slug}`} className="entity"><span className="entity-mark" style={{ background: item.accent }}>{item.name.slice(0, 1)}</span><span>{item.name}{item.verified && <i title="Verified">✓</i>}</span></Link></td>
          <td className="description">{item.description}</td>
          <td><span className="task-pill">{item.task}</span></td>
          <td><span className={`price-pill ${item.pricing.toLowerCase()}`}>• {item.pricing}</span></td>
          <td><span className={item.api ? "api-pill yes" : "api-pill"}>{item.api ? "YES" : "NO"}</span></td>
        </tr>)}</tbody>
      </table>
      )}
      {!visible.length && <div className="empty-results"><strong>No {resource} match your filters</strong><span>Try a different search term or clear a filter.</span></div>}
    </div>
    {toast && <div style={{ position:"fixed", bottom:16, right:16, background:"#18181b", color:"white", padding:"10px 14px", borderRadius:10, fontSize:13, boxShadow:"0 8px 24px rgba(0,0,0,.4)", zIndex:50 }}>{toast}</div>}
    <ProfessionalPagination
      page={page}
      totalPages={pages}
      totalCount={filtered.length}
      pageSize={pageSize}
      pageSizeOptions={[10, 25, 50, 100]}
      onPageChange={setPage}
      onPageSizeChange={(size) => { setPageSize(size); setPage(1); }}
      label={resource}
    />
  </section>;
}
