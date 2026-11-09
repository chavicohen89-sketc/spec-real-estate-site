import { Img } from "react-email";
import { strings } from "@/lib/strings";
import { EmailButton, EmailHeading, EmailText, Layout } from "./_shared/Layout";

const t = strings.email.launch;

type Props = {
  title: string;
  excerpt: string;
  coverUrl: string | null;
  projectUrl: string;
  unsubscribeUrl: string;
};

export default function ProjectLaunch({ title, excerpt, coverUrl, projectUrl, unsubscribeUrl }: Props) {
  return (
    <Layout preview={t.preview(title)} unsubscribeUrl={unsubscribeUrl}>
      {coverUrl && (
        <Img src={coverUrl} alt={title} width="520" style={{ width: "100%", height: "auto", marginBottom: 24 }} />
      )}
      <EmailHeading>{title}</EmailHeading>
      {excerpt && <EmailText>{excerpt}</EmailText>}
      <EmailButton href={projectUrl}>{t.cta}</EmailButton>
    </Layout>
  );
}

ProjectLaunch.PreviewProps = {
  title: "מגדלי הפארק",
  excerpt: "פרויקט מגורים חדש, עם תכנון נקי וחומרים טובים.",
  coverUrl: null,
  projectUrl: "https://example.com/projects/park",
  unsubscribeUrl: "https://example.com/unsubscribe",
} satisfies Props;
