import { siteConfig } from "@/config/site";
import { strings } from "@/lib/strings";
import { EmailButton, EmailHeading, EmailText, Layout } from "./_shared/Layout";

const t = strings.email.welcome;

type Props = {
  fullName: string;
  unsubscribeUrl: string;
  ctaUrl: string;
  projectTitle?: string;
};

export default function Welcome({ fullName, unsubscribeUrl, ctaUrl, projectTitle }: Props) {
  return (
    <Layout preview={t.preview} unsubscribeUrl={unsubscribeUrl}>
      <EmailHeading>{t.heading(fullName)}</EmailHeading>
      <EmailText>{projectTitle ? t.bodyProject(projectTitle) : t.bodyGeneral(siteConfig.name)}</EmailText>
      <EmailButton href={ctaUrl}>{projectTitle ? t.ctaProject : t.ctaGeneral}</EmailButton>
    </Layout>
  );
}

Welcome.PreviewProps = {
  fullName: "ישראל ישראלי",
  unsubscribeUrl: "https://example.com/unsubscribe",
  ctaUrl: "https://example.com",
} satisfies Props;
