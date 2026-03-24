import { notFound } from "next/navigation";
import { getPostsByTag, getAllTags } from "@/lib/posts";
import PostCard from "@/components/PostCard";
import LeftSidebar from "@/components/LeftSidebar";
import RightSidebar from "@/components/RightSidebar";

interface Props {
  params: Promise<{ tag: string }>;
}

export const dynamicParams = false;

export async function generateStaticParams() {
  const tags = getAllTags();
  if (tags.length === 0) return [{ tag: "__empty" }];
  return tags.map(({ tag }) => ({ tag: tag.toLowerCase() }));
}

export async function generateMetadata({ params }: Props) {
  const { tag } = await params;
  return {
    title: `#${tag} — Bayasgalan's Blog`,
    description: `All posts tagged with #${tag}.`,
  };
}

export default async function TagPage({ params }: Props) {
  const { tag } = await params;
  const posts = getPostsByTag(tag);

  if (posts.length === 0) notFound();

  return (
    <div className="max-w-7xl mx-auto px-4 py-4 sm:py-8">
      <div className="flex gap-7">
        <LeftSidebar />

        <main className="flex-1 min-w-0">
          <div className="mb-6">
            <h1
              className="text-2xl font-bold"
              style={{ color: "var(--foreground)" }}
            >
              <span style={{ color: "var(--accent)" }}>#</span>
              {tag}
            </h1>
            <p className="text-sm mt-1" style={{ color: "var(--muted)" }}>
              {posts.length} {posts.length === 1 ? "post" : "posts"} tagged with &ldquo;{tag}&rdquo;
            </p>
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            {posts.map((post) => (
              <PostCard key={post.slug} post={post} />
            ))}
          </div>
        </main>

        <RightSidebar />
      </div>
    </div>
  );
}
