"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { useIsLowPower, useReducedMotion } from "@/hooks/useMediaQuery";
import { setSoundEnabled } from "@/lib/sound";

type AppContextValue = {
  /** Le loader est terminé et le site est révélé */
  isLoaded: boolean;
  setLoaded: () => void;
  /** Micro-sons (désactivés par défaut) */
  soundOn: boolean;
  toggleSound: () => void;
  /** prefers-reduced-motion */
  reducedMotion: boolean;
  /** Mobile / tactile : 3D allégée */
  lowPower: boolean;
};

const AppContext = createContext<AppContextValue | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [soundOn, setSoundOn] = useState(false);
  const reducedMotion = useReducedMotion();
  const lowPower = useIsLowPower();

  const setLoaded = useCallback(() => setIsLoaded(true), []);
  const toggleSound = useCallback(() => setSoundOn((v) => !v), []);

  // Synchronise le moteur audio avec l'état UI
  useEffect(() => setSoundEnabled(soundOn), [soundOn]);

  const value = useMemo(
    () => ({ isLoaded, setLoaded, soundOn, toggleSound, reducedMotion, lowPower }),
    [isLoaded, setLoaded, soundOn, toggleSound, reducedMotion, lowPower],
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp doit être utilisé dans <AppProvider>");
  return ctx;
}
