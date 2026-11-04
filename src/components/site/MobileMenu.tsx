"use client";

import Link from "next/link";
import { useEffect, useId, useRef, useState } from "react";
import type { NavItem } from "@/config/site";
import { strings } from "@/lib/strings";

export function MobileMenu({ items }: { items: readonly NavItem[] }) {
  const [open, setOpen] = useState(false);
  const panelId = useId();
  const buttonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        buttonRef.current?.focus();
      }
    };
    // סגירה אוטומטית אם המסך הורחב לדסקטופ בזמן שהתפריט פתוח
    const desktop = window.matchMedia("(min-width: 768px)");
    const onResize = () => desktop.matches && setOpen(false);

    document.addEventListener("keydown", onKey);
    desktop.addEventListener("change", onResize);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      desktop.removeEventListener("change", onResize);
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <div className="md:hidden">
      <button
        ref={buttonRef}
        type="button"
        aria-expanded={open}
        aria-controls={panelId}
        aria-label={open ? strings.nav.closeMenu : strings.nav.openMenu}
        onClick={() => setOpen((v) => !v)}
        className="relative z-50 -me-2 flex size-11 items-center justify-center"
      >
        <span aria-hidden="true" className="relative block h-3 w-6">
          <span
            className={`absolute inset-x-0 top-0 h-px bg-charcoal transition-transform duration-300 ${
              open ? "translate-y-1.5 rotate-45" : ""
            }`}
          />
          <span
            className={`absolute inset-x-0 bottom-0 h-px bg-charcoal transition-transform duration-300 ${
              open ? "-translate-y-1.5 -rotate-45" : ""
            }`}
          />
        </span>
      </button>

      <div
        id={panelId}
        hidden={!open}
        className="fixed inset-0 z-40 bg-cream pt-24"
      >
        <nav aria-label={strings.nav.mainLabel} className="px-5">
          <ul className="flex flex-col">
            {items.map((item) => (
              <li key={item.href} className="border-b border-charcoal/10">
                <Link
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className="block py-5 font-serif text-2xl"
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </div>
  );
}
