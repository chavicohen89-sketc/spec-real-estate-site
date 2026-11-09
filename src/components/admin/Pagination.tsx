import Link from "next/link";
import { Button } from "@/components/admin/ui/button";
import { strings } from "@/lib/strings";

const t = strings.admin.pagination;

type Props = {
  page: number;
  totalPages: number;
  hrefFor: (page: number) => string;
};

export function Pagination({ page, totalPages, hrefFor }: Props) {
  if (totalPages <= 1) return null;
  return (
    <nav aria-label={t.label} className="mt-6 flex items-center justify-between gap-4 text-sm">
      {page > 1 ? (
        <Button asChild variant="outline" size="sm">
          <Link href={hrefFor(page - 1)}>{t.previous}</Link>
        </Button>
      ) : (
        <span />
      )}
      <span className="text-muted-foreground">{t.status(page, totalPages)}</span>
      {page < totalPages ? (
        <Button asChild variant="outline" size="sm">
          <Link href={hrefFor(page + 1)}>{t.next}</Link>
        </Button>
      ) : (
        <span />
      )}
    </nav>
  );
}
