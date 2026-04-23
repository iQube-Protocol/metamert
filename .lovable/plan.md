

# Apply three surgical fixes to render the Persona selector reliably

## Change 1 — `src/components/SmartMenuSubmenu.tsx` — Persona branch
In `QuickActionsCarousel.handleAction`, replace the Persona branch:

```ts
if (action.id === "persona") {
  pauseIdleTimer();
  setSubmenuType("personaSelector");
  queueMicrotask(() => pauseIdleTimer());
  return;
}
```

## Change 2 — `src/components/SmartMenuSubmenu.tsx` — `PersonaSelector`
Remove the `onPointerLeave={resumeIdleTimer}` prop from the root element of `PersonaSelector` (~line 456). Keep `onPointerEnter={pauseIdleTimer}`. Selector stays open until a pill or Back is clicked.

## Change 3 — `src/contexts/ShellContext.tsx` — Reference-stable `setSubmenuType`
Add a ref alongside `startIdleTimer`:

```ts
const startIdleTimerRef = useRef(startIdleTimer);
useEffect(() => { startIdleTimerRef.current = startIdleTimer; }, [startIdleTimer]);
```

Rewrite `setSubmenuType` with empty deps:

```ts
const setSubmenuType = useCallback((type: SubmenuType | null) => {
  setSubmenuTypeState(type);
  if (type) {
    setSubmenuVisibility("visibleAuto");
    queueMicrotask(() => startIdleTimerRef.current?.());
  }
}, []);
```

## Not changing
- `selectPersona()`, `postPersonaIQubeOpen`, triple-dispatch helpers
- Cartridge / Identity / Memory / Wallet paths
- `personaState.available` hydration
- `CartridgeSelector` / `CodexSelector` pointer behavior (scope: persona-only this round)
- Runtime (platform) code

## Verify
1. Be → Persona → Qripto + KNYT pills render and stay visible regardless of cursor position.
2. Click KNYT pill → drawer opens in runtime, selector collapses.
3. Click Qripto pill → drawer opens, selector collapses.
4. Be → Identity → drawer opens directly (regression).
5. Play → Cartridge → unchanged (regression).
6. Idle 4s over selector → collapses normally (idle behavior preserved).

