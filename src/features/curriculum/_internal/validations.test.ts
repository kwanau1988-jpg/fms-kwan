import { describe, it, expect } from "vitest";
import {
  createCurriculumSchema,
  updateCurriculumSchema,
} from "./validations";

describe("curriculum validations", () => {
  it("validate createCurriculumSchema สำเร็จเมื่อข้อมูลถูกต้อง", () => {
    const valid = {
      code: "BBA-MKT-2569",
      nameTh: "หลักสูตรบริหารธุรกิจบัณฑิต สาขาวิชาการตลาดดิจิทัล",
      nameEn: "Bachelor of Business Administration in Digital Marketing",
      degreeTh: "บธ.บ. (การตลาดดิจิทัล)",
      degreeEn: "B.B.A. (Digital Marketing)",
      degreeLevel: "BACHELOR" as const,
      totalCredits: 128,
      tuitionFee: 24000,
      brochurePdfUrl: "https://example.com/brochure.pdf",
      status: "OPEN" as const,
    };
    const parsed = createCurriculumSchema.parse(valid);
    expect(parsed.code).toBe("BBA-MKT-2569");
    expect(parsed.degreeLevel).toBe("BACHELOR");
    expect(parsed.totalCredits).toBe(128);
    expect(parsed.tuitionFee).toBe(24000);
  });

  it("validate createCurriculumSchema มี default values สำหรับ degreeLevel, totalCredits และ status", () => {
    const minimal = {
      code: "CERT-DATA",
      nameTh: "หลักสูตรระยะสั้นการวิเคราะห์ข้อมูล",
      nameEn: "Data Analytics Certificate",
      degreeTh: "ประกาศนียบัตร",
      degreeEn: "Certificate",
    };
    const parsed = createCurriculumSchema.parse(minimal);
    expect(parsed.degreeLevel).toBe("BACHELOR");
    expect(parsed.totalCredits).toBe(120);
    expect(parsed.status).toBe("OPEN");
  });

  it("validate updateCurriculumSchema ตรวจสอบ UUID id", () => {
    const valid = {
      id: "3fa85f64-5717-4562-b3fc-2c963f66afa6",
      code: "MBA-EXEC",
      nameTh: "บริหารธุรกิจมหาบัณฑิต",
      nameEn: "Master of Business Administration",
      degreeTh: "บธ.ม.",
      degreeEn: "M.B.A.",
    };
    const parsed = updateCurriculumSchema.parse(valid);
    expect(parsed.id).toBe("3fa85f64-5717-4562-b3fc-2c963f66afa6");
  });
});
