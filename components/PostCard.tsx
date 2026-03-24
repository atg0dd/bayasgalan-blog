import Link from "next/link";
import { PostMeta } from "@/lib/posts";

interface PostCardProps {
  post: PostMeta;
}

const COVER_GRADIENTS = [
  "linear-gradient(135deg, #A891D9 0%, #6344D4 100%)",
  "linear-gradient(135deg, #6344D4 0%, #3b1fa8 100%)",
  "linear-gradient(135deg, #A891D9 0%, #4FD1C5 100%)",
  "linear-gradient(135deg, #7B61FF 0%, #A891D9 100%)",
  "linear-gradient(135deg, #6344D4 0%, #A891D9 60%, #D4BFFF 100%)",
];

function getCoverGradient(slug: string): string {
  const idx =
    slug.split("").reduce((acc, c) => acc + c.charCodeAt(0), 0) %
    COVER_GRADIENTS.length;
  return COVER_GRADIENTS[idx];
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export default function PostCard({ post }: PostCardProps) {
  const categoryKey = post.category.toLowerCase();

  return (
    <article
      className="rounded-3xl overflow-hidden transition-all duration-300 hover:-translate-y-1"
      style={{
        backgroundColor: "var(--navbar-bg)",
        border: "1px solid var(--border-color)",
        boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
      }}
    >
      {/* Cover */}
      <Link href={`/blog/${post.slug}`} tabIndex={-1}>
        <div className="h-44 overflow-hidden">
          {post.coverImage ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={post.coverImage}
              alt={post.title}
              className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
            />
          ) : (
            <div
              className="w-full h-full"
              style={{ background: getCoverGradient(post.slug) }}
            />
          )}
        </div>
      </Link>

      <div className="p-5">
        {/* Category badge + read time */}
        <div className="flex items-center justify-between mb-3">
          <Link
            href={`/category/${categoryKey}`}
            className="text-xs font-semibold px-2.5 py-1 rounded-full"
            style={{
              backgroundColor: "rgba(168,145,217,0.18)",
              color: "var(--accent)",
            }}
          >
            {post.category}
          </Link>
          <span className="text-xs" style={{ color: "var(--muted)" }}>
            {post.readingTime}
          </span>
        </div>

        {/* Title */}
        <Link href={`/blog/${post.slug}`}>
          <h2
            className="hover-accent text-base font-semibold mb-2 leading-snug line-clamp-2"
            style={{ color: "var(--foreground)" }}
          >
            {post.title}
          </h2>
        </Link>

        {/* Summary */}
        {post.summary && (
          <p className="text-sm leading-relaxed mb-4 line-clamp-2" style={{ color: "var(--muted)" }}>
            {post.summary}
          </p>
        )}

        {/* Date + Tags */}
        <div className="flex items-center justify-between flex-wrap gap-2">
          <time dateTime={post.date} className="text-xs" style={{ color: "var(--muted)" }}>
            {formatDate(post.date)}
          </time>
          <div className="flex flex-wrap gap-1">
            {post.tags.slice(0, 3).map((tag) => (
              <Link key={tag} href={`/tag/${tag.toLowerCase()}`} className="tag-pill">
                #{tag}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </article>
  );
}
