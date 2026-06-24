import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

const ChatScrollButton = ({ containerRef, inputRef }) => {
  const [show, setShow] = useState(false);
  const [topPx, setTopPx] = useState(null);

  useEffect(() => {
    const el = containerRef?.current;
    if (!el) return;

    const handleScroll = () => {
      const { scrollTop, scrollHeight, clientHeight } = el;
      const distanceFromBottom = scrollHeight - scrollTop - clientHeight;
      setShow(distanceFromBottom > 100);
    };

    // initial check
    handleScroll();
    el.addEventListener("scroll", handleScroll, { passive: true });
    const handleResize = () => {
      // recompute top position when layout changes
      computeTop();
    };
    window.addEventListener("resize", handleResize);
    return () => {
      el.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleResize);
    };
  }, [containerRef]);

  const scrollToBottom = () => {
    const el = containerRef?.current;
    if (!el) return;
    el.scrollTo({ top: el.scrollHeight, behavior: "smooth" });
  };

  // compute top position for the button to sit just above the input box
  const computeTop = () => {
    const parent = containerRef?.current;
    const input = inputRef?.current;
    if (!parent || !input) return;

    const buttonSize = 48; // matches w-12 h-12
    const gap = 14; // px gap between button and input
    // input.offsetTop is relative to parent when parent is the offsetParent
    const inputTop = input.offsetTop;
    const top = inputTop - buttonSize - gap;
    setTopPx(top < 8 ? 8 : top);
  };

  useEffect(() => {
    computeTop();
  }, [containerRef, inputRef]);

  return (
    <AnimatePresence>
      {show && (
        <motion.button
          initial={{ opacity: 0, y: 14, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 14, scale: 0.9 }}
          transition={{ type: "spring", stiffness: 360, damping: 26 }}
          onClick={scrollToBottom}
          aria-label="Scroll to bottom"
          style={topPx != null ? { top: `${topPx}px` } : undefined}
          className="absolute left-1/2 -translate-x-1/2 z-20 flex items-center justify-center w-12 h-12 rounded-full bg-gradient-to-br from-cyan-500/20 to-blue-500/20 backdrop-blur-xl border border-white/10 shadow-[0_8px_32px_rgba(6,182,212,0.15)] text-white hover:from-cyan-500/30 hover:to-blue-500/30 hover:border-white/20 hover:shadow-[0_8px_32px_rgba(6,182,212,0.25)] transition-all duration-300 group"
        >
          <div className="absolute inset-0 rounded-full bg-gradient-to-br from-cyan-400/10 to-blue-400/10 blur-xl group-hover:blur-2xl transition-all duration-300" />
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={2.5}
            stroke="currentColor"
            className="w-5 h-5 relative z-10 text-cyan-300 group-hover:text-white transition-colors duration-300"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M19.5 8.25l-7.5 7.5-7.5-7.5"
            />
          </svg>
          {/* Animated ring pulse */}
          <div className="absolute inset-0 rounded-full border border-cyan-400/20 animate-ping" />
        </motion.button>
      )}
    </AnimatePresence>
  );
};

export default ChatScrollButton;
