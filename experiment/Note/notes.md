# Experiment — MCPs Data Notes

## Source
Endpoint: `https://ai-orbit.palamrendra-pm.workers.dev/api/v1/mcps?page=1&limit=5`
Mirrored on site: `https://aiorbit.club/mcp` (client fetches same workers.dev `mcps` via `/_next/static/chunks/0bb8ud3z3r43p.js`)

## Structure
Response: `{"success":true,"data":{"items":[...], "total":209, "page":1, "totalPages":3}}`
Each item has 43 fields: `id, slug, name, itemType, shortDescription, fullDescription, providerName, license, pricingType, qualityScore, categories, etc.`

## Retrieve (2 lines)
```bash
curl "https://ai-orbit.palamrendra-pm.workers.dev/api/v1/mcps?page=1&limit=5"
# -> JSON with success/data/items[5], total 209
```

# Experiment — Tools Data Notes

## Source
Endpoint: `https://ai-orbit.palamrendra-pm.workers.dev/api/v1/tools?page=1&pageSize=100`
Mirrored on site: `https://aiorbit.club/tools` (client fetches same workers.dev `tools` via `ToolsClient` in `/_next/static/chunks/77019.*.js` + `0bb8ud3z3r43p.js` `cachedFetchJson`; `GlobalHero` in `82125` also fetches `api/v1/tools?page=1&pageSize=50`)
Category variants: `/api/v1/tools/category/personal` and `/api/v1/tools/category/creativity` (same pagination)
Params: `page` (1-indexed), `pageSize` (honored, max 100), `limit` (capped -> always 100), filters: `q, pricing, sort, category`

## Structure
Response: `{"tools":[...], "total":1510, "page":1, "totalPages":16, "sort":"newest", "categories":[...81]}`
Each item has 24 fields: `id, slug, name, logoUrl, description, pricingModel, pricingAmount, billingFrequency, avgRating, createdAt, releaseDate, isOpenSource, isTrending, verified, upvoteCount, compatibility, launchDate, hasApi, useCases, categories, tags, ttasks, _count, company`
`_count: {reviews, bookmarks}`, `ttasks: [{task:{slug, title}}]`, `categories/tags/compatibility` often `[]`

## Retrieve (2 lines)
```bash
curl "https://ai-orbit.palamrendra-pm.workers.dev/api/v1/tools?page=1&pageSize=5"
# -> JSON with tools[5], total 1510, totalPages 16 (cap 100/page, use pageSize; last page 16 has 10)
```

# Experiment — Agents Data Notes

## Source
Endpoint: `https://ai-orbit.palamrendra-pm.workers.dev/api/v1/agents?page=1&pageSize=5`
Mirrored on site: `https://aiorbit.club/agents` (client fetches same workers.dev `agents` via `28762` + `0bb8ud3z3r43p.js` `cachedFetchJson`)

## Structure
Response: `{"agents":[...], "tools":[...], "total":10, "page":1, "totalPages":2, "sort":"newest", "categories":[...]}`
Each agent has 36 fields: `id, slug, name, description, websiteUrl, logoUrl, category, categorySlug, primaryTask, pricingModel, pricingRaw, hasApi, isOpenSource, isTrending, verified, compatibility, source, avgRating, reviewCount, upvoteCount, views, shortDescription, longDescription, features, useCases, integrations, apiDocsUrl, githubUrl, provider, providerWebsite, releaseDate, pros, cons, createdAt, updatedAt, isVerified, ttasks`
`ttasks: [{task:{slug, title}}]`, `tools` is co-returned (1 per page) for related tools

## Retrieve (2 lines)
```bash
curl "https://ai-orbit.palamrendra-pm.workers.dev/api/v1/agents?page=1&pageSize=5"
# -> JSON with agents[5], total 10, totalPages 2
```

# Experiment — Tasks Data Notes

## Source
Endpoint: `https://ai-orbit.palamrendra-pm.workers.dev/api/v1/tasks?page=1&limit=5`
Mirrored on site: `https://aiorbit.club/tasks` (client fetches same workers.dev `tasks` via `94476` + `28762` `cachedFetchJson`)

## Structure
Response: `{"tasks":[...], "total":115, "page":1, "totalPages":2, "sort":"newest", "categories":[...]}`
Each item has 19 fields: `id, title, slug, description, iconUrl, category{id,name,slug}, creator, difficulty, pricingModel, isFeatured, createdAt, likes, subscribers, saves, resources, tools, models, robots, devices`

## Retrieve (2 lines)
```bash
curl "https://ai-orbit.palamrendra-pm.workers.dev/api/v1/tasks?page=1&limit=5"
# -> JSON with tasks[5], total 115, totalPages 2
```

# Experiment — Companies Data Notes

## Source
Endpoint: `https://ai-orbit.palamrendra-pm.workers.dev/api/v1/companies?page=1&pageSize=5`
Mirrored on site: `https://aiorbit.club/companies` (client fetches same workers.dev `companies` via `28762` `fetchCompanies` + `0bb8ud3z3r43p.js`)

## Structure
Response: `{"companies":[...], "total":25780, "page":1, "pageSize":5, "totalPages":5156}`
Each item has 22 fields: `id, slug, name, logoUrl, description, website, country, city, foundedYear, type[], sector, verified, featured, valuation, fundingRaised, latestFundingRound, employeeCount, linkedinUrl, twitterUrl, views, upvotes, impressions, createdAt, updatedAt, tools[], aiModels[], _count{tools, aiModels}`

## Retrieve (2 lines)
```bash
curl "https://ai-orbit.palamrendra-pm.workers.dev/api/v1/companies?page=1&pageSize=5"
# -> JSON with companies[5], total 25780, pageSize 5
```

# Experiment — News Data Notes

## Source
Endpoint: `https://ai-orbit.palamrendra-pm.workers.dev/api/news?page=1&perPage=2` (alt `api/v1/news?page=1&limit=2`)
Mirrored on site: `https://aiorbit.club/news` (client intends `fetch(${API_URL}/api/news?page=1&perPage=50)` per `82125`)

## Structure
Currently **500 Internal server error** `{"error":"Internal server error."}` for both `/api/news` and `/api/v1/news` (2026-09-16 verified). Intended pagination `page/perPage` once fixed.

## Retrieve (2 lines)
```bash
curl "https://ai-orbit.palamrendra-pm.workers.dev/api/news?page=1&perPage=2"
# -> 500 Internal server error (blocked; intended JSON with news items once fixed)
```

# Experiment — Videos Data Notes

## Source
Endpoint: `https://ai-orbit.palamrendra-pm.workers.dev/api/videos?sort=latest&limit=2&offset=0&withCount=true` (alt `api/v1/videos`)
Mirrored on site: `https://aiorbit.club/videos` (client fetches via `64547` `buildVideosPageWithCountUrl` + `67858` `getVideosPageWithCount` -> `${API_URL}/api/videos?sort=latest&limit=&offset=&withCount=true`)

## Structure
Currently **500 Internal server error** `Invalid prisma.video.findMany() column Video.companyId does not exist` (2026-09-16 verified). Intended `{"videos":[...], "total":n}` with `sort/limit/offset/withCount`.

## Retrieve (2 lines)
```bash
curl "https://ai-orbit.palamrendra-pm.workers.dev/api/videos?sort=latest&limit=2&offset=0&withCount=true"
# -> 500 prisma error (blocked; intended videos[2] once fixed)
```

# Experiment — Robots Data Notes

## Source
Endpoint: `https://ai-orbit.palamrendra-pm.workers.dev/api/v1/robots`
Mirrored on site: `https://aiorbit.club/robots` (client fetches same workers.dev `robots` via `28762` `fetchAllRobots`)

## Structure
Response: `[...]` plain array `len 2199` (no wrapper/pagination)
Each item has 21 fields: `id, slug, name, logoUrl, thumbnailUrl, company, country, category, availability, price, releaseDate, mainTask, autonomyLevel, primaryUseCases, websiteUrl, about, specs, mediaUrls, createdAt, updatedAt, tasks[]`

## Retrieve (2 lines)
```bash
curl "https://ai-orbit.palamrendra-pm.workers.dev/api/v1/robots"
# -> JSON array len 2199
```

# Experiment — Devices Data Notes

## Source
Endpoint: `https://ai-orbit.palamrendra-pm.workers.dev/api/v1/devices`
Mirrored on site: `https://aiorbit.club/devices` (client fetches same workers.dev `devices` via `28762` `fetchAllDevices`)

## Structure
Response: `[...]` plain array `len 556` (no wrapper/pagination)
Each item has 21 fields: `id, slug, name, manufacturer, manufacturerSlug, category, availability, price, year, month, description, imageUrl, images, manufacturerLogoUrl, mainTask, mainTaskColor, formFactor, country, aiFeatures, primaryUseCases, buyUrl`

## Retrieve (2 lines)
```bash
curl "https://ai-orbit.palamrendra-pm.workers.dev/api/v1/devices"
# -> JSON array len 556
```

# Experiment — Models Data Notes

## Source
Endpoint: `https://ai-orbit.palamrendra-pm.workers.dev/api/v1/models?page=1&limit=2`
Mirrored on site: `https://aiorbit.club/models` (client fetches same workers.dev `models` via `28762` `fetchModels`)

## Structure
Response: `{"items":[...], "pagination":{"page":1,"limit":2,"total":533,"totalPages":267,"hasMore":true}, "filters":{"providers":[...], "modalities":[...]}}`
Each item has 23 fields: `id, slug, name, creator, contextWindow, parameterSize, modality, releaseDate, description, createdAt, updatedAt, providerId, websiteUrl, capabilities, apiAvailable, documentation, promptExamples, openSource, primaryTask, modelType, provider{id,slug,name,logoUrl}, subCategories[]`

## Retrieve (2 lines)
```bash
curl "https://ai-orbit.palamrendra-pm.workers.dev/api/v1/models?page=1&limit=2"
# -> JSON with items[2], pagination.total 533
```

# Experiment — Repositories Data Notes

## Source
Endpoint: `https://ai-orbit.palamrendra-pm.workers.dev/api/v1/repositories?page=1&limit=2`
Mirrored on site: `https://aiorbit.club/repositories` (client fetches same workers.dev `repositories` via `28762` `fetchRepositories`, cursor-based)

## Structure
Response: `{"items":[...], "nextCursor":"...", "hasMore":true, "total":30710}`
Each item has 17 fields: `id, slug, name, owner, ownerAvatarUrl, description, url, homepage, language, license, topics[], stars, forks, openIssues, logoUrl, githubCreatedAt, syncedAt, subCategories[], companySlug`

## Retrieve (2 lines)
```bash
curl "https://ai-orbit.palamrendra-pm.workers.dev/api/v1/repositories?page=1&limit=2"
# -> JSON with items[2], total 30710, nextCursor paginated
```

# Experiment — Personal Data Notes

## Source
Endpoint: `https://ai-orbit.palamrendra-pm.workers.dev/api/v1/tools/category/personal?page=1&pageSize=5`
Mirrored on site: `https://aiorbit.club/personal` (filtered Tools via `77019` `ToolsClient` -> `${API_URL}/api/v1/tools/category/personal`)

## Structure
Response: `{"tools":[...], "total":179, "page":1, "totalPages":2, "sort":"newest", "categories":[...]}`
Same 24-field tool schema as Tools.

## Retrieve (2 lines)
```bash
curl "https://ai-orbit.palamrendra-pm.workers.dev/api/v1/tools/category/personal?page=1&pageSize=5"
# -> JSON with tools[5], total 179
```

# Experiment — Creativity Data Notes

## Source
Endpoint: `https://ai-orbit.palamrendra-pm.workers.dev/api/v1/tools/category/creativity?page=1&pageSize=5`
Mirrored on site: `https://aiorbit.club/creativity` (filtered Tools via `77019` `ToolsClient` -> `${API_URL}/api/v1/tools/category/creativity`)

## Structure
Response: `{"tools":[...], "total":451, "page":1, "totalPages":5, "sort":"newest", "categories":[...]}`
Same 24-field tool schema as Tools.

## Retrieve (2 lines)
```bash
curl "https://ai-orbit.palamrendra-pm.workers.dev/api/v1/tools/category/creativity?page=1&pageSize=5"
# -> JSON with tools[5], total 451
```

# Experiment — Business Data Notes

## Source
Endpoint: `https://ai-orbit.palamrendra-pm.workers.dev/api/v1/tools/category/business?page=1&pageSize=5`
Mirrored on site: `https://aiorbit.club/business` (intended filtered Tools via `DirectoryRoute` same as `/personal`+`/creativity` via `frontend/src/app/personal/page.tsx:3` / `frontend/src/app/creativity/page.tsx:3`; currently static landing only)
Params: `page` (1-indexed), `pageSize` (honored, max 100), `limit` (capped -> always 100), filters: `q, pricing, sort, category`

## Structure
Response: `{"tools":[...], "total":2250, "page":1, "totalPages":450, "sort":"newest", "categories":[...]}`
Same 24-field tool schema as Tools: `id, slug, name, logoUrl, description, pricingModel, pricingAmount, billingFrequency, avgRating, createdAt, releaseDate, isOpenSource, isTrending, verified, upvoteCount, compatibility, launchDate, hasApi, useCases, categories, tags, ttasks, _count, company`
`_count: {reviews, bookmarks}`, `ttasks: [{task:{slug, title}}]`, `categories` includes `business` + `technology-it`, `workflow-automation` etc.

## Retrieve (2 lines)
```bash
curl "https://ai-orbit.palamrendra-pm.workers.dev/api/v1/tools/category/business?page=1&pageSize=5"

```

// RETRIVAL STRUCTURE OF JSON DATA

| Component | Retrieval Type | Endpoint Pattern | Records/Page | Total Records |
|---|---|---|---:|---:|
| Companies | Paginated | `/api/v1/companies?page=1&pageSize=5` | 5 | 25,780 |
| Tools | Paginated | `/api/v1/tools?page=1&pageSize=100` | 100 | 1,510 |
| Agents | Paginated | `/api/v1/agents?page=1&pageSize=5` | 5 | 10 |
| Robots | Full Array | `/api/v1/robots` | 2,199 | 2,199 |
| Devices | Full Array | `/api/v1/devices` | 556 | 556 |
| Models | Paginated | `/api/v1/models?page=1&limit=2` | 2 | 533 |
| MCPs | Paginated | `/api/v1/mcps?page=1&limit=5` | 5 | 209 |
| Tasks | Paginated | `/api/v1/tasks?page=1&limit=5` | 5 | 115 |
| Repositories | Cursor-based | `/api/v1/repositories?page=1&limit=2` | 2 | 30,710 |
| Business | Paginated + Category | `/api/v1/tools/category/business?page=1&pageSize=5` | 5 | Not verified |
| Personal | Paginated + Category | `/api/v1/tools/category/personal?page=1&pageSize=5` | 5 | 179 |
| Creativity | Paginated + Category | `/api/v1/tools/category/creativity?page=1&pageSize=5` | 5 | 451 |
| News | Intended Paginated | `/api/news?page=1&perPage=2` | — | — |
| Videos | Intended Offset | `/api/videos?sort=latest&limit=2&offset=0&withCount=true` | — | — |
