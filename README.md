# HuyABG

Next.js website with an **optional AI chatbot**. The site works out of the box; the chatbot is off by default and can be enabled with a single change.

## Run the website

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). You’ll see the site with a “Chat widget will go here” placeholder where the chatbot will appear once you enable it.

## Enable the chatbot

See **[INTEGRATE-CHATBOT.md](./INTEGRATE-CHATBOT.md)** for step-by-step instructions. In short: in `app/page.tsx` replace `<ChatPlaceholder />` with `<Chat />`, add `OPENROUTER_API_KEY` to `.env.local`, and you’re done.

## Project layout

- **Website**: `app/page.tsx` (header, hero, content, footer). Chat slot uses `ChatPlaceholder` until you switch to `Chat`.
- **Chatbot (ready to use)**: `components/Chat.tsx` (useChat UI), `app/api/chat/route.ts` (streaming + tools). Not rendered on the main page until you add `<Chat />`.
- **Embed**: `app/embed/page.tsx` — full-page chat for iframes when the API is configured.

## Deploy

Easiest: **Vercel**. Push your repo to GitHub, import it at [vercel.com](https://vercel.com), add env vars (`OPENROUTER_API_KEY`, and optionally `PINECONE_API_KEY` + `PINECONE_HOST` for RAG), then deploy. See **[DEPLOY.md](./DEPLOY.md)** for step-by-step instructions.

## RAG (your data)

When the chatbot is enabled, you can add retrieval (Pinecone, pgvector) in `app/api/chat/route.ts`: run a vector search and inject the results into the prompt before calling `streamText`. See **[RAG.md](./RAG.md)** and `.env.example` for setup.
