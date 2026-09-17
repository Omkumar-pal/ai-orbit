#!/usr/bin/env node
// Manual download from live workers.dev → backend/data/*.json
// Handles pagination aliases: page/pageSize, limit, perPage/offset
// Usage: node scripts/download.mjs  (or: WORKER_BASE=https://... node scripts/download.mjs --resource=tools)

import { writeFile, mkdir } from "node:fs/promises";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const WORKER = process.env.WORKER_BASE || "https://ai-orbit.palamrendra-pm.workers.dev";
const DATA_DIR = join(__dirname, "..", "data");

// Resource → endpoint + pagination style
const RESOURCES = {
  tools:        { path: "/api/v1/tools",        pageParam: "page", sizeParam: "pageSize" },
  tasks:        { path: "/api/v1/tasks",        pageParam: "page", sizeParam: "pageSize" },
  models:       { path: "/api/v1/models",       pageParam: "page", sizeParam: "pageSize" },
  devices:      { path: "/api/v1/devices",      pageParam: "page", sizeParam: "pageSize" },
  robots:       { path: "/api/v1/robots",       pageParam: "page", sizeParam: "pageSize" },
  repositories: { path: "/api/v1/repositories", pageParam: "page", sizeParam: "pageSize" },
  mcp:          { path: "/api/v1/mcp",          pageParam: "page", sizeParam: "limit" },
  videos:       { path: "/api/videos",          pageParam: "offset", sizeParam: "limit", sort: "sort=latest" },
  news:         { path: "/api/news",            pageParam: "page", sizeParam: "perPage" },
  companies:    { path: "/api/v1/companies",    pageParam: "page", sizeParam: "pageSize" },
};

async function fetchJson(url) {
  const res = await fetch(url);
  if (!res.ok) {
    const txt = await res.text().catch(() => "");
    throw new Error(`${url} → ${res.status} ${txt.slice(0, 200)}`);
  }
  return res.json();
}

async function downloadResource(name, cfg) {
  const { path, pageParam, sizeParam, sort } = cfg;
  const pageSize = 100;
  let page = 1;
  let all = [];
  let total = null;
  let totalPages = null;

  // Detect array key per resource: tools, tasks, models, devices, robots, repositories, items, videos, news, companies
  const arrayKeys = ["tools","tasks","models","devices","robots","repositories","items","videos","news","companies","featured"];

  console.log(`\n[${name}] GET ${WORKER}${path} ...`);
  while (true) {
    const qs = new URLSearchParams();
    if (sort) for (const kv of sort.split("&")) { const [k,v]=kv.split("="); qs.set(k,v); }
    if (pageParam === "offset") {
      qs.set("offset", String((page - 1) * pageSize));
      qs.set(sizeParam, String(pageSize));
    } else {
      qs.set(pageParam, String(page));
      qs.set(sizeParam, String(pageSize));
    }
    const url = `${WORKER}${path}?${qs.toString()}`;
    const json = await fetchJson(url);

    // Find array payload
    let arr = null;
    let keyUsed = null;
    for (const k of arrayKeys) if (Array.isArray(json[k])) { arr = json[k]; keyUsed = k; break; }
    if (!arr) {
      // Single object case (e.g., companies might return {companies:[]})
      const vals = Object.values(json);
      arr = vals.find(v => Array.isArray(v)) || [];
      keyUsed = arrayKeys.find(k => json[k]) || "unknown";
    }

    if (total === null) {
      total = json.total ?? json.totalCount ?? json.count ?? arr.length;
      totalPages = json.totalPages ?? (total ? Math.ceil(total / pageSize) : 1);
      console.log(`[${name}] total=${total} totalPages=${totalPages} key=${keyUsed}`);
    }

    all.push(...arr);
    console.log(`[${name}] page ${page} → ${arr.length} (acc ${all.length}/${total})`);

    if (arr.length < pageSize || all.length >= (total || Infinity) || page >= (totalPages || Infinity)) break;
    page++;
    // prevent infinite loop
    if (page > 100) { console.warn(`[${name}] abort >100 pages`); break; }
  }

  // Persist raw merged + meta
  await mkdir(DATA_DIR, { recursive: true });
  const outPath = join(DATA_DIR, `${name}.json`);
  await writeFile(outPath, JSON.stringify({ total: total ?? all.length, count: all.length, resource: name, fetchedAt: new Date().toISOString(), items: all }, null, 2), "utf8");
  console.log(`[${name}] ✓ wrote ${outPath} (${all.length} items)`);
  return all.length;
}

async function main() {
  const filter = process.argv.find(a => a.startsWith("--resource="))?.split("=")[1];
  const targets = filter ? [filter] : Object.keys(RESOURCES);
  for (const name of targets) {
    const cfg = RESOURCES[name];
    if (!cfg) { console.error(`Unknown resource ${name}`); continue; }
    try { await downloadResource(name, cfg); }
    catch (e) { console.error(`[${name}] ✗`, e.message); }
  }
  console.log("\nDone. Files in backend/data/");
}

main().catch(e => { console.error(e); process.exit(1); });
