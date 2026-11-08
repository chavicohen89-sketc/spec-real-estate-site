import { siteConfig } from "@/config/site";

export default function AdminAuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <main className="mx-auto flex w-full max-w-sm flex-1 flex-col justify-center px-6 py-16">
      <p className="mb-8 font-serif text-xl">{siteConfig.name}</p>
      {children}
    </main>
  );
}
