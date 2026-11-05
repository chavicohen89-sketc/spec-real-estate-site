import type { Metadata } from "next";
import { NotFoundContent } from "@/components/site/NotFoundContent";
import { strings } from "@/lib/strings";

export const metadata: Metadata = {
  title: strings.notFound.metaTitle,
  robots: { index: false },
};

/** 404 מתוך עמוד ב-(site) (למשל פרויקט בטיוטה). ה-Header וה-Footer מגיעים מה-layout */
export default function SiteNotFound() {
  return <NotFoundContent />;
}
