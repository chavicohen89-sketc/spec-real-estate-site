import type { Metadata } from "next";
import { Toaster } from "sonner";
import { strings } from "@/lib/strings";

export const metadata: Metadata = {
  title: strings.admin.metaTitle,
  robots: { index: false, follow: false },
};

export default function AdminRootLayout({ children }: LayoutProps<"/admin">) {
  return (
    <div className="admin-ui flex min-h-dvh flex-1 flex-col">
      {children}
      <Toaster dir="rtl" position="top-center" />
    </div>
  );
}
