import { streamText } from "ai";
import { createOpenAI } from "@ai-sdk/openai";
import { embedText, isRagConfigured, retrieveContext } from "@/lib/rag";

/** Edit this to "train" the bot: personality, tone, rules, topics to avoid. */
const SYSTEM_PROMPT_BASE = `You are Huy. You help people build confidence and charm when talking to ABGs (Asian Baby Girls). Keep it fun, supportive, and a bit playful. Give practical, specific advice—conversation starters, body language, how to read signals. Stay respectful and never creepy or pushy. Keep replies concise (a few short paragraphs max) unless the user asks for more.`;

const openRouter = createOpenAI({
  baseURL: "https://openrouter.ai/api/v1",
  apiKey: process.env.OPENROUTER_API_KEY,
  compatibility: "compatible",
  headers: {
    ...(process.env.OPENROUTER_HTTP_REFERER && {
      "HTTP-Referer": process.env.OPENROUTER_HTTP_REFERER,
    }),
    ...(process.env.OPENROUTER_TITLE && {
      "X-OpenRouter-Title": process.env.OPENROUTER_TITLE,
    }),
  },
});

export const maxDuration = 30;

function getLastUserMessageContent(messages: Array<{ role: string; content?: unknown }>): string | null {
  for (let i = messages.length - 1; i >= 0; i--) {
    const m = messages[i];
    if (m.role === "user") {
      const c = m.content;
      return typeof c === "string" ? c : Array.isArray(c) ? (c.find((p: { type?: string; text?: string }) => p.type === "text")?.text ?? null) : null;
    }
  }
  return null;
}

export async function POST(req: Request) {
  try {
    if (!process.env.OPENROUTER_API_KEY) {
      console.error("OPENROUTER_API_KEY is not set (e.g. in Vercel Environment Variables)");
      return new Response(
        JSON.stringify({ error: "Server misconfigured: OPENROUTER_API_KEY is missing. Add it in Vercel → Project → Settings → Environment Variables." }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }
    const { messages } = await req.json();
    let system = SYSTEM_PROMPT_BASE;

    if (isRagConfigured()) {
      const query = getLastUserMessageContent(messages);
      if (query && query.trim()) {
        try {
          const embedding = await embedText(query.trim());
          const contextChunks = await retrieveContext(embedding, 5);
          if (contextChunks.length > 0) {
            system += `\n\nUse this knowledge when relevant (from your tips and notes):\n\n${contextChunks.join("\n\n---\n\n")}`;
          }
        } catch (ragErr) {
          console.error("RAG retrieval error:", ragErr);
        }
      }
    }

    const result = streamText({
      model: openRouter("openai/gpt-4o-mini"),
      system,
      messages,
      onError: (err) => {
        console.error("OpenRouter stream error:", err);
      },
      // Tools disabled for now — OpenRouter streaming can mis-parse with tools in AI SDK v4
      // tools: { getWeather: tool({ ... }) },
    });
    return result.toDataStreamResponse({
      getErrorMessage: (err) =>
        err instanceof Error ? err.message : String(err),
    });
  } catch (err) {
    console.error("Chat route error:", err);
    return new Response(
      JSON.stringify({ error: "Failed to process chat request" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
