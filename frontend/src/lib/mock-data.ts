export type DirectoryItem = {
  slug: string;
  name: string;
  description: string;
  category: string;
  task: string;
  pricing: "Free" | "Freemium" | "Paid";
  api: boolean;
  verified?: boolean;
  accent: string;
  isTrending?: boolean;
  popularity?: number;
  rating?: number;
  isNew?: boolean;
};

export const toolCategories = ["All", "Writing", "Image Generation", "Video Generation", "Audio", "Chatbots", "Coding", "Marketing", "Productivity", "Business", "Education", "Agents"];

export const tools: DirectoryItem[] = [
  { slug: "chatgpt-work", name: "ChatGPT Work", description: "Enterprise AI workspace for teams to reason, create, and ship together.", category: "Chatbots", task: "Build Data Tables", pricing: "Paid", api: true, verified: true, accent: "#f5f5f5", popularity: 98, rating: 4.9, isNew: true },
  { slug: "claude", name: "Claude", description: "A capable AI assistant for analysis, writing, coding, and deep research.", category: "Chatbots", task: "Build Chatbots", pricing: "Freemium", api: true, verified: true, accent: "#d7c5ad", popularity: 96, rating: 4.9, isTrending: true },
  { slug: "github-copilot", name: "GitHub Copilot", description: "Your AI pair programmer for faster development across the software lifecycle.", category: "Coding", task: "Build CI Pipelines", pricing: "Freemium", api: false, accent: "#f2f2f2", popularity: 94, rating: 4.7 },
  { slug: "adobe-firefly", name: "Adobe Firefly", description: "Generate images, video, audio, and design variations for creative work.", category: "Image Generation", task: "Design App Icons", pricing: "Freemium", api: true, accent: "#ef624e", popularity: 84, rating: 4.5, isNew: true },
  { slug: "perplexity", name: "Perplexity", description: "An answer engine that searches the web and cites sources as you explore.", category: "Productivity", task: "Research Topics", pricing: "Freemium", api: true, accent: "#2bb7a9", popularity: 92, rating: 4.8, isTrending: true },
  { slug: "midjourney", name: "Midjourney", description: "A creative engine for producing distinctive visual concepts from prompts.", category: "Image Generation", task: "Create Product Art", pricing: "Paid", api: false, accent: "#a585ff", popularity: 91, rating: 4.8 },
  { slug: "notion-ai", name: "Notion AI", description: "Write, organize, summarize, and search your connected team knowledge.", category: "Writing", task: "Draft Documents", pricing: "Freemium", api: false, accent: "#ffffff", popularity: 86, rating: 4.4, isNew: true },
  { slug: "runway", name: "Runway", description: "A creative suite for generating and editing polished AI video.", category: "Video Generation", task: "Generate Short Videos", pricing: "Freemium", api: true, accent: "#f69b45", popularity: 83, rating: 4.6, isTrending: true },
  { slug: "elevenlabs", name: "ElevenLabs", description: "Lifelike speech, dubbing, and conversational voice AI.", category: "Audio", task: "Generate Voiceovers", pricing: "Freemium", api: true, accent: "#ffffff", popularity: 89, rating: 4.7 },
  { slug: "cursor", name: "Cursor", description: "An AI-first code editor designed for building software with intent.", category: "Coding", task: "Write Production Code", pricing: "Freemium", api: false, accent: "#4d85ff", popularity: 90, rating: 4.8, isTrending: true },
  { slug: "hubspot-ai", name: "HubSpot AI", description: "AI-powered marketing, sales, and customer-service workflows.", category: "Business", task: "Qualify Leads", pricing: "Paid", api: true, accent: "#ff7a59", popularity: 78, rating: 4.3 },
  { slug: "gamma", name: "Gamma", description: "Turn ideas into clear presentations, documents, and visual stories.", category: "Presentations", task: "Create Presentations", pricing: "Free", api: false, accent: "#8c6bff", popularity: 87, rating: 4.6, isNew: true },
];

const genericSets: Record<string, string[]> = {
  models: ["GPT-5", "Claude Sonnet", "Gemini Pro", "Llama 4", "Mistral Large", "DeepSeek V3"],
  companies: ["OpenAI", "Anthropic", "Google DeepMind", "Mistral AI", "Cohere", "Perplexity"],
  agents: ["Operator", "Manus", "Devin", "Lindy", "Sierra", "Genspark"],
  devices: ["Rabbit R1", "Humane Ai Pin", "Ray-Ban Meta", "Plaud Note", "Limitless Pendant", "Friend"],
  robots: ["Figure 02", "Atlas", "Optimus", "Neo", "Digit", "Apollo"],
  repositories: ["LangChain", "Ollama", "vLLM", "ComfyUI", "Open WebUI", "LlamaIndex"],
  tasks: ["Build a chatbot", "Write a product brief", "Generate brand images", "Analyze a document", "Create a pitch deck", "Automate support"],
  mcp: ["GitHub MCP", "Figma MCP", "Notion MCP", "Slack MCP", "Postgres MCP", "Filesystem MCP"],
};

export function itemsFor(resource: string): DirectoryItem[] {
  if (resource === "tools") return tools;
  const names = genericSets[resource] ?? tools.map((item) => item.name);
  return names.map((name, index) => ({
    slug: name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, ""),
    name,
    description: `${name} is featured in the AI Orbit ${resource} directory with curated information and links.`,
    category: index % 2 ? "Featured" : "New",
    task: index % 2 ? "Explore details" : "View profile",
    pricing: index % 3 === 0 ? "Paid" : "Freemium",
    api: index % 2 === 0,
    verified: index % 3 !== 1,
    accent: ["#7357ff", "#2bb7a9", "#e58843", "#df5f89", "#518df7", "#c391ff"][index],
    isTrending: index % 3 === 0, popularity: 90 - index * 5, rating: 4.2 + (index % 4) / 5, isNew: index % 2 === 0,
  }));
}
