import Link from "next/link";

type Variant = "primary" | "secondary";

const base =
  "inline-flex min-h-12 items-center justify-center rounded-xs px-8 text-sm font-medium tracking-[0.18em] transition-colors duration-300 disabled:pointer-events-none disabled:opacity-50";

/*
 * primary: רקע פחם. צבע ההדגשה על שמנת לא עומד בניגודיות לטקסט (כ-3:1),
 * ולכן הוא משמש בכפתורים רק כקו (secondary) וכמצב hover.
 */
const variants: Record<Variant, string> = {
  primary: "bg-charcoal text-cream hover:bg-charcoal/85",
  secondary:
    "border border-accent text-charcoal hover:bg-accent/10",
};

type CommonProps = {
  variant?: Variant;
  className?: string;
  children: React.ReactNode;
};

type ButtonAsLink = CommonProps & { href: string } & Omit<
    React.ComponentPropsWithoutRef<typeof Link>,
    "href" | "className" | "children"
  >;

type ButtonAsButton = CommonProps & { href?: undefined } & Omit<
    React.ComponentPropsWithoutRef<"button">,
    "className" | "children"
  >;

export type ButtonProps = ButtonAsLink | ButtonAsButton;

export function Button(props: ButtonProps) {
  const { variant = "primary", className = "", children } = props;
  const classes = `${base} ${variants[variant]} ${className}`;

  if (props.href !== undefined) {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { variant: _v, className: _c, children: _ch, ...rest } = props;
    return (
      <Link {...rest} className={classes}>
        {children}
      </Link>
    );
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { variant: _v, className: _c, children: _ch, type, ...rest } = props;
  return (
    <button {...rest} type={type ?? "button"} className={classes}>
      {children}
    </button>
  );
}
