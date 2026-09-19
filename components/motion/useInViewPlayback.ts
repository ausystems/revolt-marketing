"use client";

import { useEffect, type RefObject } from "react";

/** Plays a muted ambient video only while it is on screen; pauses it otherwise. */
export function useInViewPlayback(ref: RefObject<HTMLVideoElement | null>, threshold = 0.15) {
  useEffect(() => {
    const video = ref.current;
    if (!video) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) video.play().catch(() => {});
        else video.pause();
      },
      { threshold },
    );
    io.observe(video);
    return () => io.disconnect();
  }, [ref, threshold]);
}
