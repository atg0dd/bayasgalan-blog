import { notFound } from "next/navigation";
import { getAllPosts, getPostBySlug, extractHeadings } from "@/lib/posts";
import { MDXRemote } from "next-mdx-remote/rsc";
import Link from "next/link";

interface Props {
  params: Promise<{ slug: string }>;
}

export const dynamicParams = false;

export async function generateStaticParams() {
  const posts = getAllPosts();
  if (posts.length === 0) return [{ slug: "__empty" }];
  return posts.map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  const post = getPostBySlug(slug);
  if (!post) return {};
  return {
    title: `${post.title} — Bayasgalan's Blog`,
    description: post.summary,
  };
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params;
  const post = getPostBySlug(slug);

  if (!post) notFound();

  const headings = extractHeadings(post.content);
  const allPosts = getAllPosts();
  const related = allPosts
    .filter(
      (p) =>
        p.slug !== post.slug &&
        (p.category === post.category ||
          p.tags.some((t) => post.tags.includes(t)))
    )
    .slice(0, 3);

  return (
    <div className="max-w-7xl mx-auto px-4 py-4 sm:py-8">
      <div className="flex gap-8">
        {/* Main article */}
        <article className="flex-1 min-w-0 max-w-full overflow-hidden">
          {/* Back link */}
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-sm mb-6 transition-colors nav-link"
            style={{ color: "var(--muted)" }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="m15 18-6-6 6-6" />
            </svg>
            Back to all posts
          </Link>

          {/* Cover */}
          {post.coverImage && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={post.coverImage}
              alt={post.title}
              className="w-full h-72 object-cover rounded-xl mb-8"
            />
          )}

          {/* Header */}
          <div
            className="rounded-3xl p-5 sm:p-8 mb-6"
            style={{ backgroundColor: "var(--navbar-bg)", border: "1px solid var(--border-color)" }}
          >
            {/* Category */}
            <Link
              href={`/category/${post.category.toLowerCase()}`}
              className="inline-block text-xs font-semibold px-2.5 py-1 rounded-full mb-4"
              style={{ backgroundColor: "rgba(168,145,217,0.18)", color: "var(--accent)" }}
            >
              {post.category}
            </Link>

            <h1
              className="text-2xl sm:text-3xl font-bold mb-4 leading-tight"
              style={{ color: "var(--foreground)" }}
            >
              {post.title}
            </h1>

            {post.summary && (
              <p className="text-base sm:text-lg mb-6" style={{ color: "var(--muted)" }}>
                {post.summary}
              </p>
            )}

            {/* Author row */}
            <div className="flex items-center gap-3 pt-4 border-t" style={{ borderColor: "var(--border-color)" }}>
              <div className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold shrink-0" style={{ background: "linear-gradient(135deg, #A891D9 0%, #6344D4 100%)" }}>
                B
              </div>
              <div>
                <p className="text-sm font-semibold" style={{ color: "var(--foreground)" }}>
                  Bayasgalan
                </p>
                <div className="flex items-center gap-2 text-xs" style={{ color: "var(--muted)" }}>
                  <time dateTime={post.date}>{formatDate(post.date)}</time>
                  <span>·</span>
                  <span>{post.readingTime}</span>
                </div>
              </div>
            </div>
          </div>

          {/* MDX Content */}
          <div
            className="rounded-3xl p-4 sm:p-8 prose"
            style={{ backgroundColor: "var(--navbar-bg)", border: "1px solid var(--border-color)" }}
          >
            <MDXRemote source={post.content} />
          </div>

          {/* Tags */}
          {post.tags.length > 0 && (
            <div className="mt-6 flex flex-wrap gap-2">
              {post.tags.map((tag) => (
                <Link
                  key={tag}
                  href={`/tag/${tag.toLowerCase()}`}
                  className="tag-pill text-sm px-3 py-1.5"
                  style={{ borderColor: "var(--border-color)", color: "var(--muted)" }}
                >
                  #{tag}
                </Link>
              ))}
            </div>
          )}

          {/* Related Posts */}
          {related.length > 0 && (
            <div className="mt-10">
              <h2
                className="text-lg sm:text-xl font-bold mb-5"
                style={{ color: "var(--foreground)" }}
              >
                Related Posts
              </h2>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {related.map((p) => (
                  <Link
                    key={p.slug}
                    href={`/blog/${p.slug}`}
                    className="hover-accent-border rounded-2xl p-4 group"
                    style={{ backgroundColor: "var(--navbar-bg)", border: "1px solid var(--border-color)" }}
                  >
                    <p
                      className="hover-accent text-sm font-semibold line-clamp-2"
                      style={{ color: "var(--foreground)" }}
                    >
                      {p.title}
                    </p>
                    <p className="text-xs mt-2" style={{ color: "var(--muted)" }}>
                      {p.readingTime}
                    </p>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </article>

        {/* Table of Contents */}
        {headings.length > 0 && (
          <aside className="hidden xl:block w-60 shrink-0">
            <div
              className="sticky top-28 rounded-3xl p-4"
              style={{ backgroundColor: "var(--navbar-bg)", border: "1px solid var(--border-color)" }}
            >
              <h3
                className="text-xs font-semibold uppercase tracking-wider mb-3"
                style={{ color: "var(--muted)" }}
              >
                Table of Contents
              </h3>
              <nav className="flex flex-col gap-1">
                {headings.map((h) => (
                  <a
                    key={h.id}
                    href={`#${h.id}`}
                    className={`nav-link text-xs py-1 ${
                      h.level === 2 ? "pl-0" : h.level === 3 ? "pl-3" : "pl-5"
                    }`}
                  >
                    {h.text}
                  </a>
                ))}
              </nav>
            </div>
          </aside>
        )}
      </div>
    </div>
  );
}
