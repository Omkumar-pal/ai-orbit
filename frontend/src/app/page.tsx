import Link from "next/link";
import { tools } from "@/lib/mock-data";

const explore = [
  { label: "AI Tools", href: "/tools", desc: "1,448 tools" },
  { label: "AI Agents", href: "/agents", desc: "10 agents" },
  { label: "AI Models", href: "/models", desc: "533 models" },
  { label: "AI Companies", href: "/companies", desc: "24k companies" },
  { label: "AI Devices", href: "/devices", desc: "556 devices" },
  { label: "AI Robots", href: "/robots", desc: "2,199 robots" },
];
export default function Home() {
  return (
    <div className="home-page">
      <div className="home-grid"><section className="home-panel"><p className="eyebrow">THE AI SIGNAL</p><h2>Find the right AI for what&apos;s next.</h2><p>Explore the tools, companies, and technologies shaping the AI ecosystem in one focused directory.</p><div className="featured-list">{tools.slice(0,6).map((tool) => <Link href={`/tools/${tool.slug}`} key={tool.slug}>{tool.name}<span>{tool.category}</span></Link>)}</div></section><section className="home-panel signal"><div className="signal-orbit">◒</div><p className="eyebrow">AI ORBIT</p><h2>Everything AI,<br />in orbit.</h2></section></div>
      <section><p className="eyebrow" style={{ marginTop: 34 }}>EXPLORE THE ECOSYSTEM</p><div className="explore-grid">{explore.map((entry) => <Link key={entry.href} href={entry.href}>{entry.label}<span>{entry.desc}</span></Link>)}</div></section>
    </div>
  );
}
