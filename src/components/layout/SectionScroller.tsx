"use client";

import { useEffect } from "react";

export function SectionScroller() {
  useEffect(() => {
    const sections = Array.from(document.querySelectorAll<HTMLElement>(".snap-section"));
    if (!sections.length) return;

    let locking = false;

    const getScrollableInner = (target: EventTarget | null): HTMLElement | null => {
      let el = target instanceof Element ? target : null;
      while (el && el !== document.body) {
        if (el instanceof HTMLElement && el.classList.contains("snap-section-inner--scroll")) {
          if (el.scrollHeight > el.clientHeight + 2) return el;
          return null;
        }
        el = el.parentElement;
      }
      return null;
    };

    const currentIndex = () => {
      const marker = window.scrollY + window.innerHeight * 0.35;
      let idx = 0;
      for (let i = 0; i < sections.length; i++) {
        if (sections[i].offsetTop <= marker + 4) idx = i;
      }
      return idx;
    };

    const onWheel = (event: WheelEvent) => {
      if (locking) {
        event.preventDefault();
        return;
      }

      const scrollable = getScrollableInner(event.target);
      if (scrollable) {
        const atTop = scrollable.scrollTop <= 0;
        const atBottom =
          scrollable.scrollTop + scrollable.clientHeight >= scrollable.scrollHeight - 2;
        if ((event.deltaY < 0 && !atTop) || (event.deltaY > 0 && !atBottom)) return;
      }

      const idx = currentIndex();
      const next =
        event.deltaY > 0
          ? Math.min(idx + 1, sections.length - 1)
          : Math.max(idx - 1, 0);
      if (next === idx) return;

      event.preventDefault();
      locking = true;
      sections[next].scrollIntoView({ behavior: "smooth", block: "start" });
      window.setTimeout(() => {
        locking = false;
      }, 750);
    };

    window.addEventListener("wheel", onWheel, { passive: false });
    return () => window.removeEventListener("wheel", onWheel);
  }, []);

  return null;
}
