#!/usr/bin/env node

import { mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = fileURLToPath(new URL(".", import.meta.url));

const WORKER_BASE =
  process.env.WORKER_BASE ||
  "https://ai-orbit.palamrendra-pm.workers.dev";

const DATA_DIR = join(__dirname, "data", "raw");

const MAX_RETRIES = 5;
const RETRY_BASE_MS = 3000;
const MAX_REQUESTS = 100000;
const INTER_REQUEST_DELAY_MS = 900;

const USER_AGENT = "AIOrbit-Raw-Archiver/2.0";

/* -------------------------------------------------------------------------- */
/* Utilities                                                                  */
/* -------------------------------------------------------------------------- */

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const now = () => new Date().toISOString();

function parseJson(text) {
  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
}

function batchOf(json, key) {
  if (!json || typeof json !== "object") {
    return [];
  }

  if (key && Array.isArray(json[key])) {
    return json[key];
  }

  for (const k of [
    "items",
    "tools",
    "agents",
    "tasks",
    "companies",
    "articles",
    "videos",
  ]) {
    if (Array.isArray(json[k])) {
      return json[k];
    }
  }

  if (Array.isArray(json.data?.items)) {
    return json.data.items;
  }

  return [];
}

function totalOf(json) {
  if (!json || typeof json !== "object") {
    return null;
  }

  for (const value of [
    json.total,
    json.totalCount,
    json.pagination?.total,
    json.data?.total,
  ]) {
    if (Number.isFinite(Number(value))) {
      return Number(value);
    }
  }

  return null;
}

function hasMoreOf(json) {
  if (!json || typeof json !== "object") {
    return null;
  }

  if (typeof json.hasMore === "boolean") {
    return json.hasMore;
  }

  if (typeof json.pagination?.hasMore === "boolean") {
    return json.pagination.hasMore;
  }

  if (typeof json.data?.hasMore === "boolean") {
    return json.data.hasMore;
  }

  return null;
}

function pagesOf(json) {
  if (!json || typeof json !== "object") {
    return null;
  }

  for (const value of [
    json.totalPages,
    json.pagination?.totalPages,
    json.data?.totalPages,
  ]) {
    if (Number.isFinite(Number(value))) {
      return Number(value);
    }
  }

  return null;
}

/*
 * Used only for auditability.
 * This is NOT a cryptographic hash.
 */
function checksum(text) {
  let h = 0x811c9dc5;

  for (let i = 0; i < text.length; i++) {
    h ^= text.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }

  return (h >>> 0).toString(16).padStart(8, "0");
}

/* -------------------------------------------------------------------------- */
/* Raw Fetch                                                                  */
/* -------------------------------------------------------------------------- */

/*
 * IMPORTANT:
 *
 * The API response is fetched as TEXT.
 * The exact response body is then written to disk.
 *
 * JSON.parse() is used only for inspection/pagination logic.
 */
async function fetchRaw(url) {
  let lastError;

  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      const response = await fetch(url, {
        headers: {
          "User-Agent": USER_AGENT,
          Accept: "application/json",
        },
      });

      const body = await response.text();

      if (response.ok) {
        return {
          ok: true,
          status: response.status,
          headers: Object.fromEntries(response.headers.entries()),
          body,
          attempts: attempt,
        };
      }

      const retryable =
        response.status === 429 ||
        response.status >= 500;

      if (retryable && attempt < MAX_RETRIES) {
        const retryAfter = Number(
          response.headers.get("retry-after")
        );

        await sleep(
          Number.isFinite(retryAfter)
            ? retryAfter * 1000
            : RETRY_BASE_MS * attempt
        );

        continue;
      }

      return {
        ok: false,
        status: response.status,
        headers: Object.fromEntries(response.headers.entries()),
        body,
        attempts: attempt,
      };
    } catch (error) {
      lastError = error;

      if (attempt < MAX_RETRIES) {
        await sleep(RETRY_BASE_MS * attempt);
      }
    }
  }

  throw lastError || new Error("Unknown fetch error");
}

/* -------------------------------------------------------------------------- */
/* Saving                                                                     */
/* -------------------------------------------------------------------------- */

async function saveResponse(
  component,
  requestNo,
  url,
  result,
  extra = {}
) {
  const dir = join(DATA_DIR, component);

  await mkdir(dir, {
    recursive: true,
  });

  const file =
    `response-${String(requestNo).padStart(6, "0")}.json`;

  const filePath = join(dir, file);

  /*
   * DO NOT JSON.stringify() HERE.
   *
   * We want the original HTTP response body.
   */
  await writeFile(
    filePath,
    result.body,
    "utf8"
  );

  return {
    file,
    url,
    status: result.status,
    bytes: Buffer.byteLength(
      result.body,
      "utf8"
    ),
    checksum: checksum(result.body),
    savedAt: now(),
    ...extra,
  };
}

async function saveError(
  component,
  requestNo,
  url,
  result
) {
  const dir = join(
    DATA_DIR,
    component,
    "errors"
  );

  await mkdir(dir, {
    recursive: true,
  });

  const file =
    `error-${String(requestNo).padStart(6, "0")}.json`;

  const filePath = join(dir, file);

  const errorRecord = {
    component,
    requestNo,
    url,
    status: result.status,
    headers: result.headers,
    body: result.body,
    attempts: result.attempts,
    capturedAt: now(),
  };

  await writeFile(
    filePath,
    JSON.stringify(
      errorRecord,
      null,
      2
    ),
    "utf8"
  );

  return `errors/${file}`;
}

/* -------------------------------------------------------------------------- */
/* Request + Save                                                             */
/* -------------------------------------------------------------------------- */

async function requestAndSave(
  component,
  manifest,
  url,
  extra = {}
) {
  const result = await fetchRaw(url);

  manifest.requestsMade++;

  if (!result.ok) {
    manifest.errors.push(
      await saveError(
        component,
        manifest.requestsMade,
        url,
        result
      )
    );

    throw new Error(
      `HTTP ${result.status}`
    );
  }

  manifest.responses.push(
    await saveResponse(
      component,
      manifest.requestsMade,
      url,
      result,
      extra
    )
  );

  await sleep(INTER_REQUEST_DELAY_MS);

  return parseJson(result.body);
}

/* -------------------------------------------------------------------------- */
/* Full Array                                                                 */
/* -------------------------------------------------------------------------- */

async function flatArray(cfg, manifest) {
  const url =
    `${WORKER_BASE}${cfg.path}`;

  const json = await requestAndSave(
    cfg.name,
    manifest,
    url,
    {
      page: 1,
    }
  );

  if (!Array.isArray(json)) {
    throw new Error(
      "Expected top-level JSON array."
    );
  }

  manifest.downloadedRecords =
    json.length;

  manifest.reportedTotal =
    json.length;

  manifest.exhausted = true;

  manifest.pagination = {
    type: "array",
    requests: 1,
  };
}

/* -------------------------------------------------------------------------- */
/* Page Number                                                                */
/* -------------------------------------------------------------------------- */

async function pageNumber(
  cfg,
  manifest
) {
  let page = 1;
  let downloaded = 0;
  let total = null;
  let totalPages = null;

  while (
    manifest.requestsMade <
    MAX_REQUESTS
  ) {
    const url = new URL(
      `${WORKER_BASE}${cfg.path}`
    );

    url.searchParams.set(
      cfg.pageParam,
      String(page)
    );

    url.searchParams.set(
      cfg.sizeParam,
      String(cfg.pageSize)
    );

    const json =
      await requestAndSave(
        cfg.name,
        manifest,
        url.toString(),
        {
          page,
        }
      );

    if (!json) {
      throw new Error(
        `Invalid JSON on page ${page}.`
      );
    }

    const batch =
      batchOf(
        json,
        cfg.dataKey
      );

    downloaded +=
      batch.length;

    if (total === null) {
      total = totalOf(json);
    }

    /*
     * totalPages is stored only for diagnostics.
     * It is NOT a stop condition.
     */
    if (totalPages === null) {
      totalPages =
        pagesOf(json);
    }

    process.stdout.write(
      `\r[${cfg.name}] ` +
      `page=${page} ` +
      `batch=${batch.length} ` +
      `downloaded=${downloaded}` +
      `${total !== null
        ? ` total=${total}`
        : ""}`
    );

    const hasMore =
      hasMoreOf(json);

    /*
     * DEFINITIVE stop conditions:
     *
     * 1. API explicitly says no more records.
     * 2. Batch is empty.
     * 3. Batch is shorter than requested page size.
     * 4. Reported total has been reached.
     *
     * totalPages is advisory only.
     */
    if (hasMore === false) {
      break;
    }

    if (batch.length === 0) {
      break;
    }

    if (
      batch.length <
      cfg.pageSize
    ) {
      break;
    }

    if (
      total !== null &&
      downloaded >= total
    ) {
      break;
    }

    page++;
  }

  console.log();

  if (
    manifest.requestsMade >=
    MAX_REQUESTS
  ) {
    throw new Error(
      "Maximum request safety limit reached."
    );
  }

  manifest.downloadedRecords =
    downloaded;

  manifest.reportedTotal =
    total;

  manifest.reportedTotalPages =
    totalPages;

  manifest.exhausted =
    total === null
      ? true
      : downloaded >= total;

  manifest.pagination = {
    type: "page-number",
    pageParam:
      cfg.pageParam,
    sizeParam:
      cfg.sizeParam,
    requestedPageSize:
      cfg.pageSize,
    pagesDownloaded:
      page,
  };
}

/* -------------------------------------------------------------------------- */
/* MCPs                                                                       */
/* -------------------------------------------------------------------------- */

async function mcps(
  cfg,
  manifest
) {
  let page = 1;
  let downloaded = 0;
  let total = null;
  let totalPages = null;

  while (
    manifest.requestsMade <
    MAX_REQUESTS
  ) {
    const url =
      `${WORKER_BASE}/api/v1/mcps` +
      `?page=${page}` +
      `&limit=${cfg.pageSize}`;

    const json =
      await requestAndSave(
        cfg.name,
        manifest,
        url,
        {
          page,
        }
      );

    const batch =
      json?.data?.items;

    if (!Array.isArray(batch)) {
      throw new Error(
        `MCP page ${page} missing data.items[].`
      );
    }

    downloaded +=
      batch.length;

    if (
      total === null &&
      Number.isFinite(
        Number(json?.data?.total)
      )
    ) {
      total =
        Number(
          json.data.total
        );
    }

    /*
     * Advisory only.
     */
    if (
      totalPages === null &&
      Number.isFinite(
        Number(
          json?.data?.totalPages
        )
      )
    ) {
      totalPages =
        Number(
          json.data.totalPages
        );
    }

    process.stdout.write(
      `\r[mcps] ` +
      `page=${page} ` +
      `batch=${batch.length} ` +
      `downloaded=${downloaded}` +
      `${total !== null
        ? ` total=${total}`
        : ""}`
    );

    /*
     * Definitive stop conditions only.
     */
    if (
      json?.data?.hasMore ===
      false
    ) {
      break;
    }

    if (batch.length === 0) {
      break;
    }

    if (
      batch.length <
      cfg.pageSize
    ) {
      break;
    }

    if (
      total !== null &&
      downloaded >= total
    ) {
      break;
    }

    page++;
  }

  console.log();

  if (
    manifest.requestsMade >=
    MAX_REQUESTS
  ) {
    throw new Error(
      "Maximum request safety limit reached."
    );
  }

  manifest.downloadedRecords =
    downloaded;

  manifest.reportedTotal =
    total;

  manifest.reportedTotalPages =
    totalPages;

  manifest.exhausted =
    total === null
      ? true
      : downloaded >= total;

  manifest.pagination = {
    type: "page-number",
    pageParam: "page",
    sizeParam: "limit",
    requestedPageSize:
      cfg.pageSize,
    pagesDownloaded:
      page,
  };
}

/* -------------------------------------------------------------------------- */
/* Cursor                                                                     */
/* -------------------------------------------------------------------------- */

async function cursor(
  cfg,
  manifest
) {
  let cursor = null;
  let downloaded = 0;
  let total = null;
  let batchNo = 0;

  const seen =
    new Set();

  while (
    manifest.requestsMade <
    MAX_REQUESTS
  ) {
    batchNo++;

    const url = new URL(
      `${WORKER_BASE}/api/v1/repositories`
    );

    url.searchParams.set(
      "limit",
      String(cfg.pageSize)
    );

    if (cursor) {
      url.searchParams.set(
        "cursor",
        cursor
      );
    }

    const json =
      await requestAndSave(
        cfg.name,
        manifest,
        url.toString(),
        {
          batch: batchNo,
          cursorUsed:
            cursor,
        }
      );

    if (!json) {
      throw new Error(
        `Invalid JSON in repository batch ${batchNo}.`
      );
    }

    const batch =
      Array.isArray(json.items)
        ? json.items
        : [];

    downloaded +=
      batch.length;

    if (
      total === null &&
      Number.isFinite(
        Number(json.total)
      )
    ) {
      total =
        Number(json.total);
    }

    process.stdout.write(
      `\r[repositories] ` +
      `batch=${batchNo} ` +
      `batchSize=${batch.length} ` +
      `downloaded=${downloaded}` +
      `${total !== null
        ? ` total=${total}`
        : ""}`
    );

    if (
      total !== null &&
      downloaded >= total
    ) {
      break;
    }

    if (
      json.hasMore === false
    ) {
      break;
    }

    if (
      !json.nextCursor
    ) {
      break;
    }

    if (
      batch.length === 0
    ) {
      break;
    }

    const next =
      String(
        json.nextCursor
      );

    if (
      seen.has(next)
    ) {
      throw new Error(
        "Repeated nextCursor detected."
      );
    }

    seen.add(next);

    cursor = next;
  }

  console.log();

  if (
    manifest.requestsMade >=
    MAX_REQUESTS
  ) {
    throw new Error(
      "Maximum request safety limit reached."
    );
  }

  manifest.downloadedRecords =
    downloaded;

  manifest.reportedTotal =
    total;

  manifest.exhausted =
    total === null
      ? true
      : downloaded >= total;

  manifest.pagination = {
    type: "cursor",
    cursorParam: "cursor",
    requestedPageSize:
      cfg.pageSize,
    batchesDownloaded:
      batchNo,
  };
}

/* -------------------------------------------------------------------------- */
/* Offset                                                                     */
/* -------------------------------------------------------------------------- */

async function offset(
  cfg,
  manifest
) {
  let currentOffset = 0;
  let downloaded = 0;
  let total = null;

  while (
    manifest.requestsMade <
    MAX_REQUESTS
  ) {
    const url = new URL(
      `${WORKER_BASE}/api/videos`
    );

    url.searchParams.set(
      "sort",
      "latest"
    );

    url.searchParams.set(
      "limit",
      String(cfg.pageSize)
    );

    url.searchParams.set(
      "offset",
      String(currentOffset)
    );

    url.searchParams.set(
      "withCount",
      "true"
    );

    const json =
      await requestAndSave(
        cfg.name,
        manifest,
        url.toString(),
        {
          offset:
            currentOffset,
        }
      );

    if (!json) {
      throw new Error(
        `Invalid JSON at offset ${currentOffset}.`
      );
    }

    const batch =
      Array.isArray(
        json.videos
      )
        ? json.videos
        : [];

    downloaded +=
      batch.length;

    if (
      total === null &&
      Number.isFinite(
        Number(json.total)
      )
    ) {
      total =
        Number(json.total);
    }

    process.stdout.write(
      `\r[videos] ` +
      `offset=${currentOffset} ` +
      `batch=${batch.length} ` +
      `downloaded=${downloaded}` +
      `${total !== null
        ? ` total=${total}`
        : ""}`
    );

    if (
      total !== null &&
      downloaded >= total
    ) {
      break;
    }

    if (
      batch.length === 0
    ) {
      break;
    }

    if (
      batch.length <
      cfg.pageSize
    ) {
      break;
    }

    currentOffset +=
      cfg.pageSize;
  }

  console.log();

  if (
    manifest.requestsMade >=
    MAX_REQUESTS
  ) {
    throw new Error(
      "Maximum request safety limit reached."
    );
  }

  manifest.downloadedRecords =
    downloaded;

  manifest.reportedTotal =
    total;

  manifest.exhausted =
    total === null
      ? true
      : downloaded >= total;

  manifest.pagination = {
    type: "offset",
    limitParam: "limit",
    offsetParam: "offset",
    requestedPageSize:
      cfg.pageSize,
    batchesDownloaded:
      manifest.requestsMade,
  };
}

/* -------------------------------------------------------------------------- */
/* Components                                                                 */
/* -------------------------------------------------------------------------- */

const COMPONENTS = [
  {
    name: "companies",
    type: "pageNumber",
    path: "/api/v1/companies",
    pageSize: 100,
    pageParam: "page",
    sizeParam: "pageSize",
    dataKey: "companies",
  },

  {
    name: "tools",
    type: "pageNumber",
    path: "/api/v1/tools",
    pageSize: 100,
    pageParam: "page",
    sizeParam: "pageSize",
    dataKey: "tools",
  },

  {
    name: "agents",
    type: "pageNumber",
    path: "/api/v1/agents",
    pageSize: 100,
    pageParam: "page",
    sizeParam: "pageSize",
    dataKey: "agents",
  },

  {
    name: "robots",
    type: "flatArray",
    path: "/api/v1/robots",
  },

  {
    name: "devices",
    type: "flatArray",
    path: "/api/v1/devices",
  },

  {
    name: "models",
    type: "pageNumber",
    path: "/api/v1/models",
    pageSize: 100,
    pageParam: "page",
    sizeParam: "limit",
    dataKey: "items",
  },

  {
    name: "mcps",
    type: "mcps",
    pageSize: 100,
  },

  {
    name: "tasks",
    type: "pageNumber",
    path: "/api/v1/tasks",
    pageSize: 100,
    pageParam: "page",
    sizeParam: "limit",
    dataKey: "tasks",
  },

  {
    name: "repositories",
    type: "cursor",
    pageSize: 100,
  },

  {
    name: "business",
    type: "pageNumber",
    path: "/api/v1/tools/category/business",
    pageSize: 100,
    pageParam: "page",
    sizeParam: "pageSize",
    dataKey: "tools",
  },

  {
    name: "personal",
    type: "pageNumber",
    path: "/api/v1/tools/category/personal",
    pageSize: 20,
    pageParam: "page",
    sizeParam: "pageSize",
    dataKey: "tools",
  },

  {
    name: "creativity",
    type: "pageNumber",
    path: "/api/v1/tools/category/creativity",
    pageSize: 100,
    pageParam: "page",
    sizeParam: "pageSize",
    dataKey: "tools",
  },

  {
    name: "news",
    type: "pageNumber",
    path: "/api/news",
    pageSize: 50,
    pageParam: "page",
    sizeParam: "perPage",
    dataKey: "articles",
  },

  {
    name: "videos",
    type: "offset",
    pageSize: 50,
  },
];

/* -------------------------------------------------------------------------- */
/* Preview                                                                    */
/* -------------------------------------------------------------------------- */

async function previewComponent(
  cfg
) {
  let url;

  if (
    cfg.type ===
    "flatArray"
  ) {
    url =
      `${WORKER_BASE}${cfg.path}`;
  } else if (
    cfg.type ===
    "mcps"
  ) {
    url =
      `${WORKER_BASE}/api/v1/mcps?page=1&limit=1`;
  } else if (
    cfg.type ===
    "cursor"
  ) {
    url =
      `${WORKER_BASE}/api/v1/repositories?limit=1`;
  } else if (
    cfg.type ===
    "offset"
  ) {
    url =
      `${WORKER_BASE}/api/videos?sort=latest&limit=1&offset=0&withCount=true`;
  } else {
    const tempUrl =
      new URL(
        `${WORKER_BASE}${cfg.path}`
      );

    tempUrl.searchParams.set(
      cfg.pageParam,
      "1"
    );

    tempUrl.searchParams.set(
      cfg.sizeParam,
      "1"
    );

    url =
      tempUrl.toString();
  }

  try {
    const result =
      await fetchRaw(url);

    if (!result.ok) {
      return {
        component:
          cfg.name,
        status:
          "unavailable",
        httpStatus:
          result.status,
        total: null,
        url,
      };
    }

    const json =
      parseJson(
        result.body
      );

    /*
     * For array endpoints the preview necessarily
     * receives the entire array because the API
     * has no pagination mechanism.
     */
    if (
      cfg.type ===
      "flatArray"
    ) {
      return {
        component:
          cfg.name,
        status:
          "available",
        httpStatus:
          result.status,
        total:
          Array.isArray(json)
            ? json.length
            : null,
        url,
      };
    }

    let total = null;

    if (
      cfg.type ===
      "mcps"
    ) {
      total =
        Number.isFinite(
          Number(
            json?.data?.total
          )
        )
          ? Number(
            json.data.total
          )
          : null;
    } else {
      total =
        totalOf(json);
    }

    return {
      component:
        cfg.name,
      status:
        "available",
      httpStatus:
        result.status,
      total,
      url,
    };
  } catch (error) {
    return {
      component:
        cfg.name,
      status:
        "unavailable",
      httpStatus:
        null,
      total:
        null,
      url,
      error:
        error.message,
    };
  }
}

/* -------------------------------------------------------------------------- */
/* Confirmation                                                               */
/* -------------------------------------------------------------------------- */

async function confirmDownload(
  previews
) {
  console.log(
    `\n========================================`
  );

  console.log(
    `AIOrbit DATASET PREVIEW`
  );

  console.log(
    `========================================`
  );

  console.log(
    `The downloader will first show the current record totals.`
  );

  console.log(
    `NO raw data is saved during preview.\n`
  );

  console.log(
    "Component".padEnd(18) +
    "Status".padEnd(16) +
    "Total Records"
  );

  console.log(
    "-".repeat(55)
  );

  for (
    const item of previews
  ) {
    const total =
      item.total === null ||
        item.total === undefined
        ? "UNKNOWN"
        : item.total.toLocaleString();

    const status =
      item.status ===
        "available"
        ? "AVAILABLE"
        : `HTTP ${item.httpStatus ??
        "ERROR"
        }`;

    console.log(
      item.component.padEnd(
        18
      ) +
      status.padEnd(16) +
      total
    );
  }

  const unavailable =
    previews.filter(
      (p) =>
        p.status !==
        "available"
    );

  console.log(
    `\nUnavailable components: ${unavailable.length}`
  );

  if (
    unavailable.length >
    0
  ) {
    console.log(
      `These components will still be attempted after confirmation.`
    );

    console.log(
      `Failures will be saved under their errors/ directories.`
    );
  }

  const readline =
    await import(
      "node:readline/promises"
    );

  const {
    stdin,
    stdout,
  } = await import(
    "node:process"
  );

  const rl =
    readline.createInterface({
      input: stdin,
      output: stdout,
    });

  try {
    const answer =
      await rl.question(
        `\nConfirm: download ALL components and ALL available records? [y/N]: `
      );

    return [
      "y",
      "yes",
    ].includes(
      answer
        .trim()
        .toLowerCase()
    );
  } finally {
    rl.close();
  }
}

/* -------------------------------------------------------------------------- */
/* Component Runner                                                           */
/* -------------------------------------------------------------------------- */

async function run(
  cfg
) {
  const manifest = {
    component:
      cfg.name,

    retrievalType:
      cfg.type,

    baseUrl:
      WORKER_BASE,

    endpointPattern:
      cfg.path || null,

    startedAt:
      now(),

    completedAt:
      null,

    status:
      "running",

    requestedPageSize:
      cfg.pageSize ??
      null,

    reportedTotal:
      null,

    downloadedRecords:
      0,

    requestsMade:
      0,

    exhausted:
      false,

    pagination:
      null,

    responses:
      [],

    errors:
      [],
  };

  console.log(
    `\n=== ${cfg.name} ===`
  );

  const start =
    Date.now();

  try {
    if (
      cfg.type ===
      "flatArray"
    ) {
      await flatArray(
        cfg,
        manifest
      );
    } else if (
      cfg.type ===
      "pageNumber"
    ) {
      await pageNumber(
        cfg,
        manifest
      );
    } else if (
      cfg.type ===
      "mcps"
    ) {
      await mcps(
        cfg,
        manifest
      );
    } else if (
      cfg.type ===
      "cursor"
    ) {
      await cursor(
        cfg,
        manifest
      );
    } else if (
      cfg.type ===
      "offset"
    ) {
      await offset(
        cfg,
        manifest
      );
    } else {
      throw new Error(
        `Unknown type: ${cfg.type}`
      );
    }

    manifest.status =
      manifest.exhausted
        ? "complete"
        : "incomplete";
  } catch (error) {
    manifest.status =
      "failed";

    manifest.failure = {
      message:
        error.message,
      capturedAt:
        now(),
    };
  }

  manifest.completedAt =
    now();

  manifest.durationSeconds =
    Number(
      (
        (Date.now() -
          start) /
        1000
      ).toFixed(2)
    );

  const dir =
    join(
      DATA_DIR,
      cfg.name
    );

  await mkdir(dir, {
    recursive:
      true,
  });

  await writeFile(
    join(
      dir,
      "manifest.json"
    ),
    JSON.stringify(
      manifest,
      null,
      2
    ),
    "utf8"
  );

  console.log(
    `${manifest.status ===
      "complete"
      ? "✓"
      : "✗"
    } ${cfg.name}: ` +
    `${manifest.downloadedRecords}` +
    `${manifest.reportedTotal !==
      null
      ? ` / ${manifest.reportedTotal}`
      : ""
    } records`
  );

  return manifest;
}

/* -------------------------------------------------------------------------- */
/* Main                                                                       */
/* -------------------------------------------------------------------------- */

async function main() {
  const arg =
    process.argv.find(
      (a) =>
        a.startsWith(
          "--component="
        )
    );

  const rawArg =
    arg?.split("=")[1];

  const requestedList =
    rawArg === "incomplete"
      ? [
          "repositories",
          "business",
          "personal",
          "creativity",
          "news",
          "videos",
        ]
      : rawArg?.split(",").map((s) => s.trim());

  const selected =
    requestedList
      ? COMPONENTS.filter(
          (c) =>
            requestedList.includes(c.name)
        )
      : COMPONENTS;

  if (
    requestedList &&
    selected.length === 0
  ) {
    console.error(
      `Unknown component(s) "${rawArg}".`
    );

    console.error(
      `Available: ${COMPONENTS.map(
        (c) => c.name
      ).join(", ")}`
    );

    process.exit(1);
  }

  await mkdir(
    DATA_DIR,
    {
      recursive:
        true,
    }
  );

  console.log(
    `AIOrbit Raw Archiver`
  );

  console.log(
    `Base: ${WORKER_BASE}`
  );

  console.log(
    `Output: ${DATA_DIR}`
  );

  console.log(
    `Components selected: ${selected.length}`
  );

  /*
   * PHASE 1 — PREVIEW
   */
  console.log(
    `\nChecking current record totals...`
  );

  const previews =
    [];

  for (
    const cfg of selected
  ) {
    const preview =
      await previewComponent(
        cfg
      );

    previews.push(
      preview
    );
  }

  /*
   * PHASE 2 — HUMAN CONFIRMATION
   */
  const confirmed =
    await confirmDownload(
      previews
    );

  if (!confirmed) {
    console.log(
      `\nDownload cancelled.`
    );

    console.log(
      `No raw dataset was downloaded.`
    );

    process.exit(0);
  }

  /*
   * PHASE 3 — EXHAUSTIVE DOWNLOAD
   */
  console.log(
    `\nConfirmation received.`
  );

  console.log(
    `Starting exhaustive raw download...\n`
  );

  const results =
    [];

  for (
    const cfg of selected
  ) {
    results.push(
      await run(cfg)
    );
  }

  /*
   * PHASE 4 — FINAL SUMMARY
   */
  const summary = {
    completedAt:
      now(),

    confirmed:
      true,

    previewTotals:
      previews.map(
        (p) => ({
          component:
            p.component,

          status:
            p.status,

          httpStatus:
            p.httpStatus,

          totalRecordsAtPreview:
            p.total,
        })
      ),

    results:
      results.map(
        (r) => ({
          component:
            r.component,

          status:
            r.status,

          retrievalType:
            r.retrievalType,

          reportedTotal:
            r.reportedTotal,

          downloadedRecords:
            r.downloadedRecords,

          requestsMade:
            r.requestsMade,

          exhausted:
            r.exhausted,

          errors:
            r.errors.length,

          durationSeconds:
            r.durationSeconds,
        })
      ),
  };

  await writeFile(
    join(
      DATA_DIR,
      "_download-summary.json"
    ),
    JSON.stringify(
      summary,
      null,
      2
    ),
    "utf8"
  );

  console.log(
    `\n========================================`
  );

  console.log(
    `FINAL DOWNLOAD SUMMARY`
  );

  console.log(
    `========================================`
  );

  for (
    const item of
    summary.results
  ) {
    console.log(
      `${item.status ===
        "complete"
        ? "✓"
        : "✗"
      } ${item.component}: ` +
      `${item.downloadedRecords}` +
      `${item.reportedTotal !==
        null
        ? ` / ${item.reportedTotal}`
        : ""
      } records`
    );
  }
}

main().catch(
  (error) => {
    console.error(
      "\nFatal:",
      error
    );

    process.exit(1);
  }
);