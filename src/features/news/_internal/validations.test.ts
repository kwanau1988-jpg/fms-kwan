import { describe, it, expect } from "vitest";
import { createNewsArticleSchema, updateNewsArticleSchema, translateNewsInputSchema } from "./validations";

describe("news validations", () => {
  it("validate createNewsArticleSchema สำเร็จเมื่อข้อมูลครบถ้วน", () => {
    const valid = {
      titleTh: "เปิดรับสมัครนักศึกษาใหม่ 2569",
      titleEn: "Admissions Open 2026",
      category: "ACADEMIC" as const,
      summaryTh: "รายละเอียดการรับสมัคร",
      summaryEn: "Admission details",
      contentTh: "เนื้อหาข่าวภาษาไทย...",
      contentEn: "News content in English...",
      coverImageUrl: "https://example.com/cover.jpg",
      isPinned: true,
      status: "PUBLISHED" as const,
    };
    const parsed = createNewsArticleSchema.parse(valid);
    expect(parsed.titleTh).toBe(valid.titleTh);
    expect(parsed.category).toBe("ACADEMIC");
    expect(parsed.isPinned).toBe(true);
  });

  it("validate createNewsArticleSchema กำหนดค่า default ให้ category และ status", () => {
    const minimal = {
      titleTh: "ข่าวทั่วไป",
      titleEn: "General News",
      contentTh: "เนื้อหา",
      contentEn: "Content",
    };
    const parsed = createNewsArticleSchema.parse(minimal);
    expect(parsed.category).toBe("GENERAL");
    expect(parsed.status).toBe("PUBLISHED");
    expect(parsed.isPinned).toBe(false);
  });

  it("validate createNewsArticleSchema ล้มเหลวเมื่อไม่มี titleTh", () => {
    expect(() =>
      createNewsArticleSchema.parse({
        titleTh: "",
        titleEn: "Valid English",
        contentTh: "เนื้อหา",
        contentEn: "Content",
      }),
    ).toThrow();
  });

  it("validate updateNewsArticleSchema ต้องการ id เป็น uuid", () => {
    const valid = {
      id: "9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d",
      titleTh: "ปรับปรุงหัวข้อข่าว",
      titleEn: "Updated News Title",
      contentTh: "เนื้อหาใหม่",
      contentEn: "New Content",
    };
    const parsed = updateNewsArticleSchema.parse(valid);
    expect(parsed.id).toBe("9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d");

    expect(() =>
      updateNewsArticleSchema.parse({
        ...valid,
        id: "not-a-uuid",
      }),
    ).toThrow();
  });

  it("validate translateNewsInputSchema สำเร็จเมื่อระบุ titleTh และ contentTh", () => {
    const valid = {
      titleTh: "เปิดรับสมัครอาจารย์ใหม่",
      contentTh: "คณะเปิดรับสมัครอาจารย์ประจำ 2 อัตรา...",
    };
    const parsed = translateNewsInputSchema.parse(valid);
    expect(parsed.titleTh).toBe("เปิดรับสมัครอาจารย์ใหม่");
    expect(parsed.contentTh).toBe("คณะเปิดรับสมัครอาจารย์ประจำ 2 อัตรา...");
  });

  it("validate translateNewsInputSchema ล้มเหลวเมื่อข้อความเป็นค่าว่าง", () => {
    expect(() =>
      translateNewsInputSchema.parse({
        titleTh: "   ",
        contentTh: "เนื้อหา",
      }),
    ).toThrow();

    expect(() =>
      translateNewsInputSchema.parse({
        titleTh: "หัวข้อ",
        contentTh: "",
      }),
    ).toThrow();
  });
});
