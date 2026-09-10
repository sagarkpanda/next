"use client";

import { ArrowUp } from "lucide-react";
import { useEffect, useState } from "react";

export default function ScrollToTop() {
  const [visible, setVisible] = useState(false);
  const [idle, setIdle] = useState(false);

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout> | undefined;
    const onScroll = () => {
      const show = window.scrollY > 500;
      setVisible(show);
      setIdle(false);
      if (timer) clearTimeout(timer);
      if (show) timer = setTimeout(() => setIdle(true), 2200);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      if (timer) clearTimeout(timer);
    };
  }, []);

  const goTop = () => window.scrollTo({ top: 0, behavior: "smooth" });
  if (!visible) return null;

  return (
    <button
      className={`scroll-top ${idle ? "scroll-top-idle" : ""}`}
      onClick={goTop}
      aria-label="Back to top"
      title="Back to top"
    >
      <ArrowUp size={17} />
    </button>
  );
}
