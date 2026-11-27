import { useSyncExternalStore } from "react";

const query = "(max-width: 720px), (pointer: coarse)";

function subscribe(onChange) {
  const media = window.matchMedia(query);
  if (media.addEventListener) {
    media.addEventListener("change", onChange);
    return () => media.removeEventListener("change", onChange);
  }
  media.addListener(onChange);
  return () => media.removeListener(onChange);
}

function getSnapshot() {
  return window.matchMedia(query).matches;
}

export default function useCompactLayout() {
  return useSyncExternalStore(subscribe, getSnapshot, () => false);
}
