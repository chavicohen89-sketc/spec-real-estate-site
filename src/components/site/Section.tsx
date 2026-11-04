type SectionProps = {
  children: React.ReactNode;
  id?: string;
  /** קו דק בראש הסקשן, במקום מסגרות וצללים */
  divider?: boolean;
  className?: string;
} & React.ComponentPropsWithoutRef<"section">;

export function Section({
  children,
  divider = false,
  className = "",
  ...props
}: SectionProps) {
  return (
    <section
      className={`py-20 md:py-32 ${divider ? "border-t border-charcoal/10" : ""} ${className}`}
      {...props}
    >
      {children}
    </section>
  );
}
