import Link from "next/link";
import { getAllPosts, getAllTags } from "@/lib/posts";

function SideCard({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="rounded-3xl p-5"
      style={{
        backgroundColor: "var(--navbar-bg)",
        border: "1px solid var(--border-color)",
      }}
    >
      {children}
    </div>
  );
}

function SideHeading({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-xs font-bold uppercase tracking-widest mb-4" style={{ color: "var(--muted)" }}>
      {children}
    </p>
  );
}

export default function LeftSidebar() {
  const posts = getAllPosts();
  const techCount = posts.filter((p) => p.category.toLowerCase() === "tech").length;
  const personalCount = posts.filter((p) => p.category.toLowerCase() === "personal").length;
  const tags = getAllTags().slice(0, 15);

  const categories = [
    {
      label: "All Posts",
      href: "/",
      count: posts.length,
      icon: (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
          <polyline points="9 22 9 12 15 12 15 22" />
        </svg>
      ),
    },
    {
      label: "Tech",
      href: "/category/tech",
      count: techCount,
      icon: (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="16 18 22 12 16 6" />
          <polyline points="8 6 2 12 8 18" />
        </svg>
      ),
    },
    {
      label: "Personal",
      href: "/category/personal",
      count: personalCount,
      icon: (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
          <circle cx="12" cy="7" r="4" />
        </svg>
      ),
    },
  ];

  return (
    <aside className="hidden lg:flex flex-col gap-5 w-52 shrink-0 sticky top-28 self-start">
      <SideCard>
        <SideHeading>Categories</SideHeading>
        <nav className="flex flex-col gap-1">
          {categories.map(({ label, href, count, icon }) => (
            <Link
              key={href}
              href={href}
              className="hover-category flex items-center justify-between px-3 py-2 text-sm font-medium"
              style={{ color: "var(--foreground)" }}
            >
              <span className="flex items-center gap-2">
                <span style={{ color: "var(--accent)" }}>{icon}</span>
                {label}
              </span>
              <span
                className="text-xs px-2 py-0.5 rounded-full font-medium"
                style={{ backgroundColor: "rgba(168,145,217,0.15)", color: "var(--accent)" }}
              >
                {count}
              </span>
            </Link>
          ))}
        </nav>
      </SideCard>

      {tags.length > 0 && (
        <SideCard>
          <SideHeading>Tags</SideHeading>
          <div className="flex flex-wrap gap-1.5">
            {tags.map(({ tag, count }) => (
              <Link key={tag} href={`/tag/${tag.toLowerCase()}`} className="tag-pill">
                #{tag}
                <span className="ml-1 opacity-50">{count}</span>
              </Link>
            ))}
          </div>
        </SideCard>
      )}
    </aside>
  );
}
