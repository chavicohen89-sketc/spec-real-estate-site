import type { ReactNode } from "react";
import { Body, Button, Container, Head, Heading, Hr, Html, Link, Preview, Section, Text } from "react-email";
import { siteConfig } from "@/config/site";
import { strings } from "@/lib/strings";
import { emailColors as c, emailFonts as f } from "./theme";

const t = strings.email.layout;

type Props = {
  preview: string;
  unsubscribeUrl: string;
  children: ReactNode;
};

/** מסגרת משותפת לכל המיילים: לוגו, RTL, ופוטר עם קישור הסרה ופרטי השולח */
export function Layout({ preview, unsubscribeUrl, children }: Props) {
  return (
    <Html lang="he" dir="rtl">
      <Head />
      <Preview>{preview}</Preview>
      <Body style={{ margin: 0, backgroundColor: c.cream, fontFamily: f.sans, color: c.charcoal }}>
        <Container style={{ maxWidth: 560, padding: "32px 20px", direction: "rtl", textAlign: "right" }}>
          <Text style={{ margin: "0 0 28px", fontFamily: f.serif, fontSize: 24, lineHeight: "32px" }}>
            {siteConfig.name}
          </Text>
          <Section>{children}</Section>
          <Hr style={{ margin: "32px 0 20px", border: 0, borderTop: `1px solid ${c.accent}` }} />
          <Text style={{ margin: "0 0 8px", fontSize: 13, lineHeight: "20px", color: c.warmGray }}>
            {siteConfig.name} · {siteConfig.contact.address}
          </Text>
          <Text style={{ margin: 0, fontSize: 13, lineHeight: "20px", color: c.warmGray }}>
            {t.reason}{" "}
            <Link href={unsubscribeUrl} style={{ color: c.warmGray, textDecoration: "underline" }}>
              {t.unsubscribe}
            </Link>
          </Text>
        </Container>
      </Body>
    </Html>
  );
}

export function EmailHeading({ children }: { children: ReactNode }) {
  return (
    <Heading
      as="h1"
      style={{ margin: "0 0 16px", fontFamily: f.serif, fontSize: 28, lineHeight: "36px", fontWeight: 400 }}
    >
      {children}
    </Heading>
  );
}

export function EmailText({ children }: { children: ReactNode }) {
  return <Text style={{ margin: "0 0 16px", fontSize: 16, lineHeight: "26px" }}>{children}</Text>;
}

export function EmailButton({ href, children }: { href: string; children: ReactNode }) {
  return (
    <Button
      href={href}
      style={{
        backgroundColor: c.charcoal,
        color: c.cream,
        padding: "12px 28px",
        fontSize: 16,
        textDecoration: "none",
      }}
    >
      {children}
    </Button>
  );
}
