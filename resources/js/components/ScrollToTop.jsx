import { useEffect } from "react";
import { useLocation, useNavigationType } from "react-router-dom";
import { getHomeAnchorFromHash } from "@/lib/homeSectionAnchors";
import { scrollToSection } from "@/lib/scrollToSection";

export default function ScrollToTop() {
  const { pathname, hash } = useLocation();
  const navigationType = useNavigationType();

  useEffect(() => {
    if (navigationType === "POP") return;

    const anchorId = getHomeAnchorFromHash(hash);
    if (anchorId) {
      let attempts = 0;
      const maxAttempts = 12;

      const tryScroll = () => {
        attempts += 1;
        const scrolled = scrollToSection(anchorId, { behavior: "smooth" });
        if (scrolled || attempts >= maxAttempts) return;
        window.setTimeout(tryScroll, 80);
      };

      const timer = window.setTimeout(tryScroll, 50);
      return () => window.clearTimeout(timer);
    }

    window.scrollTo({ top: 0, left: 0, behavior: "instant" });
  }, [pathname, hash, navigationType]);

  return null;
}
