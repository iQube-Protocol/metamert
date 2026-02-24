

## Visual Alignment: Menu System Parity with Reference Screenshots

### Summary

Align the thin-client shell UI to match the reference screenshots. The key architectural change is that the welcome-state prompt box is rendered by the iframe (not the shell), and the shell only renders prompt + quick links in post-welcome state. A "refresh" action resets to the iframe welcome screen.

---

### State Machine

```text
WELCOME (initial)
  - iframe renders its own centered prompt ("What do you want to do today?")
  - Shell renders: Header + Quick Links row (icon-only) + Bottom Nav
  - No shell prompt box

POST-WELCOME (after first menu action)
  - iframe renders content (capsule cards etc.)
  - Shell renders: Header + [collapsible Quick Links] + Prompt Box + Bottom Nav
  - Prompt box has send button + chevron to toggle quick links visibility

REFRESH (menu action "refresh")
  - Resets shellState back to "welcome"
  - Sends NAVIGATE or CONTEXT_UPDATE to iframe to reload welcome screen
```

---

### Changes Required

**1. Restructure layout in `src/pages/Index.tsx`**

- Remove `PromptBox` from above the iframe
- Move prompt box + quick links to a new `BottomPanel` component that sits between the iframe and the bottom nav
- In welcome state: only show quick links row (no prompt box -- iframe has it)
- In post-welcome state: show collapsible quick links + prompt box with send + chevron

**2. Redesign quick links in `src/components/SmartMenu.tsx` (or extract to `QuickLinksBar`)**

Current: text-label pills (`rounded-full bg-accent px-3 py-1 text-[11px]`)
Target: icon-only buttons in bordered rounded rectangles, horizontally scrollable

- Each quick link renders as a bordered rectangle with only an icon (no label text)
- Horizontally scrollable row with `overflow-x-auto` and `flex-nowrap`
- Use `resolveIcon()` for each quick link's icon field
- Visible in both welcome and post-welcome states (collapsible in post-welcome via chevron)

**3. Create `src/components/PromptBox.tsx`**

A dedicated prompt box component (post-welcome only) with:
- Full-width input field: "What do you want to do today?"
- Send icon button (paper plane) on the right
- Chevron toggle button (right of send) to expand/collapse quick links
- On submit: forward prompt text to iframe via `postToIframe` as a new message type or via `MENU_ACTION`
- Styling: dark card background, rounded, border

**4. Add active item highlight in bottom nav**

- Track which triad item is active (from last menu action or from iframe NAVIGATE messages)
- Active item gets a highlight ring/circle around its icon (matching the Play highlight in screenshots)
- Add `activeItem` state to `ShellContext`

**5. Update `src/contexts/ShellContext.tsx`**

- Add `activeMenuItem: string | null` state, set on `handleMenuAction`
- Add `quickLinksExpanded: boolean` state with toggle
- Add `resetToWelcome()` function that sets shellState back to "welcome" and sends reset to iframe
- Wire "refresh" menu action to call `resetToWelcome()`
- Show quick links in both states (not just welcome)

**6. Update `DEFAULT_SHELL_CONFIG` in proxy**

- Add icon fields to quick_links entries so they render as icon-only buttons
- Update `state_behavior.post_welcome` to `{ show_prompt: true, collapse_quick_links: false }`

**7. Coordinate with Windsurf**

- Send QubeTalk message to `#ui-shell` confirming: welcome prompt is iframe-owned, shell takes over prompt in post-welcome, "refresh" resets to iframe welcome
- Request confirmation of iframe message type for prompt submission and welcome-reset

---

### File Change List

| File | Change |
|------|--------|
| `src/pages/Index.tsx` | Remove inline PromptBox, add BottomPanel between iframe and nav |
| `src/components/PromptBox.tsx` | New: input + send + chevron toggle component |
| `src/components/QuickLinksBar.tsx` | New: horizontally scrollable icon-only quick link buttons |
| `src/components/SmartMenu.tsx` | Remove quick links rendering (moved out), add active item highlight |
| `src/contexts/ShellContext.tsx` | Add activeMenuItem, quickLinksExpanded, resetToWelcome |
| `src/lib/shell-messages.ts` | Add PROMPT_SUBMIT and RESET_WELCOME outbound message types |
| `supabase/functions/aa-proxy/index.ts` | Add icons to quick_links, update state_behavior defaults |

---

### Technical Details

#### QuickLinksBar layout

```text
[ icon ] [ icon ] [ icon ] [ icon ] [ icon ] [ icon ] [ icon ] [ icon ]
  ^-- horizontally scrollable, icon-only, bordered rounded rectangles
```

Each button: `w-[120px] h-10 rounded-lg border border-border flex items-center justify-center`

#### PromptBox layout (post-welcome)

```text
+-------------------------------------------------------+----------+-----+
| What do you want to do today?                         | [send] | [v] |
+-------------------------------------------------------+----------+-----+
```

- Chevron `v` (ChevronDown) when quick links visible, `>` (ChevronRight) when collapsed
- Send button: paper plane icon

#### Active menu item highlight

The active triad item (e.g., Play) gets a circular highlight background behind its icon, using a contrasting ring color (e.g., `ring-2 ring-primary` or a colored circle).

#### New postMessage types

```typescript
| { type: "PROMPT_SUBMIT"; text: string }
| { type: "RESET_WELCOME" }
```

These let the shell forward user prompt text to the iframe runtime and request a welcome-screen reset.

