// Tools category filtering — exact replica of the reference UI's heuristic.
// Pills send SLUGS (not names); each slug maps to a rule with four match lists.
// A tool matches when ANY list hits. A slug with NO rule matches EVERYTHING.

export const TOOL_PILLS: { label: string; slug: string }[] = [
  { label: "All", slug: "" },
  { label: "Writing", slug: "writing" },
  { label: "Image Generation", slug: "image-generation" },
  { label: "Video Generation", slug: "video" },
  { label: "Audio", slug: "audio" },
  { label: "Chatbots", slug: "chatbots" },
  { label: "Coding", slug: "coding" },
  { label: "Marketing", slug: "marketing" },
  { label: "Productivity", slug: "productivity" },
  { label: "Business", slug: "business" },
  { label: "Education", slug: "education" },
  { label: "Agents", slug: "agents" },
  { label: "Presentations", slug: "presentations" },
  { label: "3D Generation", slug: "3d-generation" },
  { label: "No-Code AI Builders", slug: "no-code" },
  { label: "Workflow Automation", slug: "workflow-automation" },
];

export function toolPillSlug(label: string): string {
  return TOOL_PILLS.find((p) => p.label === label)?.slug ?? label;
}

// True for "" (All), pill slugs, and any rule key (e.g. raw slugs like "technology-it").
export function isToolCategorySlug(slug: string): boolean {
  if (!slug) return true;
  if (TOOL_PILLS.some((p) => p.slug === slug)) return true;
  return slug in RULES;
}

type Rule = {
  taskSlugs?: string[];
  tagSlugs?: string[];
  nameParts?: string[];
  descriptionParts?: string[];
};

const RULES: Record<string, Rule> = {
  writing: { taskSlugs: ["write-blog-posts"], nameParts: ["write", "copy", "katteb", "grammarly", "jasper", "copyai", "wordtune"], descriptionParts: ["writing", "copywriting", "blog", "essay", "content creation", "marketing copy"] },
  "image-generation": { taskSlugs: ["create-empty-states"], nameParts: ["kittl", "midjourney", "dall", "stable", "ilus", "ai-illustration", "ai-hairstyle", "pickey"], descriptionParts: ["image gen", "text-to-image", "image generator", "ai image", "generate image", "ai art", "illustration generator", "visual", "convert text to image"] },
  video: { taskSlugs: ["generate-video-scripts"], nameParts: ["filmflow", "boords", "descript"], descriptionParts: ["video", "storyboard", "film production", "screenwriting", "youtube"] },
  audio: { taskSlugs: ["transcribe-audio"], nameParts: ["otter", "fliflik"], descriptionParts: ["transcri", "voice", "audio", "speech", "meeting", "sound", "voice changer", "voice filter"] },
  chatbots: { taskSlugs: ["build-chatbots"], nameParts: ["chatbase", "poe", "character", "bot"], descriptionParts: ["chatbot", "conversational", "knowledge base", "chat with", "ai chat", "virtual assistant"] },
  coding: { taskSlugs: ["generate-code"], nameParts: ["cursor", "copilot", "codeium", "width"], descriptionParts: ["code", "coding", "developer", "programming", "software development", "engineer"] },
  marketing: { nameParts: ["bestcontent", "copyai", "impel"], descriptionParts: ["marketing", "seo", "advertising", "campaign", "lead", "automotive", "customer lifecycle"] },
  productivity: { tagSlugs: ["productivity"], taskSlugs: ["automate-workflows", "summarize-documents"], nameParts: ["notion", "otter"], descriptionParts: ["productivity", "workflow", "automat", "scheduling", "appointment", "task management", "summarize"] },
  business: { nameParts: ["mava", "truelark", "impel", "chatbase"], descriptionParts: ["business", "enterprise", "customer support", "crm", "b2b", "revenue", "sales", "corporate training"] },
  education: { nameParts: ["twixie", "yourteacher", "umu", "katteb"], descriptionParts: ["educat", "learn", "teach", "tutor", "language", "training", "course", "study", "child", "student", "foreign language"] },
  agents: { taskSlugs: ["automate-workflows"], descriptionParts: ["agent", "autonomous", "automat", "agentic"] },
  presentations: { descriptionParts: ["presentation", "slide", "pitch deck", "slideshow", "powerpoint"] },
  "3d-generation": { descriptionParts: ["3d", "three-dimensional", "3d model", "3d generat"] },
  "no-code": { nameParts: ["chatme"], descriptionParts: ["no-code", "nocode", "visual editor", "drag and drop", "without code", "web application"] },
  "workflow-automation": { taskSlugs: ["automate-workflows"], descriptionParts: ["workflow automat", "automation platform", "automate", "zapier", "integrate"] },
  "design-creative": { descriptionParts: ["design", "creative", "graphic design", "video editing", "content creation", "visual", "image editing", "art"] },
  sales: { descriptionParts: ["sales", "crm", "lead", "prospect", "outreach", "pipeline", "revenue", "deal"] },
  "customer-support": { tagSlugs: ["customer-support"], descriptionParts: ["customer support", "customer service", "help desk", "helpdesk", "support ticket", "live chat", "sentiment"] },
  "back-office": { descriptionParts: ["back office", "human resources", " hr ", "accounting", "finance", "document management", "payroll", "expense", "legal"] },
  "human-resources": { descriptionParts: ["human resources", " hr ", "employee", "workforce", "payroll", "performance review", "people operations"] },
  recruiting: { descriptionParts: ["recruit", "hiring", "candidate", "resume", "cv screening", "interview", "talent acquisition"] },
  "finance-accounting": { descriptionParts: ["accounting", "bookkeeping", "invoice", "expense", "financial", "finance", "tax", "payroll", "receipt"] },
  "legal-compliance": { descriptionParts: ["legal", "law", "contract", "compliance", "regulation", "policy", "document review"] },
  operations: { descriptionParts: ["operations", "supply chain", "logistics", "inventory", "forecast", "resource planning", "back office"] },
  "project-management": { descriptionParts: ["project management", "task management", "project planning", "roadmap", "team collaboration", "resource allocation"] },
  email: { descriptionParts: ["email", "inbox", "newsletter", "email campaign", "email assistant", "email marketing"] },
  scheduling: { descriptionParts: ["scheduling", "calendar", "appointment", "meeting", "booking"] },
  ecommerce: { descriptionParts: ["ecommerce", "e-commerce", "online store", "shopping", "retail", "product listing", "product recommendation"] },
  "writing-editing": { taskSlugs: ["write-blog-posts", "summarize-documents"], descriptionParts: ["writing", "editing", "grammar", "copywriting", "paraphras", "summariz", "business content"] },
  "technology-it": { taskSlugs: ["generate-code"], descriptionParts: ["information technology", "software development", "code assistant", "cybersecurity", "website builder", "database", "technical support", "no-code", "low-code"] },
  "data-analytics": { descriptionParts: ["data analysis", "analytics", "business intelligence", "spreadsheet", "dashboard", "reporting", "sql", "forecasting"] },
  relationships: { nameParts: ["loverr", "flave", "wowow", "wifeapp", "lovecore", "outpeach", "virtugf", "fallfor", "honeychat", "mygirl", "xmate", "aipornchat", "nsfw", "naughty", "tickles", "texthub", "bloomstories", "dreamrp", "ehentai", "realmplay", "janitor", "polybuzz", "ai-girlfriend", "alphazria", "nsfwchat", "soulfun", "joiai", "couple"], descriptionParts: ["girlfriend", "companion", "romantic", "relationship", "partner", "dating", "virtual partner", "ai girlfriend", "nsfw", "sexting", "roleplay", "intimate"] },
  learning: { nameParts: ["yourteacher", "umu"], descriptionParts: ["language practice", "foreign language", "learning platform", "corporate training", "course", "study", "lesson"] },
  "health-wellness": { descriptionParts: ["health", "wellness", "fitness", "mental health", "nutrition", "wellbeing", "medical"] },
  "personal-development": { nameParts: ["secretenergy", "ask-marcus"], descriptionParts: ["personal growth", "stoic", "self-improvement", "life coach", "motivat", "mindset", "marcus aurelius", "metaphysical", "conscious"] },
  travel: { descriptionParts: ["travel", "trip", "destination", "hotel", "flight", "itinerary"] },
  "finance-wealth": { descriptionParts: ["financ", "wealth", "invest", "money", "budget", "tax", "trading"] },
  entertainment: { nameParts: ["roastedby", "memedeck", "digital-pets", "ai-realm", "dreampal", "lore-sage", "tell-me", "storychat", "dreamrp", "roleplay-gpt", "realmplay", "bot3", "spicy-chat", "carter-chat", "figgs", "nurmonic", "robotalk", "ai-characters"], descriptionParts: ["game", "roleplay", "story", "adventure", "meme", "tamagotchi", "entertain", "rpg", "dnd", "dungeons", "fiction", "narrative", "pet simulation"] },
  "food-nutrition": { descriptionParts: ["food", "nutrition", "recipe", "meal", "diet", "cooking", "ingredient"] },
  shopping: { descriptionParts: ["shop", "ecommerce", "product recommendation", "purchase", "buy"] },
  "fashion-style": { nameParts: ["ai-hairstyle"], descriptionParts: ["fashion", "style", "hair", "outfit", "clothing", "wardrobe", "makeover"] },
  mindfulness: { descriptionParts: ["mindful", "meditat", "calm", "zen", "stress", "anxiety", "breathe", "relax"] },
  "life-coaching": { nameParts: ["huma", "halogram"], descriptionParts: ["life coach", "mentor", "emotional support", "companionship", "mood", "personal assistant", "empathetic"] },
  "home-decor": { descriptionParts: ["home decor", "interior design", "furniture", "room design"] },
  "insurance-advisor": { descriptionParts: ["insur", "coverage", "policy", "premium"] },
  "software-development": { taskSlugs: ["generate-code"], descriptionParts: ["software development", "coding", "developer", "programming", "engineer", "web application", "no-code platform"] },
  "video-creation": { nameParts: ["filmflow", "boords", "descript"], descriptionParts: ["video", "film", "storyboard", "screenwriting", "youtube", "tutorial"] },
  music: { descriptionParts: ["music", "audio", "sound", "song", "beat", "melody", "compose"] },
  "graphic-design": { nameParts: ["kittl"], descriptionParts: ["graphic design", "design creation", "poster", "banner", "logo", "visual design"] },
  "digital-art": { nameParts: ["ilus", "ai-illustration"], descriptionParts: ["digital art", "illustration", "ai art", "artwork", "artistic"] },
  brainstorming: { descriptionParts: ["brainstorm", "idea generat", "creative", "ideation", "concept"] },
  "3d-creation": { descriptionParts: ["3d", "three-dimensional"] },
  "presentation-design": { descriptionParts: ["presentation", "slide", "pitch", "deck"] },
  storytelling: { taskSlugs: ["write-blog-posts"], nameParts: ["tell-me", "lore-sage", "storychat", "dreampal"], descriptionParts: ["story", "narrative", "tale", "fiction", "children's story", "world building", "ttrpg", "fantasy world"] },
  "content-creation": { taskSlugs: ["write-blog-posts", "generate-video-scripts"], nameParts: ["bestcontent", "copyai", "filmflow"], descriptionParts: ["content creation", "content marketing", "creator", "social media content", "blog"] },
  branding: { nameParts: ["makeinfluencer"], descriptionParts: ["brand", "logo", "identity", "influencer", "monetize"] },
  "motion-graphics": { descriptionParts: ["motion", "animation", "animated", "motion graphic"] },
  "game-creation": { nameParts: ["ai-realm", "digital-pets", "lore-sage"], descriptionParts: ["game", "rpg", "dnd", "dungeons and dragons", "game master", "ttrpg", "pet simulation"] },
};

export type ToolLike = {
  name?: string | null;
  slug?: string | null;
  description?: string | null;
  company?: { name?: string | null } | null;
  useCases?: unknown;
  categories?: unknown;
  tags?: unknown;
  ttasks?: unknown;
};

const str = (v: unknown): string => (v == null ? "" : String(v));
const strArr = (v: unknown): string[] => (Array.isArray(v) ? v.map(String) : []);

function catPairs(v: unknown): { name: string; slug: string }[] {
  if (!Array.isArray(v)) return [];
  return v
    .map((c: any) => ({ name: str(c?.category?.name), slug: str(c?.category?.slug) }))
    .filter((c) => c.name || c.slug);
}

function tagSlugsOf(v: unknown): string[] {
  if (!Array.isArray(v)) return [];
  return v.map((t: any) => str(t?.tag?.slug ?? t?.slug)).filter(Boolean);
}

function tagPairs(v: unknown): { name: string; slug: string }[] {
  if (!Array.isArray(v)) return [];
  return v
    .map((t: any) => ({ name: str(t?.tag?.name ?? t?.name), slug: str(t?.tag?.slug ?? t?.slug) }))
    .filter((t) => t.name || t.slug);
}

function taskSlugsOf(v: unknown): string[] {
  if (!Array.isArray(v)) return [];
  return v.map((t: any) => str(t?.task?.slug)).filter(Boolean);
}

// Exact replica of the reference matcher. slug "" (All) or unknown slug → true.
export function matchesToolCategory(t: ToolLike, slug: string): boolean {
  if (!slug) return true;
  const rule = RULES[slug];
  if (!rule) return true;
  const slugs = taskSlugsOf(t.ttasks);
  if (rule.taskSlugs?.some((s) => slugs.includes(s))) return true;
  const tags = tagSlugsOf(t.tags);
  if (rule.tagSlugs?.some((s) => tags.includes(s))) return true;
  const hay = `${str(t.name)} ${str(t.slug)}`.toLowerCase();
  if (rule.nameParts?.some((p) => hay.includes(p.toLowerCase()))) return true;
  // Live-exact: a string useCases is spread into chars (upstream quirk), arrays spread normally.
  const uc: string[] = typeof t.useCases === "string" ? [...t.useCases] : strArr(t.useCases);
  const haystack = [
    t.name, t.slug, t.description, t.company?.name,
    ...uc,
    ...catPairs(t.categories).flatMap((c) => [c.name, c.slug]),
    ...tagPairs(t.tags).flatMap((x) => [x.name, x.slug]),
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
  return !!rule.descriptionParts?.some((p) => haystack.includes(p.toLowerCase()));
}
