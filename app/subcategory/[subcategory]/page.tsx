import { notFound } from "next/navigation";
import { getPostsBySubcategory, getAllSubcategories } from "@/lib/posts";
import PostCard from "@/components/PostCard";
import LeftSidebar from "@/components/LeftSidebar";
import RightSidebar from "@/components/RightSidebar";

interface Props {
  params: Promise<{ subcategory: string }>;
}

export const dynamicParams = false;

export async function generateStaticParams() {
  const subs = getAllSubcategories();
  if (subs.length === 0) return [{ subcategory: "__empty" }];
  return subs.map(({ slug }) => ({ subcategory: slug }));
}

export async function generateMetadata({ params }: Props) {
  const { subcategory } = await params;
  const subs = getAllSubcategories();
  const found = subs.find((s) => s.slug === subcategory);
  const name = found?.name ?? subcategory;
  return {
    title: `${name} — Bayasgalan's Blog`,
    description: `Posts in the ${name} subsection.`,
  };
}

export default async function SubcategoryPage({ params }: Props) {
  const { subcategory } = await params;
  const subs = getAllSubcategories();
  const found = subs.find((s) => s.slug === subcategory);

  if (!found) notFound();

  const posts = getPostsBySubcategory(found.name);

  return (
    <div className="max-w-7xl mx-auto px-4 py-4 sm:py-8">
      <div className="flex gap-7">
        <LeftSidebar />

        <main className="flex-1 min-w-0">
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-1 text-sm" style={{ color: "var(--muted)" }}>
              <span>{found.category}</span>
              <span>›</span>
              <span style={{ color: "var(--accent)", fontWeight: 600 }}>{found.name}</span>
            </div>
            <h1 className="text-2xl font-bold" style={{ color: "var(--foreground)" }}>
              {found.name}
            </h1>
            <p className="text-sm mt-1" style={{ color: "var(--muted)" }}>
              {posts.length} {posts.length === 1 ? "post" : "posts"}
            </p>
          </div>

          {posts.length === 0 ? (
            <div
              className="rounded-xl border p-12 text-center"
              style={{ borderColor: "var(--border-color)", color: "var(--muted)" }}
            >
              <p className="text-lg font-medium">No posts here yet.</p>
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
