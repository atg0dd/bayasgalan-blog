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

export default function RightSidebar() {
  const posts = getAllPosts();
  const featuredPost = posts[0] ?? null;
  const trendingTags = getAllTags().slice(0, 10);

  return (
    <aside className="hidden xl:flex flex-col gap-5 w-68 shrink-0 sticky top-28 self-start">
      {/* About Me */}
      <SideCard>
        <div className="flex items-center gap-3 mb-3">
          <div
            className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-lg shrink-0"
            style={{ background: "linear-gradient(135deg, #A891D9 0%, #6344D4 100%)" }}
          >
            B
          </div>
          <div>
            <p className="font-semibold text-sm" style={{ color: "var(--foreground)" }}>
              Bayasgalan
            </p>
            <p className="text-xs" style={{ color: "var(--accent)" }}>
              Software Engineer
            </p>
          </div>
        </div>
        <p className="text-sm leading-relaxed" style={{ color: "var(--muted)" }}>
          Writing about software engineering, algorithms, and life. Somewhere between terminal windows and coffee cups.
        </p>
        <a
          href="https://bayasgalan.dev"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 mt-3 text-xs font-medium transition-opacity hover:opacity-80"
          style={{ color: "var(--accent)" }}
        >
          bayasgalan.dev ↗
        </a>
      </SideCard>

      {/* Featured Post */}
      {featuredPost && (
        <SideCard>
          <SideHeading>Featured Post</SideHeading>
          <Link href={`/blog/${featuredPost.slug}`} className="group block">
            <div
              className="h-24 rounded-2xl mb-3"
              style={{ background: "linear-gradient(135deg, #A891D9 0%, #6344D4 100%)" }}
            />
            <h4
              className="hover-accent text-sm font-semibold leading-snug line-clamp-2"
              style={{ color: "var(--foreground)" }}
            >
              {featuredPost.title}
            </h4>
            <p className="text-xs mt-1" style={{ color: "var(--muted)" }}>
              {featuredPost.readingTime}
            </p>
          </Link>
        </SideCard>
      )}

      {/* Trending Tags */}
      {trendingTags.length > 0 && (
        <SideCard>
          <SideHeading>Trending Tags</SideHeading>
          <div className="flex flex-wrap gap-1.5">
            {trendingTags.map(({ tag, count }) => (
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
