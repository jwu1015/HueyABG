# Adding the chatbot to your website

The chatbot code is already in the project; it’s just not shown on the main page. To enable it:

## 1. One change on the home page

In **`app/page.tsx`**:

- Replace the placeholder import and component with the real chat:

```tsx
// Replace this:
import { ChatPlaceholder } from "@/components/ChatPlaceholder";
// ...
<ChatPlaceholder />

// With this:
import { Chat } from "@/components/Chat";
// ...
<Chat />
```

The chat will appear in the same “Need help?” section.

## 2. Environment

- Copy `.env.example` to `.env.local` and set **`OPENROUTER_API_KEY`** (create one at [openrouter.ai](https://openrouter.ai)).
- Optional: set `OPENROUTER_HTTP_REFERER` and `OPENROUTER_TITLE` for rankings on OpenRouter.
- Restart the dev server after changing env.

## 3. Optional: embed page (for iframes)

To use **`/embed`** as a standalone chat page or in an iframe, in **`app/embed/page.tsx`** change `ChatPlaceholder` to `Chat` (same swap as the home page). Then you can embed it elsewhere with:

```html
<iframe
  src="https://your-domain.com/embed"
  title="Chat"
  width="400"
  height="480"
  style="border: none; border-radius: 12px;"
></iframe>
```

---

**Summary:** Swap `<ChatPlaceholder />` for `<Chat />` in `app/page.tsx` and set `OPENAI_API_KEY`. Nothing else is required.
