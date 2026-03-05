/**
 * RAG: embed with OpenRouter, store/query with Pinecone.
 * Set OPENROUTER_API_KEY, PINECONE_API_KEY, PINECONE_INDEX in env.
 */

const OPENROUTER_EMBED_URL = "https://openrouter.ai/api/v1/embeddings";
const EMBED_MODEL = "openai/text-embedding-3-small";
const EMBED_DIMENSION = 1536;

export type RagMetadata = { text: string };

/** Get embedding for a single string via OpenRouter. */
export async function embedText(text: string): Promise<number[]> {
  const key = process.env.OPENROUTER_API_KEY;
  if (!key) throw new Error("OPENROUTER_API_KEY is not set");

  const res = await fetch(OPENROUTER_EMBED_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ model: EMBED_MODEL, input: text }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`OpenRouter embed failed: ${res.status} ${err}`);
  }

  const data = (await res.json()) as { data: Array<{ embedding: number[] }> };
  const embedding = data.data?.[0]?.embedding;
  if (!Array.isArray(embedding)) throw new Error("Invalid embedding response");
  return embedding;
}

/** Check if RAG (Pinecone) is configured. */
export function isRagConfigured(): boolean {
  return Boolean(
    process.env.PINECONE_API_KEY &&
    (process.env.PINECONE_INDEX || process.env.PINECONE_HOST)
  );
}

/** Query Pinecone for top-k chunks by query embedding; return their text. */
export async function retrieveContext(queryEmbedding: number[], topK = 5): Promise<string[]> {
  const { Pinecone } = await import("@pinecone-database/pinecone");
  const apiKey = process.env.PINECONE_API_KEY;
  const indexName = process.env.PINECONE_INDEX;
  const host = process.env.PINECONE_HOST;
  if (!apiKey || (!indexName && !host)) return [];

  const pc = new Pinecone({ apiKey });
  const index = host
    ? pc.index<RagMetadata>({ host: host.replace(/^https?:\/\//, "") })
    : pc.index<RagMetadata>({ name: indexName! });

  const result = await index.query({
    vector: queryEmbedding,
    topK,
    includeMetadata: true,
    namespace: "huy",
  });

  const texts: string[] = [];
  for (const match of result.matches ?? []) {
    const text = (match.metadata as RagMetadata | undefined)?.text;
    if (typeof text === "string" && text.trim()) texts.push(text.trim());
  }
  return texts;
}
