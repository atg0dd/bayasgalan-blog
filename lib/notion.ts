import { Client } from "@notionhq/client";
import readingTime from "reading-time";
import type { PostMeta, Post } from "./posts";

function isConfigured(): boolean {
  return !!(process.env.NOTION_TOKEN && process.env.NOTION_DATABASE_ID);
}

function makeClient() {
  // Use the stable 2022 API version — the 2025 version moved databases to "data sources"
  // and removed the /databases/{id}/query endpoint that traditional databases use.
  return new Client({ auth: process.env.NOTION_TOKEN, notionVersion: "2022-06-28" });
}

function getDbId(): string {
  return process.env.NOTION_DATABASE_ID!;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function pageToMeta(page: any): PostMeta {
  const props = page.properties;
  const title = props.Title?.title?.[0]?.plain_text ?? "Untitled";
  const slug = props.Slug?.rich_text?.[0]?.plain_text || page.id;
  const date =
    props.Date?.date?.start ?? new Date().toISOString().split("T")[0];
  const category = props.Category?.select?.name ?? "Tech";
  const subcategory = props.Subcategory?.select?.name ?? "";
  const summary = props.Summary?.rich_text?.[0]?.plain_text ?? "";
  const coverImage = props["Cover Image"]?.url ?? "";

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

  const notion = makeClient();
  const response = await queryDatabase(notion, {
    property: "Published",
    checkbox: { equals: true },
  });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return response.results.map((page: any) => pageToMeta(page));
}

export async function getNotionPostBySlug(slug: string): Promise<Post | null> {
  if (!isConfigured()) return null;

  const notion = makeClient();
  const response = await queryDatabase(notion, {
    and: [
      { property: "Slug", rich_text: { equals: slug } },
      { property: "Published", checkbox: { equals: true } },
    ],
  });

  if (!response.results.length) return null;

  const page = response.results[0] as { id: string };
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const meta = pageToMeta(page as any);

  const markdownResponse = await notion.pages.retrieveMarkdown({
    page_id: page.id,
  });
  const content = markdownResponse.markdown;
  const rt = readingTime(content);

  return { ...meta, readingTime: rt.text, content };
}
