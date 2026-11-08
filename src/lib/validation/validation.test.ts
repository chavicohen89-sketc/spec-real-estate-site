import { describe, expect, it } from "vitest";
import { contactSchema } from "./contact";
import { toFieldErrors } from "./form-state";
import { subscribeSchema } from "./subscribe";

const validSubscribe = {
  fullName: "  ישראל ישראלי ",
  email: " Test@Example.COM ",
  phone: "050-1234567",
  emailConsent: "on",
};

describe("subscribeSchema", () => {
  it("מנרמל שם, מייל וטלפון", () => {
    expect(subscribeSchema.parse(validSubscribe)).toEqual({
      fullName: "ישראל ישראלי",
      email: "test@example.com",
      phone: "+972501234567",
      emailConsent: "on",
      whatsappConsent: false,
    });
  });

  it("ווטסאפ מסומן הופך ל-true", () => {
    const data = subscribeSchema.parse({ ...validSubscribe, whatsappConsent: "on" });
    expect(data.whatsappConsent).toBe(true);
  });

  it("דורש הסכמה למייל", () => {
    const { emailConsent, ...rest } = validSubscribe;
    void emailConsent;
    const result = subscribeSchema.safeParse(rest);
    expect(result.success).toBe(false);
    expect(Object.keys(toFieldErrors(result.error!))).toEqual(["emailConsent"]);
  });

  it("מחזיר שגיאה לכל שדה לא תקין", () => {
    const result = subscribeSchema.safeParse({
      fullName: "",
      email: "לא מייל",
      phone: "123",
    });
    expect(result.success).toBe(false);
    expect(Object.keys(toFieldErrors(result.error!)).sort()).toEqual([
      "email",
      "emailConsent",
      "fullName",
      "phone",
    ]);
  });

  it("דוחה מזהה פרויקט לא תקין", () => {
    expect(subscribeSchema.safeParse({ ...validSubscribe, projectId: "x" }).success).toBe(false);
  });
});

describe("contactSchema", () => {
  const validContact = { fullName: "דנה", email: "a@b.co", message: "שלום רב" };

  it("טלפון ריק נשמר כ-null", () => {
    expect(contactSchema.parse({ ...validContact, phone: "  " }).phone).toBeNull();
  });

  it("טלפון שמולא מנורמל", () => {
    expect(contactSchema.parse({ ...validContact, phone: "0501234567" }).phone).toBe(
      "+972501234567",
    );
  });

  it("טלפון שגוי נדחה", () => {
    expect(contactSchema.safeParse({ ...validContact, phone: "12" }).success).toBe(false);
  });
});
