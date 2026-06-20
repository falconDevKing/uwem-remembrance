"use client";

import { useEffect, useState } from "react";

export default function ScrollDownButton() {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    function handleScroll() {
      setVisible(window.scrollY < 200);
    }
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  function scrollDown() {
    const form = document.getElementById("registration-form");
    if (form) {
      form.scrollIntoView({ behavior: "smooth" });
    }
  }

  if (!visible) return null;

  return (
    <button
      onClick={scrollDown}
      aria-label="Scroll to registration form"
      className="fixed bottom-6 left-1/2 z-50 flex -translate-x-1/2 items-center gap-2 rounded-full bg-gold-dark px-5 py-3 text-sm font-semibold text-white shadow-lg transition-opacity hover:bg-gold lg:hidden"
    >
      Register Below
      <svg
        className="h-4 w-4 animate-bounce"
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth={2.5}
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="m19.5 8.25-7.5 7.5-7.5-7.5"
        />
      </svg>
    </button>
  );
}
