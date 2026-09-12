import { describe, it, expect } from "vitest";
import { updateSettingsSchema } from "./settings";

describe("updateSettingsSchema", () => {
  const base = {
    nameTh: "คณะวิทยาการจัดการ",
    nameEn: "Faculty of Management Sciences",
    palette: "blue" as const,
  };

  it("ยอมรับ URL แบบเต็ม (http/https)", () => {
    const res = updateSettingsSchema.safeParse({
      ...base,
      logoUrl: "https://example.com/logo.png",
    });
    expect(res.success).toBe(true);
  });

  it("ยอมรับ Relative Path จากการอัปโหลด (/uploads/...)", () => {
    const res = updateSettingsSchema.safeParse({
      ...base,
      logoUrl: "/uploads/logos/logo-tenant-123.png",
    });
    expect(res.success).toBe(true);
    if (res.success) {
      expect(res.data.logoUrl).toBe("/uploads/logos/logo-tenant-123.png");
    }
  });

  it("ยอมรับค่าว่างเมื่อไม่มีโลโก้", () => {
    const res = updateSettingsSchema.safeParse({
      ...base,
      logoUrl: "",
    });
    expect(res.success).toBe(true);
    if (res.success) {
      expect(res.data.logoUrl).toBe("");
    }
  });

  it("ปฏิเสธสตริงที่ไม่ใช่ URL หรือไม่ขึ้นต้นด้วย /", () => {
    const res = updateSettingsSchema.safeParse({
      ...base,
      logoUrl: "invalid-logo-string-without-slash",
    });
    expect(res.success).toBe(false);
  });

  it("ยอมรับการตั้งค่า Gmail SMTP", () => {
    const res = updateSettingsSchema.safeParse({
      ...base,
      smtp: {
        enabled: true,
        user: "faculty@gmail.com",
        appPassword: "abcd efgh ijkl mnop",
        fromName: "Faculty Platform",
        port: 465,
      },
    });
    expect(res.success).toBe(true);
    if (res.success) {
      expect(res.data.smtp?.enabled).toBe(true);
      expect(res.data.smtp?.user).toBe("faculty@gmail.com");
      expect(res.data.smtp?.port).toBe(465);
    }
  });

  it("ยอมรับการตั้งค่า Google Gemini AI", () => {
    const res = updateSettingsSchema.safeParse({
      ...base,
      gemini: {
        apiKey: "AIzaSyFakeKey123",
        model: "gemini-2.5-flash",
      },
    });
    expect(res.success).toBe(true);
    if (res.success) {
      expect(res.data.gemini?.apiKey).toBe("AIzaSyFakeKey123");
      expect(res.data.gemini?.model).toBe("gemini-2.5-flash");
    }
  });
});

