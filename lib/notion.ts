import { Client } from "@notionhq/client";
import readingTime from "reading-time";
import type { PostMeta, Post } from "./posts";

function isConfigured(): boolean {
  return !!(process.env.NOTION_TOKEN && process.env.NOTION_DATABASE_ID);
}

let postsCache: PostMeta[] | null = null;
// ^^ module-level cache so Notion is only queried once per build process

// Database queries need the 2022 API — the 2025 version removed /databases/{id}/query
// (replaced by dataSources). Markdown retrieval uses the default 2025 version because
// pages/{id}/markdown is a newer endpoint that doesn't exist in the 2022 API.
function makeClient() {
  return new Client({ auth: process.env.NOTION_TOKEN, notionVersion: "2022-06-28" });
}

function makeLatestClient() {
  return new Client({ auth: process.env.NOTION_TOKEN });
}

function getDbId(): string {
  return process.env.NOTION_DATABASE_ID!;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function pageToMeta(page: any): PostMeta {
  const props = page.properties;
  // Title property can have any name in Notion — find it by type.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const titleProp = Object.values(props).find((p: any) => p.type === "title") as any;
  const title = titleProp?.title?.[0]?.plain_text ?? "Untitled";
  // Normalize spaces to hyphens so slugs are always URL-safe path segments.
  const rawSlug = props.Slug?.rich_text?.[0]?.plain_text || page.id;
  const slug = rawSlug.replace(/\s+/g, "-");
  const date =
    props.Date?.date?.start ?? new Date().toISOString().split("T")[0];
  const category = props.Category?.select?.name ?? "Tech";
  const subcategory = props.Subcategory?.select?.name ?? "";
  const summary = props.Summary?.rich_text?.[0]?.plain_text ?? "";
  // Notion URL fields return the string "none" when empty — treat non-http values as absent.
  const rawCover = props["Cover Image"]?.url ?? "";
  const coverImage = rawCover.startsWith("http") ? rawCover : "";

  return {
    slug,
    title,
    date,
    category,
    subcategory,
    summary,
    coverImage,
    readingTime: "5 min read",
  };
}

// The SDK v5 removed databases.query (replaced it with dataSources.query for new-style
// data sources). Traditional Notion databases still use the /databases/{id}/query
// endpoint, so we call it directly via client.request().
async function queryDatabase(
  notion: Client,
  filter?: Record<string, unknown>
): Promise<{ results: unknown[] }> {
  return notion.request<{ results: unknown[] }>({
    path: `databases/${getDbId()}/query`,
    method: "post",
    body: {
      filter,
      sorts: [{ property: "Date", direction: "descending" }],
    },
  });
}

export async function getNotionPosts(): Promise<PostMeta[]> {
  if (!isConfigured()) return [];
  if (postsCache) {
    console.log("[notion] cache hit:", postsCache.length);
    return postsCache;
  }

  console.log("[notion] fetching from API...");
  try {
    const notion = makeClient();
    const response = await queryDatabase(notion, {
      property: "Published",
      checkbox: { equals: true },
    });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    postsCache = response.results.map((page: any) => pageToMeta(page));
    console.log("[notion] fetched:", postsCache.length, "posts →", postsCache.map(p => p.slug));
    return postsCache;
  } catch (err) {
    console.error("[notion] getNotionPosts failed:", err);
    return [];
  }
}

export async function getNotionPostBySlug(slug: string): Promise<Post | null> {
  if (!isConfigured()) return null;

  try {
    const notion = makeClient();
    // Fetch all published pages and match by normalized slug, because the Notion
    // Slug field may contain spaces while our URL slugs use hyphens.
    const response = await queryDatabase(notion, {
      property: "Published",
      checkbox: { equals: true },
    });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const match = (response.results as any[]).find((p) => {
      const raw = p.properties?.Slug?.rich_text?.[0]?.plain_text || p.id;
      return raw.replace(/\s+/g, "-") === slug;
    });

    if (!match) return null;

    const page = match as { id: string };
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const meta = pageToMeta(page as any);

    const markdownResponse = await makeLatestClient().pages.retrieveMarkdown({
      page_id: page.id,
    });
    const content = markdownResponse.markdown
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
      .replace(/<(br|hr|img)(\s[^>]*)?\s*(?<!\/)>/gi, "<$1$2 />");
    const rt = readingTime(content);

    return { ...meta, readingTime: rt.text, content };
  } catch (err) {
    console.error("[notion] getNotionPostBySlug failed:", err);
    return null;
  }
}
