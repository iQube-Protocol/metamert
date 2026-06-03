import { useCallback, useEffect, useRef, useState } from "react";

const COMPLETED_KEY = "metame.tour.visitor.completed";
const SKIPPED_KEY = "metame.tour.visitor.skipped";

export type TourState = {
  hasSeen: boolean;
  showWelcome: boolean;
  running: boolean;
  /** Incremented on every (re)start so consumers can force-remount the tour. */
  runKey: number;
  start: () => void;
  skip: () => void;
  complete: () => void;
  restart: () => void;
  dismissWelcome: () => void;
};

function readFlag(key: string): boolean {
  try { return localStorage.getItem(key) === "1"; } catch { return false; }
}
function writeFlag(key: string, v: boolean) {
  try { v ? localStorage.setItem(key, "1") : localStorage.removeItem(key); } catch { /* noop */ }
}

export function useTourState(): TourState {
  const [hasSeen, setHasSeen] = useState<boolean>(() => readFlag(COMPLETED_KEY) || readFlag(SKIPPED_KEY));
  const [showWelcome, setShowWelcome] = useState<boolean>(false);
  const [running, setRunning] = useState<boolean>(false);
  const [runKey, setRunKey] = useState<number>(0);
  const startTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearStartTimer = useCallback(() => {
    if (startTimerRef.current) {
      clearTimeout(startTimerRef.current);
      startTimerRef.current = null;
    }
  }, []);

  // Show welcome modal on first load if user has not seen the tour.
  useEffect(() => {
    if (!hasSeen && !running) {
      const t = setTimeout(() => setShowWelcome(true), 600);
      return () => clearTimeout(t);
    }
  }, [hasSeen, running]);

  useEffect(() => () => clearStartTimer(), [clearStartTimer]);

  const start = useCallback(() => {
    clearStartTimer();
    setShowWelcome(false);
    setRunning(false);
    setRunKey((k) => k + 1);
    startTimerRef.current = setTimeout(() => {
      startTimerRef.current = null;
      setRunning(true);
    }, 260);
  }, [clearStartTimer]);

  const skip = useCallback(() => {
    clearStartTimer();
    writeFlag(SKIPPED_KEY, true);
    setHasSeen(true);
    setShowWelcome(false);
    setRunning(false);
  }, [clearStartTimer]);

  const complete = useCallback(() => {
    clearStartTimer();
    writeFlag(COMPLETED_KEY, true);
    setHasSeen(true);
    setRunning(false);
  }, [clearStartTimer]);

  const restart = useCallback(() => {
    clearStartTimer();
    writeFlag(SKIPPED_KEY, false);
    writeFlag(COMPLETED_KEY, false);
    setHasSeen(false);
    setShowWelcome(false);
    // Force a clean remount of the Joyride instance so a previously
    // finished tour can be restarted cleanly from step 0.
    setRunning(false);
    setRunKey((k) => k + 1);
    startTimerRef.current = setTimeout(() => {
      startTimerRef.current = null;
      setRunning(true);
    }, 120);
  }, [clearStartTimer]);

  const dismissWelcome = useCallback(() => setShowWelcome(false), []);

  return { hasSeen, showWelcome, running, runKey, start, skip, complete, restart, dismissWelcome };
}
