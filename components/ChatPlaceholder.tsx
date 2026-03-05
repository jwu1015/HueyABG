/**
 * Placeholder for the AI chatbot. The chatbot is not implemented on the
 * main site yet. When you're ready to add it:
 *
 * 1. In app/page.tsx, change:
 *      import { ChatPlaceholder } from "@/components/ChatPlaceholder";
 *      <ChatPlaceholder />
 *    to:
 *      import { Chat } from "@/components/Chat";
 *      <Chat />
 *
 * 2. Ensure app/api/chat/route.ts exists and .env.local has OPENAI_API_KEY.
 *
 * That's it. The chat will appear in this same spot.
 */

export function ChatPlaceholder() {
  return (
    <div className="chat-placeholder" aria-hidden>
      <div className="chat-placeholder-inner">
        <span className="chat-placeholder-icon" aria-hidden>
          💬
        </span>
        <p className="chat-placeholder-text">Chat widget will go here</p>
        <p className="chat-placeholder-hint">
          To enable: use <code>&lt;Chat /&gt;</code> from <code>@/components/Chat</code>
        </p>
      </div>
    </div>
  );
}
