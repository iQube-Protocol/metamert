

# Spec vs Implementation: Differences Found

## Matching (No Changes Needed)
- Five-button default nav: Be | Earn | Play | Make | Share -- correct
- Nav-to-prompt morph on mode tap -- correct
- Prompt bar replaces bottom nav at same height (3.25rem) -- correct
- Floating quick action layer above prompt -- correct
- Auto-hide after idle -- implemented (but see timing diff below)
- Chevron toggle for manual show/hide of quick actions -- correct
- Mic + Send + Chevron controls on right side -- correct
- Carousel swipe does NOT reset idle timer -- correct
- Send keeps prompt open -- correct
- Tap active mode again to collapse -- correct
- Play mode quick action order: Be | Find | Listen | Watch | Read | Cartridge | Share | Reset -- correct
- Visible fold: Find | Listen | Watch | Read | Cartridge at 20% width each -- correct
- Be, Share, Reset off-screen via scroll -- correct
- Watch centered (defaultCenteredQuickActionId) -- correct
- Mode accent colors (Play=cyan, Make=magenta, Earn=green, Be=blue, Share=amber) -- correct
- Bright white prompt text -- correct
- Dual-event model (menu action + mode activation) -- correct
- Reset does not trigger LLM behavior -- correct
- Edge fade cues on carousel -- correct
- Codex nested within Cartridge (not in menu level) -- correct
- All five modes (Be, Earn, Play, Make, Share) activate prompt mode -- correct

## Differences Found

### 1. Idle timeout: Spec says 3 seconds for quick action layer, implementation uses 4 seconds
The spec states the floating quick action layer "should auto-hide after **3 seconds** idle." However, the global idle timeout section says "**4 seconds**." These contradict each other. The current implementation uses **4000ms** for everything (both quick action auto-hide AND full prompt collapse). The spec seems to intend:
- Quick action floating layer: 3s auto-hide
- Full prompt/mode collapse: 4s idle timeout

Currently both share a single 4s timer that collapses the entire prompt mode (not just the quick actions).

### 2. Missing collapse gestures: swipe-down and tap-outside
The spec lists these collapse mechanisms:
- ✅ 4s inactivity
- ❌ **Swipe down to collapse** -- not implemented
- ❌ **Tap outside to collapse** -- not implemented  
- ✅ Tap active mode button again

### 3. Prompt text size: spec says "about 1 point larger than current"
The input uses `text-sm` (14px). The spec requests it be ~1pt larger. Currently unchanged from standard size.

### 4. Missing animations from spec
- ❌ **Active mode color wash** -- no background tint on prompt bar beyond the pill
- ❌ **Slight pop on selected mode** -- no scale animation on mode activation
- ❌ **Prompt expansion from active button** -- no origin-based expand animation
- ❌ **Waveform animation for voice state** -- mic button is static placeholder
- ❌ **Calm collapse motion** -- collapse is instant (no exit animation)

### 5. Idle timer reset events: "prompt text remaining non-empty" not implemented
The spec says the idle timer should reset when "prompt text remaining non-empty." Currently, the timer runs regardless of whether text is in the input. If a user types something and stops interacting, the prompt collapses after 4s even with text still present.

### 6. Be and Share accent styling on prompt bar
Spec says mode accent colors should reflect in "send button, accent piping/trim, subtle active-state highlight." Currently only the send button and caret use accent color. The prompt bar border/trim does not reflect the mode color.

## Summary of Required Changes (if you want full spec compliance)

1. **Split idle timers**: 3s for quick action layer auto-hide, 4s for full prompt collapse
2. **Add swipe-down collapse** gesture on prompt bar
3. **Add tap-outside collapse** (click on iframe/runtime area)
4. **Bump prompt text size** ~1pt (from `text-sm` to ~15px)
5. **Add entry/exit animations**: mode pop, color wash, collapse fade-out
6. **Prevent collapse when prompt has text** (idle timer should not fire if input is non-empty)
7. **Add accent trim/piping** to prompt bar border matching active mode color

