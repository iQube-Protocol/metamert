

## Problem

On mobile/tablet, when the virtual keyboard opens (user taps the PromptBox input), the browser shifts the viewport up. When the keyboard dismisses, the viewport doesn't return to its original position — the app stays "pushed up" and requires a manual scroll/pull to restore.

This is a well-known mobile browser behavior caused by the combination of:
1. **`h-screen` (100vh)** on the shell container — on mobile browsers, `100vh` includes the area behind the URL bar and doesn't update dynamically when the keyboard appears/disappears, leaving a gap.
2. **No `visualViewport` resize listener** — the app doesn't react to keyboard show/hide events to reset scroll position.
3. **Missing `interactive-widget=resizes-content` viewport meta tag** — modern mobile browsers support this hint to properly resize content when the keyboard appears.

## Fix

### 1. `index.html` — Add viewport meta hint
Add `interactive-widget=resizes-content` to the existing viewport meta tag. This tells the browser to resize the layout viewport when the keyboard appears/disappears instead of just panning.

### 2. `src/index.css` — Use `dvh` instead of `vh`
No direct change needed here since `h-screen` is used via Tailwind, but we address it in the component.

### 3. `src/pages/Index.tsx` — Replace `h-screen` with `h-dvh` and add keyboard dismiss handler
- Change the shell container from `h-screen` to `h-dvh` (dynamic viewport height, supported by all modern mobile browsers, falls back gracefully).
- Add a `visualViewport` resize listener that scrolls the document back to `(0,0)` when the viewport height increases (keyboard closing). This is the safety net for browsers that don't fully support `interactive-widget`.

### 4. `src/components/PromptBox.tsx` — Blur input on submit
After `handleSubmit`, call `document.activeElement?.blur()` to dismiss the keyboard, preventing the viewport from staying shifted after sending a prompt.

