"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import { strings } from "@/lib/strings";

export type GalleryImage = {
  id: string;
  src: string;
  alt: string;
};

const SWIPE_THRESHOLD = 50;

/**
 * גלריה עם lightbox. מבוסס על <dialog> מובנה: מלכודת פוקוס, Esc לסגירה
 * והחזרת הפוקוס לתמונה שנפתחה מגיעים מהדפדפן.
 * האתר RTL, ולכן "הבאה" נמצאת משמאל: חץ שמאלה = הבאה, חץ ימינה = הקודמת,
 * ובמובייל החלקה ימינה מביאה את התמונה הבאה.
 */
export function Gallery({ images }: { images: GalleryImage[] }) {
  const t = strings.gallery;
  const dialogRef = useRef<HTMLDialogElement>(null);
  const touchStartX = useRef<number | null>(null);
  const [index, setIndex] = useState<number | null>(null);
  const total = images.length;

  const open = (i: number) => {
    setIndex(i);
    dialogRef.current?.showModal();
  };

  const close = useCallback(() => dialogRef.current?.close(), []);

  const step = useCallback(
    (delta: number) =>
      setIndex((i) => (i === null ? i : (i + delta + total) % total)),
    [total],
  );

  useEffect(() => {
    if (index === null) return;
    const rtl = document.documentElement.dir === "rtl";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") step(rtl ? 1 : -1);
      else if (e.key === "ArrowRight") step(rtl ? -1 : 1);
      else return;
      e.preventDefault();
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [index, step]);

  const onTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const onTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return;
    const dx = e.changedTouches[0].clientX - touchStartX.current;
    touchStartX.current = null;
    if (Math.abs(dx) < SWIPE_THRESHOLD) return;
    const rtl = document.documentElement.dir === "rtl";
    // LTR: החלקה שמאלה (dx<0) = הבאה. RTL: הפוך.
    step((dx < 0) !== rtl ? 1 : -1);
  };

  if (total === 0) return null;
  const current = index === null ? null : images[index];

  return (
    <>
      <ul className="grid grid-cols-2 gap-3 md:grid-cols-3 md:gap-5">
        {images.map((img, i) => (
          <li key={img.id}>
            <button
              type="button"
              onClick={() => open(i)}
              aria-label={img.alt || t.openImage(i + 1, total)}
              className="group relative block aspect-3/2 w-full overflow-hidden bg-charcoal/5"
            >
              <Image
                src={img.src}
                alt=""
                fill
                sizes="(min-width: 1152px) 357px, (min-width: 768px) 33vw, 50vw"
                className="object-cover motion-safe:transition-transform motion-safe:duration-[1.2s] motion-safe:ease-out motion-safe:group-hover:scale-[1.04]"
              />
            </button>
          </li>
        ))}
      </ul>

      <dialog
        ref={dialogRef}
        aria-label={t.dialogLabel}
        onClose={() => setIndex(null)}
        onClick={(e) => e.target === e.currentTarget && close()}
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
        className="m-0 h-dvh max-h-none w-dvw max-w-none bg-charcoal p-0 text-cream backdrop:bg-charcoal/60"
      >
        {current && index !== null && (
          <div
            className="flex h-full flex-col"
            onClick={(e) => e.target === e.currentTarget && close()}
          >
            <div className="flex items-center justify-between px-5 py-4 md:px-8">
              <p className="text-sm tracking-[0.18em]" aria-live="polite">
                {t.counter(index + 1, total)}
              </p>
              <button
                type="button"
                onClick={close}
                aria-label={t.close}
                autoFocus
                className="-me-2 flex size-11 items-center justify-center hover:text-accent"
              >
                <CloseIcon />
              </button>
            </div>

            <figure className="relative mx-5 flex-1 md:mx-24">
              <Image
                key={current.id}
                src={current.src}
                alt={current.alt}
                fill
                sizes="100vw"
                className="object-contain"
              />
            </figure>

            <div className="flex items-center justify-between px-5 py-4 md:absolute md:inset-x-0 md:top-1/2 md:-translate-y-1/2 md:px-6 md:py-0 pointer-events-none">
              <NavButton label={t.previous} onClick={() => step(-1)} direction="previous" />
              <p className="min-h-5 flex-1 px-4 text-center text-sm text-cream/80 md:hidden">
                {current.alt}
              </p>
              <NavButton label={t.next} onClick={() => step(1)} direction="next" />
            </div>
          </div>
        )}
      </dialog>
    </>
  );
}

function NavButton({
  label,
  onClick,
  direction,
}: {
  label: string;
  onClick: () => void;
  direction: "previous" | "next";
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      className="pointer-events-auto flex size-12 shrink-0 items-center justify-center border border-cream/30 transition-colors hover:border-accent hover:text-accent"
    >
      {/* החץ מצויר כלפי "הבאה" ב-LTR (ימינה), ומתהפך ב-RTL */}
      <svg
        aria-hidden="true"
        viewBox="0 0 24 24"
        className={`size-5 rtl:-scale-x-100 ${direction === "previous" ? "rotate-180" : ""}`}
        fill="none"
        stroke="currentColor"
        strokeWidth="1"
      >
        <path d="M9 5l7 7-7 7" />
      </svg>
    </button>
  );
}

function CloseIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      className="size-6"
      fill="none"
      stroke="currentColor"
      strokeWidth="1"
    >
      <path d="M5 5l14 14M19 5L5 19" />
    </svg>
  );
}
