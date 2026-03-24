# 🖊️ Bayasgalan's Blog

A personal blog built with **Next.js 14+**, **Tailwind CSS**, and **MDX** — inspired by Hashnode's UI with a Medium-style reading experience.

Will be live at: [blog.bayasgalan.dev](https://blog.bayasgalan.dev)

---

## ✨ Features

- 📝 MDX-powered posts (no database, just Markdown files)
- 🎨 Hashnode-inspired UI with two-column layout
- 📖 Medium-style reading experience with reading progress bar
- 🌙 Dark / Light mode toggle
- 🏷️ Categories (Tech & Personal) and Tags
- 📱 Fully responsive (mobile, tablet, desktop)
- ⚡ Static export — will be hosted free on Cloudflare Pages
- 🔍 Reading time auto-calculated

---

## 🛠️ Planned Tech Stack

| Tool | Purpose |
|---|---|
| Next.js 14+ (App Router) | Framework |
| TypeScript | Language |
| Tailwind CSS | Styling |
| MDX + gray-matter | Blog posts |
| Cloudflare Pages | Hosting (free) |

---

## 📁 Planned Project Structure
```
my-blog/
├── app/
│   ├── page.tsx                      # Home page
│   ├── layout.tsx                    # Root layout
│   ├── blog/[slug]/page.tsx          # Individual post page
│   ├── category/[category]/page.tsx  # Category filter page
│   └── tag/[tag]/page.tsx            # Tag filter page
├── components/
│   ├── Navbar.tsx
│   ├── LeftSidebar.tsx
│   ├── RightSidebar.tsx
│   ├── PostCard.tsx
│   └── Footer.tsx
├── posts/                            # MDX blog posts will go here
├── public/
│   └── images/
├── lib/
│   └── posts.ts                      # Utility to read MDX files
├── .env.local                        # Secret keys (never commit this)
└── .gitignore
```

---

## 📝 How Posts Will Work

Each post will be a `.mdx` file inside the `/posts` folder:

\```md
---
title: 'Your Post Title'
date: '2026-03-24'
tags: ['tag1', 'tag2']
category: 'Tech'        # or 'Personal'
summary: 'Short description of your post'
coverImage: '/images/posts/your-cover.jpg'
---

Your content here in Markdown...
\```

Push to GitHub → Cloudflare auto-deploys. Done! ✅

---

## 🚀 Getting Started Locally
```bash
# 1. Clone the repo
git clone https://github.com/bayasgalan/bayasgalan-blog
cd bayasgalan-blog

# 2. Install dependencies
npm install

# 3. Run locally
npm run dev

# 4. Open in browser
# http://localhost:3000
```

---

## 🌍 Deployment Plan

Will be deployed on **Cloudflare Pages** for free.
```bash
# Build for production
npm run build
```

Cloudflare Pages will auto-deploy on every `git push` to the main branch.

**DNS Setup:**
- Add a `CNAME` record in your domain registrar
- Name: `blog`
- Value: `your-project.pages.dev`

---

## ⚠️ Important Notes

- **Never commit `.env.local`** — it's already in `.gitignore`
- All blog posts will be public (your blog is public anyway!)
- Compress images before adding to `/public/images`
- Always test locally with `npm run dev` before pushing

---

## 📬 Contact

- Website: [bayasgalan.dev](https://bayasgalan.dev)
- Blog: [blog.bayasgalan.dev](https://blog.bayasgalan.dev)

---

> Will be built with ❤️ by Bayasgalan
