import Link from "next/link";

const columns = [
  {
    title: "EXPLORE",
    links: [
      { label: "AI Tools", href: "/tools" },
      { label: "AI Agents", href: "/agents" },
      { label: "AI Models", href: "/models" },
      { label: "AI Companies", href: "/companies" },
      { label: "AI Devices", href: "/devices" },
      { label: "AI Robots", href: "/robots" },
    ],
  },
  {
    title: "DISCOVER",
    links: [
      { label: "AI News", href: "/news" },
      { label: "AI Videos", href: "/videos" },
      { label: "AI Trends", href: "/trends" },
      { label: "AI Comparisons", href: "/tools/compare" },
      { label: "Leaderboard", href: "/leaderboard" },
    ],
  },
  {
    title: "ECOSYSTEM",
    links: [
      { label: "Repositories", href: "/repositories" },
      { label: "MCP", href: "/mcp" },
      { label: "Tasks", href: "/tasks" },
      { label: "Submit AI", href: "/submit" },
      { label: "Advertise", href: "/advertise" },
    ],
  },
  {
    title: "COMPANY",
    links: [
      { label: "About", href: "/about" },
      { label: "Contact", href: "/contact" },
      { label: "Write", href: "/write-for-us" },
      { label: "Press", href: "/press" },
      { label: "Privacy", href: "/privacy" },
      { label: "Terms", href: "/terms" },
    ],
  },
];

export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="site-footer-inner">
        <div className="footer-brand"><Link href="/" className="brand"><span className="orbit">◒</span>AIORBIT</Link><p>The Home of Everything AI. Discover the tools, companies, and technologies shaping the global AI ecosystem.</p></div>
        <div className="footer-columns">
          {columns.map((col) => (
            <div key={col.title}>
              <h4>{col.title}</h4>
              <ul>
                {col.links.map((l) => (
                  <li key={l.href}>
                    <Link href={l.href}>
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="copyright">© 2026 AI Orbit. All rights reserved. Mock interface for local development.</div>
      </div>
    </footer>
  );
}
