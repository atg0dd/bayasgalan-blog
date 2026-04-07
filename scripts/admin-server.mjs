#!/usr/bin/env node
/**
 * Local admin server for the blog editor.
 * Handles post CRUD and image uploads.
 * Run alongside `next dev` with: npm run admin
 */

import http from "http";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const POSTS_DIR = path.join(ROOT, "posts");
const PUBLIC_DIR = path.join(ROOT, "public");
const PORT = 3001;

// ── helpers ────────────────────────────────────────────────────────────────

function cors(res) {
  res.setHeader("Access-Control-Allow-Origin", "http://localhost:3000");
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
}

function json(res, data, status = 200) {
  cors(res);
  res.writeHead(status, { "Content-Type": "application/json" });
  res.end(JSON.stringify(data));
}

function parseFrontmatter(raw) {
  const match = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/);
  if (!match) return { frontmatter: {}, content: raw };
  const fmLines = match[1].split("\n");
  const frontmatter = {};
  for (const line of fmLines) {
    const colon = line.indexOf(":");
    if (colon === -1) continue;
    const key = line.slice(0, colon).trim();
    let value = line.slice(colon + 1).trim();
    // strip surrounding quotes
    if ((value.startsWith('"') && value.endsWith('"')) ||
        (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    }
    frontmatter[key] = value;
  }
  return { frontmatter, content: match[2] };
}

function stringifyFrontmatter(fm, content) {
  const lines = Object.entries(fm)
    .filter(([, v]) => v !== undefined && v !== null && v !== "")
    .map(([k, v]) => `${k}: "${String(v).replace(/"/g, '\\"')}"`);
  return `---\n${lines.join("\n")}\n---\n${content}`;
}

function findPostFile(slug) {
  const mdx = path.join(POSTS_DIR, `${slug}.mdx`);
  const md = path.join(POSTS_DIR, `${slug}.md`);
  if (fs.existsSync(mdx)) return mdx;
  if (fs.existsSync(md)) return md;
  return null;
}

function readBody(req) {
  return new Promise((resolve) => {
    const chunks = [];
    req.on("data", (c) => chunks.push(c));
    req.on("end", () => resolve(Buffer.concat(chunks)));
  });
}

// Parse multipart/form-data (minimal, for image uploads)
function parseMultipart(body, boundary) {
  const sep = Buffer.from(`--${boundary}`);
  const end = Buffer.from(`--${boundary}--`);
  const parts = [];
  let start = 0;

  while (start < body.length) {
    const sepIdx = body.indexOf(sep, start);
    if (sepIdx === -1) break;
    const partStart = sepIdx + sep.length + 2; // skip \r\n
    const nextSep = body.indexOf(sep, partStart);
    if (nextSep === -1) break;
    const partEnd = nextSep - 2; // exclude \r\n before next boundary
    const partData = body.slice(partStart, partEnd);

    // Split headers from body
    const headerEnd = partData.indexOf("\r\n\r\n");
    if (headerEnd === -1) { start = nextSep; continue; }
    const headerStr = partData.slice(0, headerEnd).toString();
    const fileData = partData.slice(headerEnd + 4);

    const nameMatch = headerStr.match(/name="([^"]+)"/);
    const filenameMatch = headerStr.match(/filename="([^"]+)"/);
    parts.push({
      name: nameMatch?.[1],
      filename: filenameMatch?.[1],
      data: fileData,
    });
    start = nextSep;
    if (body.indexOf(end, start) === start) break;
  }
  return parts;
}

// ── route handlers ──────────────────────────────────────────────────────────

function handleListPosts(res) {
  if (!fs.existsSync(POSTS_DIR)) return json(res, []);
  const files = fs.readdirSync(POSTS_DIR).filter((f) => /\.(mdx|md)$/.test(f));
  const posts = files.map((file) => {
    const slug = file.replace(/\.(mdx|md)$/, "");
    const raw = fs.readFileSync(path.join(POSTS_DIR, file), "utf8");
    const { frontmatter } = parseFrontmatter(raw);
    return { slug, ...frontmatter };
  });
  json(res, posts);
}

async function handleCreatePost(req, res) {
  const buf = await readBody(req);
  const { slug, frontmatter, content } = JSON.parse(buf.toString());
  if (!slug) return json(res, { error: "slug required" }, 400);
  const safe = slug.replace(/[^a-z0-9_-]/g, "-");
  const file = path.join(POSTS_DIR, `${safe}.mdx`);
  if (fs.existsSync(file)) return json(res, { error: "slug already exists" }, 409);
  fs.mkdirSync(POSTS_DIR, { recursive: true });
  fs.writeFileSync(file, stringifyFrontmatter(frontmatter ?? {}, content ?? ""));
  json(res, { slug: safe }, 201);
}

function handleGetPost(slug, res) {
  const file = findPostFile(slug);
  if (!file) return json(res, { error: "not found" }, 404);
  const raw = fs.readFileSync(file, "utf8");
  const { frontmatter, content } = parseFrontmatter(raw);
  json(res, { slug, frontmatter, content });
}

async function handleUpdatePost(slug, req, res) {
  const buf = await readBody(req);
  const { frontmatter, content } = JSON.parse(buf.toString());
  const file = findPostFile(slug) ?? path.join(POSTS_DIR, `${slug}.mdx`);
  fs.writeFileSync(file, stringifyFrontmatter(frontmatter ?? {}, content ?? ""));
  json(res, { slug });
}

function handleDeletePost(slug, res) {
  const file = findPostFile(slug);
  if (!file) return json(res, { error: "not found" }, 404);
  fs.unlinkSync(file);
  json(res, { deleted: slug });
}

async function handleUpload(req, res) {
  const contentType = req.headers["content-type"] ?? "";
  const boundaryMatch = contentType.match(/boundary=(.+)/);
  if (!boundaryMatch) return json(res, { error: "no boundary" }, 400);

  const body = await readBody(req);
  const parts = parseMultipart(body, boundaryMatch[1]);

  const filePart = parts.find((p) => p.name === "file");
  const folderPart = parts.find((p) => p.name === "folder");
  if (!filePart) return json(res, { error: "no file" }, 400);

  const folder = folderPart?.data?.toString().trim() || "uploads";
  const ext = (filePart.filename ?? "img.jpg").split(".").pop() ?? "jpg";
  const name = `${Date.now()}.${ext}`;
  const dir = path.join(PUBLIC_DIR, "images", folder);
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, name), filePart.data);

  json(res, { url: `/images/${folder}/${name}` });
}

// ── server ──────────────────────────────────────────────────────────────────

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, `http://localhost:${PORT}`);
  const { pathname } = url;
  const method = req.method?.toUpperCase();

  // CORS preflight
  if (method === "OPTIONS") { cors(res); res.writeHead(204); res.end(); return; }

  // POST /upload
  if (pathname === "/upload" && method === "POST") return handleUpload(req, res);

  // GET /posts
  if (pathname === "/posts" && method === "GET") return handleListPosts(res);
  // POST /posts
  if (pathname === "/posts" && method === "POST") return handleCreatePost(req, res);

  // /posts/:slug
  const slugMatch = pathname.match(/^\/posts\/([^/]+)$/);
  if (slugMatch) {
    const slug = slugMatch[1];
    if (method === "GET") return handleGetPost(slug, res);
    if (method === "PUT") return handleUpdatePost(slug, req, res);
    if (method === "DELETE") return handleDeletePost(slug, res);
  }

  json(res, { error: "not found" }, 404);
});

server.listen(PORT, () => {
  console.log(`\n📝  Blog admin server running at http://localhost:${PORT}`);
  console.log(`    Open http://localhost:3000/admin in your browser\n`);
});
