"use client";

import { Boxes, Menu, X } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

const links = [
  { label: "Questions", href: "/problems" },
  { label: "Why SysCode", href: "#features" },
  { label: "How it works", href: "#how-it-works" },
  { label: "FAQ", href: "#faq" },
];

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-white/10 bg-[#070a0f]/80 backdrop-blur-xl">
      <nav
        aria-label="Main navigation"
        className="mx-auto flex h-16 max-w-7xl items-center justify-between px-5 sm:px-8"
      >
        <Link
          href="/"
          className="flex items-center gap-2.5"
          aria-label="SysCode home"
        >
          <span className="grid size-8 place-items-center rounded-lg bg-sky-400 text-slate-950 shadow-[0_0_24px_rgba(56,189,248,0.25)]">
            <Boxes className="size-4" strokeWidth={2.4} />
          </span>
          <span className="text-lg font-semibold tracking-tight text-white">
            SysCode
          </span>
        </Link>

        <div className="hidden items-center gap-8 md:flex">
          {links.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="text-sm font-medium text-slate-400 transition-colors hover:text-white"
            >
              {link.label}
            </a>
          ))}
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/problems"
            className="hidden rounded-lg bg-white px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-sky-100 sm:inline-flex"
          >
            Start practising
          </Link>
          <button
            type="button"
            className="grid size-9 place-items-center rounded-lg border border-white/10 text-slate-300 md:hidden"
            aria-expanded={isOpen}
            aria-controls="mobile-navigation"
            aria-label={isOpen ? "Close navigation" : "Open navigation"}
            onClick={() => setIsOpen((open) => !open)}
          >
            {isOpen ? <X className="size-5" /> : <Menu className="size-5" />}
          </button>
        </div>
      </nav>

      {isOpen && (
        <div
          id="mobile-navigation"
          className="border-t border-white/10 bg-[#090d13] px-5 py-4 md:hidden"
        >
          <div className="mx-auto flex max-w-7xl flex-col gap-1">
            {links.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="rounded-lg px-3 py-3 text-sm font-medium text-slate-300 hover:bg-white/5 hover:text-white"
                onClick={() => setIsOpen(false)}
              >
                {link.label}
              </a>
            ))}
            <Link
              href="/problems"
              className="mt-2 rounded-lg bg-sky-400 px-4 py-3 text-center text-sm font-semibold text-slate-950"
              onClick={() => setIsOpen(false)}
            >
              Start practising
            </Link>
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;
