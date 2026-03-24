import Link from "next/link";

export default function Footer() {
  return (
    <footer
      className="mt-16 py-10"
      style={{ borderTop: "1px solid var(--border-color)" }}
    >
      <div
        className="max-w-[1000px] mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-5"
      >
        {/* Left */}
        <div className="flex items-center gap-6">
          <Link
            href="/"
            className="text-lg font-medium transition-opacity hover:opacity-75"
            style={{ color: "var(--foreground)", letterSpacing: "-0.5px" }}
          >
            0xbysgln
          </Link>
          <span className="text-sm" style={{ color: "var(--muted)" }}>
            Thoughts on code, systems, and life.
          </span>
        </div>

        {/* Right links */}
        <nav className="flex items-center gap-8">
          {[
            { label: "Home", href: "/" },
            { label: "Tech", href: "/category/tech" },
            { label: "Personal", href: "/category/personal" },
          ].map(({ label, href }) => (
            <Link key={href} href={href} className="footer-link">
              {label}
            </Link>
          ))}
        </nav>
      </div>

      <p className="text-center text-xs mt-6" style={{ color: "var(--muted)" }}>
        © {new Date().getFullYear()} Bayasgalan. All rights reserved.
      </p>
    </footer>
  );
}
