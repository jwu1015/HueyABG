# RAG: Give Huy your own content

When RAG is set up, the chatbot retrieves relevant chunks from your content (tips, phrases, do's and don'ts) and injects them into the prompt so Huy can answer using your material.

## 1. Pinecone

1. Sign up at [pinecone.io](https://www.pinecone.io/) and create an **index**:
   - **Dimension:** `1536` (for openai/text-embedding-3-small)
   - **Metric:** cosine
   - **Name:** e.g. `huy-rag`

2. In `.env.local` add:
   ```bash
   PINECONE_API_KEY=your_key
   PINECONE_INDEX=huy-rag
   ```

## 2. Add your content

- Put Markdown (or text) files in **`content/`**.
- `content/tips.md` is already there with sample tips. Edit it or add more files (e.g. `content/phrases.md`, `content/donts.md`).

## 3. Ingest into Pinecone

Run once (and again whenever you change the content):

```bash
npm run ingest
```

This chunks the files, embeds them with OpenRouter, and upserts into the Pinecone index in the `huy` namespace.

## 4. Chat

Restart the dev server if it’s running. When you send a message, the route will:

1. Embed the last user message
2. Query Pinecone for the top 5 similar chunks
3. Add those chunks to the system prompt under “Use this knowledge when relevant”
4. Call the model as usual

If `PINECONE_API_KEY` or `PINECONE_INDEX` is missing, the chat still works without RAG (no retrieval).
