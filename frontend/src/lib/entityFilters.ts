// Category matching for models / devices / robots / repositories / mcp / personal / creativity.
// Models + repositories match raw taxonomy names exactly; the rest use explicit
// keyword maps (same pattern as lib/toolFilters.ts). All matching is case-insensitive.

const norm = (v: unknown): string => (v == null ? "" : String(v));
const normArr = (v: unknown): string[] => (Array.isArray(v) ? v.map(String) : []);

// ---------- Models ----------
// Pill names equal raw subCategory names, except Embedding + Recruitment.
export function matchesModelCategory(
  item: { subCategories?: unknown; primaryTask?: string | null; capabilities?: unknown },
  pill: string
): boolean {
  if (!pill || pill === "All") return true;
  const subs = Array.isArray(item.subCategories)
    ? item.subCategories.map((s: any) => norm(s?.name))
    : [];
  if (subs.includes(pill)) return true;
  const hay = [item.primaryTask ?? "", ...normArr(item.capabilities)].join(" ").toLowerCase();
  if (pill === "Embedding") return hay.includes("embed");
  if (pill === "Recruitment") return /recruit|resume|hiring/.test(hay);
  return false;
}

// ---------- Devices ----------
// Exact port of the reference categorizer: raw category substrings first,
// then regex chain over name + description + formFactor + mainTask.
// Default pill is "Development Boards". ("All Categories" on live === "All" here.)
export function resolveDevicePill(item: {
  category?: string | null;
  name?: string | null;
  description?: string | null;
  formFactor?: string | null;
  mainTask?: string | null;
}): string {
  const a = (item.category ?? "").toLowerCase();
  const t = [item.name ?? "", item.description ?? "", item.formFactor ?? "", item.mainTask ?? ""]
    .join(" ")
    .toLowerCase();
  if (a.includes("edge ai")) return "Edge AI";
  if (a.includes("smart glasses") || a.includes("spatial") || a.includes("ar / vr")) return "AR/VR";
  if (a.includes("pocket assistant") || a.includes("wearable") || a.includes("smartwatch")) return "Wearables";
  if (a.includes("voice recorder") || a.includes("microphone")) return "Microphones";
  if (a.includes("tablet")) return "Smartphones";
  if (a.includes("development board")) return "Development Boards";
  if (a.includes("robotics")) return "Robotics Hardware";
  if (a.includes("medical")) return "Medical";
  if (/iphone|samsung galaxy|pixel\b|smartphone|oneplus|xiaomi|oppo|vivo|huawei|nexus|windows phone/.test(t))
    return "Smartphones";
  if (/laptop|notebook|macbook|thinkpad|chromebook|copilot\+ pc|desktop|workstation/.test(t)) return "AI PCs";
  if (/smart home|smart speaker|smart display|homepod|amazon echo|google nest|nest thermostat|doorbell|smart lock/.test(t))
    return "Smart Home";
  if (/smartwatch|smart ring|fitness tracker|wearable|watch\b/.test(t)) return "Wearables";
  if (/camera|webcam|security cam/.test(t)) return "AI Cameras";
  if (/headphone|earbud|speaker|audio/.test(t)) return "Audio";
  if (/virtual reality|augmented reality|mixed reality|smart glasses|vision pro|quest|hololens/.test(t)) return "AR/VR";
  if (/jetson|edge ai|edge computing|\bnpu\b/.test(t)) return "Edge AI";
  if (/robot|drone/.test(t)) return "Robotics Hardware";
  if (/medical|healthcare|clinical|glucose|ecg/.test(t)) return "Medical";
  if (/raspberry pi|arduino|development board|dev kit|microcontroller/.test(t)) return "Development Boards";
  if (/sensor|lidar|radar/.test(t)) return "Smart Sensors";
  if (/automotive|vehicle|\bcar\b|dash cam/.test(t)) return "Automotive AI Devices";
  if (/microphone|\bmic\b|voice recorder/.test(t)) return "Microphones";
  if (/farm|agri|agriculture/.test(t)) return "Farming";
  return "Development Boards";
}

export type DeviceLike = {
  name?: string | null;
  category?: string | null;
  mainTask?: string | null;
  aiFeatures?: unknown;
  primaryUseCases?: unknown;
  formFactor?: string | null;
  manufacturer?: string | null;
  description?: string | null;
};

export function matchesDeviceCategory(item: DeviceLike, pill: string): boolean {
  if (!pill || pill === "All") return true;
  return resolveDevicePill(item) === pill;
}

// ---------- Robots ----------
// Direct raw-category map first, keywords over name + mainTask + autonomyLevel +
// primaryUseCases + specs for pills with no raw value.
const ROBOT_CATEGORY_MAP: Record<string, string[]> = {
  "Humanoid Robots": ["HUMANOID"],
  Industrial: ["INDUSTRIAL"],
  Service: ["SERVICE"],
  Healthcare: ["HEALTHCARE"],
  Companion: ["COMPANION"],
  Agricultural: ["AGRICULTURAL"],
  Drones: ["DRONE"],
  "Autonomous Mobile Robots": ["MOBILE"],
  "Task-Specific": ["MANIPULATOR", "WAREHOUSE"],
  Surveillance: ["DEFENSE"],
};

const ROBOT_KEYWORDS: Record<string, string[]> = {
  Educational: ["edu", "learn", "teach", "stem", "school", "university", "classroom", "student"],
  Research: ["research", "lab", "science", "experiment"],
  "Multi-Agent": ["multi-agent", "multi agent", "swarm", "fleet"],
  "Autonomous Navigation": ["navigat", "lidar", "slam", "mapping", "autonomous"],
  "Reinforcement Learning": ["reinforcement"],
  Surveillance: ["surveil", "patrol", "monitor", "reconnaissance"],
};

export type RobotLike = {
  category?: string | null;
  name?: string | null;
  mainTask?: string | null;
  autonomyLevel?: string | null;
  primaryUseCases?: unknown;
  specs?: string | null;
  about?: string | null;
};

export function matchesRobotCategory(item: RobotLike, pill: string): boolean {
  if (!pill || pill === "All") return true;
  const cats = ROBOT_CATEGORY_MAP[pill];
  if (cats && item.category && cats.includes(item.category)) return true;
  const keys = ROBOT_KEYWORDS[pill];
  if (!keys) return false;
  const hay = [
    item.name ?? "",
    item.mainTask ?? "",
    item.autonomyLevel ?? "",
    ...normArr(item.primaryUseCases),
    item.specs ?? "",
    item.about ?? "",
  ]
    .join(" ")
    .toLowerCase();
  return keys.some((k) => hay.includes(k.toLowerCase()));
}

// ---------- Repositories ----------
// Pill names equal raw subCategory names exactly.
export function matchesRepositoryCategory(item: { subCategories?: unknown }, pill: string): boolean {
  if (!pill || pill === "All") return true;
  if (!Array.isArray(item.subCategories)) return false;
  return item.subCategories.map((s: any) => norm(s?.name)).includes(pill);
}

// ---------- MCP ----------
// Exact category/subCategory name, CLIENT itemType, then keywords.
const MCP_KEYWORDS: Record<string, string[]> = {
  Browser: ["browser", "chrome", "firefox", "web brows", "puppeteer", "playwright"],
  Community: ["community", "contributor", "forum", "discord", "open source"],
  "Specialized MCP Servers": ["specialized", "custom", "domain-specific", "niche"],
  "Testing Tools": ["test", "qa", "quality assurance", "lint"],
  "Version Control": ["git", "github", "version", "gitlab", "commit"],
  Automation: ["automa", "workflow", "zapier", "schedule", "cron"],
  "Smart Devices": ["smart", "iot", "device", "home", "alexa", "raspberry"],
  "Data Analytics": ["data", "analytic", "sql", "dashboard", "database", "warehouse", "bi tool"],
};

export type McpLike = {
  itemType?: string | null;
  name?: string | null;
  shortDescription?: string | null;
  fullDescription?: string | null;
  categories?: unknown;
  subCategories?: unknown;
  tags?: unknown;
  useCases?: unknown;
};

function mcpCatName(v: unknown): string {
  if (v && typeof v === "object" && !Array.isArray(v)) return norm((v as any).name);
  if (Array.isArray(v)) return norm((v as any[])[0]?.name);
  return norm(v);
}

function mcpTagWords(v: unknown): string[] {
  if (!Array.isArray(v)) return [];
  return v.map((t: any) => norm(t?.name ?? t?.slug ?? t));
}

export function matchesMcpCategory(item: McpLike, pill: string): boolean {
  if (!pill || pill === "All") return true;
  if (mcpCatName(item.categories) === pill) return true;
  if (mcpCatName(item.subCategories) === pill) return true;
  if (pill === "MCP Clients") return (item.itemType ?? "").toUpperCase() === "CLIENT";
  const keys = MCP_KEYWORDS[pill];
  if (!keys) return false;
  const useCases = Array.isArray(item.useCases)
    ? item.useCases.map(String)
    : item.useCases != null
      ? [String(item.useCases)]
      : [];
  const hay = [item.name ?? "", item.shortDescription ?? "", item.fullDescription ?? "", ...useCases, ...mcpTagWords(item.tags)]
    .join(" ")
    .toLowerCase();
  return keys.some((k) => hay.includes(k.toLowerCase()));
}

// ---------- Personal ----------
// Pills equal raw TOOL category names exactly.
export const PERSONAL_CATEGORIES = [
  "Relationships",
  "Education",
  "Learning",
  "Health & Wellness",
  "Personal Development",
  "Travel",
  "Finance & Wealth",
  "Entertainment",
  "Food & Nutrition",
  "Shopping",
  "Fashion & Style",
  "Mindfulness",
  "Life Coaching",
  "Home Decor",
  "Insurance Advisor",
];

export function matchesPersonalCategory(toolCategories: unknown, pill: string): boolean {
  if (!pill || pill === "All") return true;
  if (!Array.isArray(toolCategories)) return false;
  return toolCategories.map((c: any) => norm(c?.category?.name)).includes(pill);
}

// ---------- Creativity ----------
// Pills map to tool-heuristic slugs (see lib/toolFilters.ts RULES).
export const CREATIVITY_PILLS: { label: string; slug: string }[] = [
  { label: "All", slug: "" },
  { label: "Image Generation", slug: "image-generation" },
  { label: "Writing", slug: "writing" },
  { label: "Software Development", slug: "software-development" },
  { label: "Video Creation", slug: "video-creation" },
  { label: "Music", slug: "music" },
  { label: "Graphic Design", slug: "graphic-design" },
  { label: "Digital Art", slug: "digital-art" },
  { label: "Brainstorming", slug: "brainstorming" },
  { label: "3D Creation", slug: "3d-creation" },
  { label: "Presentation Design", slug: "presentation-design" },
  { label: "Storytelling", slug: "storytelling" },
  { label: "Content Creation", slug: "content-creation" },
  { label: "Branding", slug: "branding" },
  { label: "Motion Graphics", slug: "motion-graphics" },
  { label: "Game Creation", slug: "game-creation" },
];

export function creativityPillSlug(label: string): string {
  return CREATIVITY_PILLS.find((p) => p.label === label)?.slug ?? label;
}
