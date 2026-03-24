import { getAllPosts } from "@/lib/posts";
import PostCard from "@/components/PostCard";
import LeftSidebar from "@/components/LeftSidebar";
import RightSidebar from "@/components/RightSidebar";

export default function HomePage() {
  const posts = getAllPosts();

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex gap-7">
        <LeftSidebar />

        {/* Main content */}
        <main className="flex-1 min-w-0">
          <div className="mb-6">
            <h1 className="text-2xl font-bold" style={{ color: "var(--foreground)" }}>
              Latest Posts
            </h1>
            <p className="text-sm mt-1" style={{ color: "var(--muted)" }}>
              {posts.length} {posts.length === 1 ? "post" : "posts"} published
            </p>
          </div>

          {posts.length === 0 ? (
            <div
              className="rounded-xl border p-12 text-center"
              style={{ borderColor: "var(--border-color)", color: "var(--muted)" }}
            >
              <p className="text-lg font-medium">No posts yet.</p>
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
