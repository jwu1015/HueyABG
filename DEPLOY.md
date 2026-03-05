# Deploy HuyABG (easiest: Vercel)

## 1. Push your code to GitHub

If you haven’t already:

```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git
git push -u origin main
```

## 2. Deploy on Vercel

1. Go to **[vercel.com](https://vercel.com)** and sign in (GitHub is easiest).
2. Click **Add New…** → **Project**.
3. **Import** your GitHub repo. Vercel will detect Next.js.
4. Before deploying, open **Environment Variables** and add:

   | Name | Value |
   |------|--------|
   | `OPENROUTER_API_KEY` | Your OpenRouter key |
   | `PINECONE_API_KEY` | Your Pinecone key (for RAG) |
   | `PINECONE_HOST` | Your Pinecone index host (e.g. `huy-rag-xxx.svc.region.pinecone.io`) |

   (RAG is optional: if you skip Pinecone vars, the chat still works without RAG.)

5. Click **Deploy**. Vercel will build and give you a URL like `https://your-project.vercel.app`.

## 3. After deploy

- **Chat**: Your live site uses the same chat + RAG as local (with the env vars you set).
- **Updates**: Push to `main` and Vercel will redeploy automatically.
- **Custom domain**: In the Vercel project → **Settings** → **Domains** you can add your own domain.

That’s it. No server to manage; free tier is enough for small traffic.
