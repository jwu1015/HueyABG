"use client";

import { useChat } from "@ai-sdk/react";

export function Chat() {
  const { messages, input, handleInputChange, handleSubmit, status, error } =
    useChat({ api: "/api/chat" });

  const isLoading = status === "streaming" || status === "submitted";

  return (
    <div className="chat">
      <div className="messages">
        {messages.length === 0 && (
          <div className="placeholder">Start a conversation...</div>
        )}
        {messages.map((m) => (
          <div key={m.id} className={`message message--${m.role}`}>
            <span className="message-role">
              {m.role === "user" ? "You" : "Huy"}
            </span>
            <div className="message-content">
              {typeof m.content === "string"
                ? m.content
                : Array.isArray(m.content)
                  ? (m.content as Array<{ type: string; text?: string }>).map(
                      (p, i) => (p.type === "text" ? <span key={i}>{p.text}</span> : null)
                    )
                  : null}
            </div>
          </div>
        ))}
      </div>
      {error && (
        <div className="error">
          {error.message || "Something went wrong. Please try again."}
        </div>
      )}
      <form onSubmit={handleSubmit} className="form">
        <input
          className="input"
          value={input}
          onChange={handleInputChange}
          placeholder="Type a message..."
          disabled={isLoading}
        />
        <button type="submit" className="button" disabled={isLoading}>
          {isLoading ? "..." : "Send"}
        </button>
      </form>
    </div>
  );
}
