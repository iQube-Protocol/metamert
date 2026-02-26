

## Analysis: Floating Menu Disappears Then Reappears

### Root Cause

The `shellState` prop changes from `"welcome"` to `"post-welcome"` during hydration or iframe signals. When this prop changes, the `FloatingOverlay` component re-renders, which triggers the `useEffect` on line 71-74 (because `scheduleHide` is in the dependency array). This effect calls `scheduleHide()` again — but it does NOT reset `visible` to `true` first.

Here's the sequence:
1. Timer fires after 4s → `visible = false` → overlay fades out (correct)
2. `shellState` changes (e.g. iframe sends `INFERENCE_COMPLETE` which sets `shellState` to `"post-welcome"`) → component re-renders
3. The `useEffect` fires `scheduleHide()` — but `visible` is still `false`
4. The `showPrompt` / `showQuickLinks` derived values change (because `isWelcome` flips), causing the overlay content to change
5. React re-renders with new content, but `visible` remains `false` for 300ms (the CSS transition duration), then the new 4s timer hasn't set it back to `true`

The flicker happens because on state transitions, the overlay content changes (prompt appears/disappears) triggering a visual re-layout, but the visibility isn't explicitly restored.

### Fix

When `shellState` changes, reset `visible` to `true` and restart the hide timer. This ensures the overlay is always shown fresh after a state transition, then auto-hides after 4s.

**File: `src/pages/Index.tsx`**

Replace the single `useEffect` with one that watches `shellState`:

```typescript
useEffect(() => {
  setVisible(true);
  scheduleHide();
  return () => { if (timerRef.current) clearTimeout(timerRef.current); };
}, [scheduleHide, shellState]);
```

This adds `shellState` to the dependency array and calls `setVisible(true)` before scheduling the hide — so on every state transition the overlay appears, then auto-hides after 4s. On initial mount it also starts visible (which matches the current `useState(true)` initial value, so no change there).

