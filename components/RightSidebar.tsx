import Link from "next/link";
import { getAllPosts, getAllSubcategories } from "@/lib/posts";

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
  const subcategories = getAllSubcategories();

  return (
    <aside className="hidden xl:flex flex-col gap-5 w-68 shrink-0 sticky top-28 self-start">
      {/* About Me */}
      <SideCard>
        <div className="flex items-center gap-3 mb-3">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/images/profile.png"
            alt="Bayasgalan"
            className="w-12 h-12 rounded-full shrink-0 object-cover"
          />
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

      {/* Subcategories */}
      {subcategories.length > 0 && (
        <SideCard>
          <SideHeading>Subsections</SideHeading>
          <div className="flex flex-col gap-1">
            {subcategories.map(({ slug, name, category, count }) => (
              <Link
                key={slug}
                href={`/subcategory/${slug}`}
                className="hover-category flex items-center justify-between px-3 py-2 text-sm"
                style={{ color: "var(--foreground)" }}
              >
                <div className="min-w-0">
                  <span className="font-medium">{name}</span>
                  <span className="text-xs ml-1.5" style={{ color: "var(--muted)" }}>
                    in {category}
                  </span>
                </div>
                <span
                  className="text-xs px-2 py-0.5 rounded-full ml-2 shrink-0"
                  style={{ backgroundColor: "rgba(168,145,217,0.15)", color: "var(--accent)" }}
                >
                  {count}
                </span>
              </Link>
            ))}
          </div>
        </SideCard>
      )}
    </aside>
  );
}
