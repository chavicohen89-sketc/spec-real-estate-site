import { styleEmailHtml } from "@/lib/email-html";
import { renderRichText } from "@/lib/rich-text";
import { EmailHeading, Layout } from "./_shared/Layout";

type Props = {
  subject: string;
  body: unknown;
  unsubscribeUrl: string;
};

export default function Campaign({ subject, body, unsubscribeUrl }: Props) {
  return (
    <Layout preview={subject} unsubscribeUrl={unsubscribeUrl}>
      <EmailHeading>{subject}</EmailHeading>
      <div dangerouslySetInnerHTML={{ __html: styleEmailHtml(renderRichText(body)) }} />
    </Layout>
  );
}

Campaign.PreviewProps = {
  subject: "עדכון מהפרויקטים שלנו",
  body: {
    type: "doc",
    content: [{ type: "paragraph", content: [{ type: "text", text: "שלום, הנה מה שחדש אצלנו." }] }],
  },
  unsubscribeUrl: "https://example.com/unsubscribe",
} satisfies Props;
