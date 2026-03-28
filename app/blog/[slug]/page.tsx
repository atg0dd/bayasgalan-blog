import { notFound } from "next/navigation";
import { getAllPosts, getPostBySlug } from "@/lib/posts";
import { MDXRemote } from "next-mdx-remote/rsc";
import Link from "next/link";
import ReadingProgress from "@/components/ReadingProgress";

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
    <>
      <ReadingProgress />

      <div className="max-w-[680px] mx-auto px-4 sm:px-6 py-10 sm:py-16">
        {/* Back link */}
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-sm mb-10 transition-colors"
          style={{ color: "var(--muted)" }}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="m15 18-6-6 6-6" />
          </svg>
          All posts
        </Link>

        {/* Category */}
        <Link
          href={`/category/${post.category.toLowerCase()}`}
          className="inline-block text-xs font-semibold tracking-wide uppercase px-3 py-1 rounded-full mb-5"
          style={{
            backgroundColor: "rgba(168,145,217,0.15)",
            color: "var(--accent)",
          }}
        >
          {post.category}
        </Link>

        {/* Title */}
        <h1
          className="text-[2.2rem] sm:text-[2.8rem] font-bold leading-[1.2] mb-5"
          style={{
            color: "var(--foreground)",
            fontFamily: "var(--font-poppins), system-ui, sans-serif",
          }}
        >
          {post.title}
        </h1>

        {/* Summary / subtitle */}
        {post.summary && (
          <p
            className="text-xl leading-relaxed mb-8"
            style={{
              color: "var(--muted)",
              fontFamily: "var(--font-lora), Georgia, serif",
              fontStyle: "italic",
            }}
          >
            {post.summary}
          </p>
        )}

        {/* Divider */}
        <hr style={{ borderColor: "var(--border-color)" }} />

        {/* Author row */}
        <div className="flex items-center gap-3 my-6">
          <div
            className="w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-bold shrink-0"
            style={{
              background: "linear-gradient(135deg, #A891D9 0%, #6344D4 100%)",
            }}
          >
            B
          </div>
          <div>
            <p
              className="text-sm font-semibold"
              style={{ color: "var(--foreground)" }}
            >
              Bayasgalan
            </p>
            <div
              className="flex items-center gap-2 text-xs"
              style={{ color: "var(--muted)" }}
            >
              <time dateTime={post.date}>{formatDate(post.date)}</time>
              <span>·</span>
              <span>{post.readingTime}</span>
            </div>
          </div>
        </div>

        {/* Divider */}
        <hr style={{ borderColor: "var(--border-color)" }} />

        {/* Cover image */}
        {post.coverImage && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={post.coverImage}
            alt={post.title}
            className="w-full object-cover mt-10 mb-2"
            style={{ borderRadius: "4px", maxHeight: "460px" }}
          />
        )}

        {/* MDX body */}
        <div className="prose mt-10">
          <MDXRemote source={post.content} />
        </div>

        {/* Tags */}
        {post.tags.length > 0 && (
          <div
            className="flex flex-wrap gap-2 mt-12 pt-8"
            style={{ borderTop: "1px solid var(--border-color)" }}
          >
            {post.tags.map((tag) => (
              <Link
                key={tag}
                href={`/tag/${tag.toLowerCase()}`}
                className="tag-pill text-sm px-3 py-1.5"
              >
                #{tag}
              </Link>
            ))}
          </div>
        )}

        {/* Related posts */}
        {related.length > 0 && (
          <div
            className="mt-16 pt-10"
            style={{ borderTop: "1px solid var(--border-color)" }}
          >
            <p
              className="text-xs font-semibold uppercase tracking-widest mb-6"
              style={{ color: "var(--muted)" }}
            >
              More from Bayasgalan
            </p>
            <div className="flex flex-col gap-5">
              {related.map((p) => (
                <Link
                  key={p.slug}
                  href={`/blog/${p.slug}`}
                  className="group flex items-start justify-between gap-4"
                >
                  <div className="min-w-0">
                    <p
                      className="font-semibold leading-snug mb-1 group-hover:text-[var(--accent)] transition-colors"
                      style={{
                        color: "var(--foreground)",
                        fontFamily: "var(--font-poppins), sans-serif",
                      }}
                    >
                      {p.title}
                    </p>
                    <p className="text-xs" style={{ color: "var(--muted)" }}>
                      {p.readingTime}
                    </p>
                  </div>
                  {p.coverImage && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={p.coverImage}
                      alt={p.title}
                      className="w-16 h-16 object-cover rounded shrink-0"
                    />
                  )}
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </>
  );
}
