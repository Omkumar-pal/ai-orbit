// Frontend API client — always hits OWN Next.js routes (/api/v1/*).
// Those routes will later proxy to Prisma/Postgres. Seed derived from live workers.dev.
const BASE = "/api/v1";

async function get<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${path}`, { ...init, next: { revalidate: 60 } as any });
  if (!res.ok) throw new Error(`${path} ${res.status}`);
  return res.json() as Promise<T>;
}

export const api = {
  featured: () => get<{ featured: { id: string; title: string; slug: string; logoUrl: string; type: string }[] }>("/search/featured"),
  popular: () => get<{ popular: string[] }>("/search/popular"),
  companies: (page = 1, pageSize = 24) => get<{ companies: any[]; total?: number }>(`/companies?page=${page}&pageSize=${pageSize}`),
  tools: (page = 1, pageSize = 24) => get<{ tools: any[] }>(`/tools?page=${page}&pageSize=${pageSize}`),
  models: (page = 1, pageSize = 24) => get<{ models: any[] }>(`/models?page=${page}&pageSize=${pageSize}`),
  agents: (page = 1, pageSize = 24) => get<{ agents: any[] }>(`/agents?page=${page}&pageSize=${pageSize}`),
  devices: (page = 1, pageSize = 24) => get<{ devices: any[] }>(`/devices?page=${page}&pageSize=${pageSize}`),
  robots: (page = 1, pageSize = 24) => get<{ robots: any[] }>(`/robots?page=${page}&pageSize=${pageSize}`),
  repositories: (page = 1, pageSize = 24) => get<{ repositories: any[] }>(`/repositories?page=${page}&pageSize=${pageSize}`),
  mcp: (page = 1, pageSize = 24) => get<{ items: any[] }>(`/mcp?page=${page}&pageSize=${pageSize}`),
  tasks: (page = 1, pageSize = 24) => get<{ tasks: any[] }>(`/tasks?page=${page}&pageSize=${pageSize}`),
  videos: (params: Record<string,string> = {}) => {
    const qs = new URLSearchParams({ sort: "latest", limit: "100", offset: "0", ...params }).toString();
    return get<{ videos: any[] }>(`/videos?${qs}`);
  },
  news: (page = 1, perPage = 50) => get<{ news: any[] }>(`/news?page=${page}&perPage=${perPage}`),
  feed: (page = 1, pageSize = 25) => get<any>(`/feed?show=tools,devices,robots,news,models&page=${page}&pageSize=${pageSize}`),
  search: (q: string) => get<any>(`/search?q=${encodeURIComponent(q)}`),
};
