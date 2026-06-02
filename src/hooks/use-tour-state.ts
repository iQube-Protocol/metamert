import { useCallback, useEffect, useState } from "react";

const COMPLETED_KEY = "metame.tour.visitor.completed";
const SKIPPED_KEY = "metame.tour.visitor.skipped";

export type TourState = {
  hasSeen: boolean;
  showWelcome: boolean;
  running: boolean;
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

  // Show welcome modal on first load if user has not seen the tour.
  useEffect(() => {
    if (!hasSeen) {
      const t = setTimeout(() => setShowWelcome(true), 600);
      return () => clearTimeout(t);
    }
  }, [hasSeen]);

  const start = useCallback(() => {
    setShowWelcome(false);
    setRunning(true);
  }, []);

  const skip = useCallback(() => {
    writeFlag(SKIPPED_KEY, true);
    setHasSeen(true);
    setShowWelcome(false);
    setRunning(false);
  }, []);

  const complete = useCallback(() => {
    writeFlag(COMPLETED_KEY, true);
    setHasSeen(true);
    setRunning(false);
  }, []);

  const restart = useCallback(() => {
    writeFlag(SKIPPED_KEY, false);
    writeFlag(COMPLETED_KEY, false);
    setHasSeen(false);
    setShowWelcome(false);
    setRunning(true);
  }, []);

  const dismissWelcome = useCallback(() => setShowWelcome(false), []);

  return { hasSeen, showWelcome, running, start, skip, complete, restart, dismissWelcome };
}
