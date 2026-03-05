/**
 * Ingest content/*.md into Pinecone for RAG.
 * Requires: OPENROUTER_API_KEY, PINECONE_API_KEY, PINECONE_INDEX in .env.local
 * Pinecone index must exist with dimension 1536 (openai/text-embedding-3-small).
 *
 * Run: npm run ingest   (loads .env.local from project root)
 */

import { readFileSync, readdirSync } from "fs";
import { join, extname } from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");
const CONTENT_DIR = join(ROOT, "content");

const OPENROUTER_EMBED_URL = "https://openrouter.ai/api/v1/embeddings";
const EMBED_MODEL = "openai/text-embedding-3-small";

function loadEnv() {
  try {
    const envPath = join(ROOT, ".env.local");
    const content = readFileSync(envPath, "utf8");
    for (const line of content.split("\n")) {
      const m = line.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)$/);
      if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^["']|["']$/g, "").trim();
    }
  } catch (_) {}
}

async function embed(text) {
  const res = await fetch(OPENROUTER_EMBED_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ model: EMBED_MODEL, input: text }),
  });
  if (!res.ok) throw new Error(`Embed failed: ${res.status} ${await res.text()}`);
  const data = await res.json();
  return data.data[0].embedding;
}

function chunkMarkdown(text) {
  const chunks = [];
  const sections = text.split(/(?=^## )/m);
  for (const section of sections) {
    const trimmed = section.trim();
    if (!trimmed) continue;
    if (trimmed.length <= 600) {
      chunks.push(trimmed);
    } else {
      const paras = trimmed.split(/\n\n+/);
      let buf = "";
      for (const p of paras) {
        if (buf.length + p.length + 2 > 600) {
          if (buf) chunks.push(buf.trim());
          buf = p;
        } else {
          buf = buf ? buf + "\n\n" + p : p;
        }
      }
      if (buf) chunks.push(buf.trim());
    }
  }
  return chunks;
}

async function main() {
  loadEnv();
  if (!process.env.OPENROUTER_API_KEY || !process.env.PINECONE_API_KEY) {
    console.error("Set OPENROUTER_API_KEY and PINECONE_API_KEY (e.g. in .env.local)");
    process.exit(1);
  }
  const host = process.env.PINECONE_HOST?.replace(/^https?:\/\//, "");
  const indexName = process.env.PINECONE_INDEX;
  if (!host && !indexName) {
    console.error("Set PINECONE_INDEX or PINECONE_HOST (e.g. huy-rag-xxx.svc.region.pinecone.io)");
    process.exit(1);
  }

  const { Pinecone } = await import("@pinecone-database/pinecone");
  const pc = new Pinecone({ apiKey: process.env.PINECONE_API_KEY });
  const index = host ? pc.index({ host }) : pc.index({ name: indexName });

  let allChunks = [];
  const files = readdirSync(CONTENT_DIR).filter((f) => extname(f).toLowerCase() === ".md");
  for (const file of files) {
    const path = join(CONTENT_DIR, file);
    const text = readFileSync(path, "utf8");
    const chunks = chunkMarkdown(text);
    allChunks = allChunks.concat(chunks.map((c) => ({ text: c, source: file })));
  }

  if (allChunks.length === 0) {
    console.log("No .md files in content/");
    return;
  }

  console.log(`Upserting ${allChunks.length} chunks...`);
  const records = [];
  for (let i = 0; i < allChunks.length; i++) {
    const { text, source } = allChunks[i];
    const vector = await embed(text);
    records.push({
      id: `huy-${source}-${i}`,
      values: vector,
      metadata: { text, source },
    });
  }

  await index.upsert({ records, namespace: "huy" });
  console.log("Done.");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
