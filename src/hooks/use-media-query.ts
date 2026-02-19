"use client";

import { useSyncExternalStore } from "react";

export function useMediaQuery(query: string): boolean {
  const getServerSnapshot = (): boolean => false;
  const getSnapshot = (): boolean => window.matchMedia(query).matches;
  const subscribe = (onStoreChange: () => void): (() => void) => {
    const media = window.matchMedia(query);
    media.addEventListener("change", onStoreChange);
    return () => media.removeEventListener("change", onStoreChange);
  };
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}

export function useIsMobile(): boolean {
  return useMediaQuery("(max-width: 768px)");
}

export function useIsTablet(): boolean {
  return useMediaQuery("(min-width: 769px) and (max-width: 1024px)");
}

export function useIsDesktop(): boolean {
  return useMediaQuery("(min-width: 1025px)");
}
