import Link from "next/link";
import { tools } from "@/lib/mock-data";
import { exploreCounts } from "@/lib/directory";

export const revalidate = 3600; // ecosystem counts change rarely — cache 1h, not per-hit

// Fallback strings (previous hardcoded copy) if the count query ever fails.
const FALLBACK = {
  tools: "1,448",
  agents: "10",
  models: "533",
  companies: "24k",
  devices: "556",
  robots: "2,199",
};

export default async function Home() {
  const c = await exploreCounts().catch(() => null);
  const fmt = (n: number | undefined, fallback: string) =>
    n == null ? fallback : n.toLocaleString("en-US");
  const explore = [
    { label: "AI Tools", href: "/tools", desc: `${fmt(c?.tools, FALLBACK.tools)} tools` },
    { label: "AI Agents", href: "/agents", desc: `${fmt(c?.agents, FALLBACK.agents)} agents` },
    { label: "AI Models", href: "/models", desc: `${fmt(c?.models, FALLBACK.models)} models` },
    { label: "AI Companies", href: "/companies", desc: `${fmt(c?.companies, FALLBACK.companies)} companies` },
    { label: "AI Devices", href: "/devices", desc: `${fmt(c?.devices, FALLBACK.devices)} devices` },
    { label: "AI Robots", href: "/robots", desc: `${fmt(c?.robots, FALLBACK.robots)} robots` },
  ];
  return (
    <div className="home-page">
      <div className="home-grid"><section className="home-panel"><p className="eyebrow">THE AI SIGNAL</p><h2>Find the right AI for what&apos;s next.</h2><p>Explore the tools, companies, and technologies shaping the AI ecosystem in one focused directory.</p><div className="featured-list">{tools.slice(0,6).map((tool) => <Link href={`/tools/${tool.slug}`} key={tool.slug}>{tool.name}<span>{tool.category}</span></Link>)}</div></section><section className="home-panel signal"><div className="signal-orbit">◒</div><p className="eyebrow">AI ORBIT</p><h2>Everything AI,<br />in orbit.</h2></section></div>
      <section><p className="eyebrow" style={{ marginTop: 34 }}>EXPLORE THE ECOSYSTEM</p><div className="explore-grid">{explore.map((entry) => <Link key={entry.href} href={entry.href}>{entry.label}<span>{entry.desc}</span></Link>)}</div></section>
    </div>
  );
}
