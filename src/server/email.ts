import "server-only";

// נקודות החיבור למיילים. בשלב 7 הן יישלחו דרך Resend.
// ב-log רק מזהים, בלי פרטים אישיים.

export async function sendWelcomeEmail(subscriberId: string, projectId?: string) {
  console.info("[email] welcome (stub)", { subscriberId, projectId: projectId ?? "general" });
}

export async function sendContactNotification(messageId: string) {
  console.info("[email] contact notification (stub)", { messageId });
}
