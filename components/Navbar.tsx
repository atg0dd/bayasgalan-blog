"use client";

import Link from "next/link";
import { useState, useEffect } from "react";

const NAV_LINKS = [
  { label: "Home", href: "/" },
  { label: "Tech", href: "/category/tech" },
  { label: "Personal", href: "/category/personal" },
];

export default function Navbar() {
  const [darkMode, setDarkMode] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    setMounted(true);
    setDarkMode(document.documentElement.classList.contains("dark"));
  }, []);

  const toggleDark = () => {
    const next = !darkMode;
    setDarkMode(next);
    document.documentElement.classList.toggle("dark", next);
    localStorage.setItem("theme", next ? "dark" : "light");
  };

  return (
    <header className="sticky top-0 z-50 py-5">
      {/* ── Floating pill ── */}
      <div className="max-w-[860px] mx-auto px-4">
        <div
          className="flex items-center justify-between px-4 sm:px-7 py-3 rounded-full"
          style={{
            backgroundColor: "var(--navbar-bg)",
            boxShadow: "0 4px 12px rgba(0,0,0,0.2)",
            transition: "background-color 0.3s ease",
          }}
        >
          {/* Brand */}
          <Link
            href="/"
            className="text-[1.2rem] font-medium whitespace-nowrap transition-opacity hover:opacity-80"
            style={{ color: "var(--foreground)", letterSpacing: "-0.5px" }}
          >
            0xbysgln
          </Link>

          {/* Nav links — hidden on mobile */}
          <nav className="hidden md:flex items-center gap-8">
            {NAV_LINKS.map(({ label, href }) => (
              <Link key={href} href={href} className="nav-link">
                {label}
              </Link>
            ))}
          </nav>

          {/* Right: theme toggle + mobile burger */}
          <div className="flex items-center gap-4">
            {/* Portfolio-style pill toggle */}
            {mounted && (
              <button
                onClick={toggleDark}
                aria-label="Toggle theme"
                style={{
                  display: "flex",
                  alignItems: "center",
                  cursor: "pointer",
                  background: "transparent",
                  border: "2px solid var(--accent)",
                  padding: "2px",
                  width: "44px",
                  height: "24px",
                  borderRadius: "20px",
                  boxSizing: "border-box",
                  transition: "border-color 0.3s ease",
                  flexShrink: 0,
                }}
              >
                <span
                  style={{
                    display: "block",
                    width: "16px",
                    height: "16px",
                    borderRadius: "50%",
                    backgroundColor: "var(--accent)",
                    transition:
                      "transform 0.3s cubic-bezier(0.4,0,0.2,1), background-color 0.3s ease",
                    transform: darkMode ? "translateX(20px)" : "translateX(0)",
                  }}
                />
              </button>
            )}

            {/* Mobile burger */}
            <button
              className="md:hidden"
              onClick={() => setMobileOpen(!mobileOpen)}
              aria-label="Toggle menu"
              style={{ color: "var(--accent)" }}
            >
              {mobileOpen ? (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M18 6 6 18M6 6l12 12" />
                </svg>
              ) : (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="4" x2="20" y1="6" y2="6" />
                  <line x1="4" x2="20" y1="12" y2="12" />
                  <line x1="4" x2="20" y1="18" y2="18" />
                </svg>
              )}
            </button>
          </div>
        </div>

        {/* Mobile dropdown */}
        {mobileOpen && (
          <div
            className="md:hidden mt-2 rounded-2xl px-6 py-4 flex flex-col gap-3"
            style={{
              backgroundColor: "var(--navbar-bg)",
              boxShadow: "0 4px 12px rgba(0,0,0,0.2)",
            }}
          >
            {NAV_LINKS.map(({ label, href }) => (
              <Link
                key={href}
                href={href}
                className="nav-link text-base"
                onClick={() => setMobileOpen(false)}
              >
                {label}
              </Link>
            ))}
          </div>
        )}
      </div>
    </header>
  );
}
