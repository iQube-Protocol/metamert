

# Restore Rich Contextual Prompts & Runtime-Driven Features

## Analysis

**"Explore Further" recommendations** and **wallet action item buttons** are features rendered **inside the runtime iframe** (`dev-beta.aigentz.me`), not by the thin client shell. They appear when the runtime receives a prompt or menu action, runs LLM inference, and renders rich content modules (recommendation cards, wallet action buttons) in response. The shell's job is to send the right triggers.

Currently, quick action taps call `handleMenuAction(action.id)` which sends a `MENU_ACTION` envelope. When the upstream is down, the fallback returns a generic `{ intent: itemId, prompt: "Launching {itemId}…" }` — not enough to trigger rich inference responses.

**The fix**: Add rich contextual prompts to each quick action so they use `submitPrompt()` instead, sending a `PROMPT_SUBMIT` directly to the runtime. When LLM providers come back online, these prompts will trigger the runtime to generate "Explore Further" recommendations and wallet action buttons.

## Changes

### 1. `src/lib/smart-menu-config.ts` — Add `prompt` field to QuickActionDef

Add optional `prompt?: string` to the interface and populate inference-triggering actions:

| Mode | Action | Prompt |
|------|--------|--------|
| **Play** | Watch | "Show me something interesting to watch" |
| | Listen | "Play something for me to listen to" |
| | Read | "Find me something good to read" |
| | Find | "Search and discover something new for me" |
| | Be | "Show me who I can be" |
| **Be** | Vault | "Open my secure vault" |
| | Memory | "Show my memory and context history" |
| | Policy | "Review my current policies and settings" |
| | Identity | "Show my identity and credentials" |
| | Presence | "Show my presence and availability status" |
| **Earn** | Goal | "Show my current goals and progress" |
| | Task | "What tasks should I work on next?" |
| | Reward | "Show my rewards and achievements" |
| | Offer | "Find offers and deals available to me" |
| | Opportunity | "Discover new opportunities for me" |
| | Wallet | "Show my wallet balances and recent transactions" |
| **Make** | Write | "Help me write something" |
| | Design | "Help me design something creative" |
| | Build | "Help me build something new" |
| | Edit | "Help me edit and refine my work" |
| | Remix | "Remix something creative for me" |
| | Publish | "Help me publish my work" |
| **Share** | Send | "Send a message for me" |
| | Publish | "Publish and share my content" |
| | Export | "Export my data and content" |
| | Connect | "Connect me with someone" |
| | Collaborate | "Start a collaboration session" |
| | Deliver | "Deliver my content to its destination" |

System-only actions (Cartridge, Persona, Reset, Share) remain without prompts — handled by existing system logic.

### 2. `src/components/SmartMenuSubmenu.tsx` — Route prompt actions through `submitPrompt`

In `QuickActionsCarousel`, pull `submitPrompt` from `useShell()` and update `handleAction`:

```
if (action.prompt) {
  submitPrompt(action.prompt);
} else {
  handleMenuAction(action.id);
}
```

This ensures tapping "Watch" sends `PROMPT_SUBMIT: "Show me something interesting to watch"` to the runtime, which triggers full inference including "Explore Further" recommendations and contextual action buttons (like wallet actions in Earn mode).

### What this restores

Once LLM inference resumes (Venice/Anthropic/ChainGPT):
- **Explore Further**: Runtime receives rich prompts, runs inference, renders recommendation cards
- **Wallet action buttons**: Earn mode prompts ("Show my wallet balances…") trigger the runtime's wallet UI module
- **All quick actions**: Every tap sends a meaningful prompt instead of a generic menu-action fallback

