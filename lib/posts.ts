import fs from "fs";
import path from "path";
import matter from "gray-matter";
import readingTime from "reading-time";

const postsDirectory = path.join(process.cwd(), "posts");

export interface PostMeta {
  slug: string;
  title: string;
  date: string;
  subcategory: string;
  category: string;
  summary: string;
  coverImage: string;
  readingTime: string;
}

export interface Post extends PostMeta {
  content: string;
}

export async function getAllPosts(): Promise<PostMeta[]> {
  if (!fs.existsSync(postsDirectory)) return [];

  return fs
    .readdirSync(postsDirectory)
    .filter((name) => name.endsWith(".mdx") || name.endsWith(".md"))
    .map((fileName) => {
      const slug = fileName.replace(/\.(mdx|md)$/, "");
      const fullPath = path.join(postsDirectory, fileName);
      const { data, content } = matter(fs.readFileSync(fullPath, "utf8"));
      const rt = readingTime(content);

      return {
        slug,
        title: data.title || "Untitled",
        date: data.date || new Date().toISOString().split("T")[0],
        subcategory: data.subcategory || "",
        category: data.category || "Tech",
        summary: data.summary || "",
        coverImage: data.coverImage || "",
        readingTime: rt.text,
      } as PostMeta;
    })
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

export async function getPostBySlug(slug: string): Promise<Post | null> {
  try {
    const mdxPath = path.join(postsDirectory, `${slug}.mdx`);
    const mdPath = path.join(postsDirectory, `${slug}.md`);
    const fullPath = fs.existsSync(mdxPath) ? mdxPath : mdPath;

    const { data, content } = matter(fs.readFileSync(fullPath, "utf8"));
    const rt = readingTime(content);

    return {
      slug,
      title: data.title || "Untitled",
      date: data.date || new Date().toISOString().split("T")[0],
      subcategory: data.subcategory || "",
      category: data.category || "Tech",
      summary: data.summary || "",
      coverImage: data.coverImage || "",
      readingTime: rt.text,
      content,
    };
  } catch {
    return null;
  }
}

export async function getPostsByCategory(category: string): Promise<PostMeta[]> {
  const posts = await getAllPosts();
  return posts.filter(
    (post) => post.category.toLowerCase() === category.toLowerCase()
  );
}

export async function getPostsBySubcategory(subcategory: string): Promise<PostMeta[]> {
  const posts = await getAllPosts();
  return posts.filter(
    (post) => post.subcategory.toLowerCase() === subcategory.toLowerCase()
  );
}

export async function getAllSubcategories(): Promise<
  { name: string; slug: string; category: string; count: number }[]
> {
  const posts = await getAllPosts();
  const map: Record<string, { name: string; category: string; count: number }> = {};

  posts.forEach((post) => {
    if (!post.subcategory) return;
    const slug = post.subcategory.toLowerCase().replace(/\s+/g, "-");
    if (map[slug]) {
      map[slug].count++;
    } else {
      map[slug] = { name: post.subcategory, category: post.category, count: 1 };
    }
  });

  return Object.entries(map)
    .map(([slug, { name, category, count }]) => ({ slug, name, category, count }))
    .sort((a, b) => b.count - a.count);
}

export function extractHeadings(
  content: string
): { level: number; text: string; id: string }[] {
  const headings: { level: number; text: string; id: string }[] = [];
  const regex = /^(#{1,3})\s+(.+)$/gm;
  let match;
  while ((match = regex.exec(content)) !== null) {
    const text = match[2].trim();
    const id = text
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, "")
      .trim()
      .replace(/\s+/g, "-");
    headings.push({ level: match[1].length, text, id });
  }
  return headings;
}
