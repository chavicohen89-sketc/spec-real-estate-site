import type { Metadata } from "next";
import { Footer } from "@/components/site/Footer";
import { Header } from "@/components/site/Header";
import { NotFoundContent } from "@/components/site/NotFoundContent";
import { strings } from "@/lib/strings";

export const metadata: Metadata = {
  title: strings.notFound.metaTitle,
  robots: { index: false },
};

/**
 * 404 לכתובת שלא קיימת. הוא מחוץ ל-layout של (site), ולכן מוסיף Header ו-Footer בעצמו.
 * notFound() מתוך עמוד ב-(site) מגיע ל-(site)/not-found.tsx, שכבר עטוף ב-layout.
 */
export default function NotFound() {
  return (
    <>
      <Header />
      <main id="main" className="flex flex-1">
        <NotFoundContent />
      </main>
      <Footer />
    </>
  );
}
