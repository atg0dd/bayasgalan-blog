import { notFound } from "next/navigation";
import { getPostsByCategory } from "@/lib/posts";
import PostCard from "@/components/PostCard";
import LeftSidebar from "@/components/LeftSidebar";
import RightSidebar from "@/components/RightSidebar";

const VALID_CATEGORIES = ["tech", "personal"];

interface Props {
  params: Promise<{ category: string }>;
}

export async function generateStaticParams() {
  return VALID_CATEGORIES.map((category) => ({ category }));
}

export async function generateMetadata({ params }: Props) {
  const { category } = await params;
  const name = category.charAt(0).toUpperCase() + category.slice(1);
  return {
    title: `${name} Posts — Bayasgalan's Blog`,
    description: `All ${name} posts on Bayasgalan's Blog.`,
  };
}

export default async function CategoryPage({ params }: Props) {
  const { category } = await params;

  if (!VALID_CATEGORIES.includes(category.toLowerCase())) {
    notFound();
  }

  const posts = getPostsByCategory(category);
  const displayName = category.charAt(0).toUpperCase() + category.slice(1);

  return (
    <div className="max-w-7xl mx-auto px-4 py-4 sm:py-8">
      <div className="flex gap-7">
        <LeftSidebar />

        <main className="flex-1 min-w-0">
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-1">
              <span
                className="text-xs font-semibold px-2.5 py-1 rounded-full"
              style={{ backgroundColor: "rgba(168,145,217,0.18)", color: "var(--accent)" }}
              >
                {displayName}
              </span>
            </div>
            <h1
              className="text-2xl font-bold"
              style={{ color: "var(--foreground)" }}
            >
              {displayName} Posts
            </h1>
            <p className="text-sm mt-1" style={{ color: "var(--muted)" }}>
              {posts.length} {posts.length === 1 ? "post" : "posts"} found
            </p>
          </div>

          {posts.length === 0 ? (
            <div
              className="rounded-xl border p-12 text-center"
              style={{ borderColor: "var(--border-color)", color: "var(--muted)" }}
            >
              <p className="text-lg font-medium">No posts in this category yet.</p>
              <p className="text-sm mt-1">Check back soon!</p>
            </div>
          ) : (
            <div className="grid gap-5 sm:grid-cols-2">
              {posts.map((post) => (
                <PostCard key={post.slug} post={post} />
              ))}
            </div>
          )}
        </main>

        <RightSidebar />
      </div>
    </div>
  );
}
