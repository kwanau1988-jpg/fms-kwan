import { describe, it, expect } from "vitest";
import {
  createCurriculumSchema,
  updateCurriculumSchema,
  createDepartmentSchema,
  updateDepartmentSchema,
  deleteDepartmentSchema,
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

  it("validate createCurriculumSchema รองรับ departmentId ที่เป็น UUID หรือ null", () => {
    const validWithDept = {
      departmentId: "3fa85f64-5717-4562-b3fc-2c963f66afa6",
      code: "BBA-01",
      nameTh: "หลักสูตรบริหารธุรกิจบัณฑิต",
      nameEn: "BBA Program",
      degreeTh: "บธ.บ.",
      degreeEn: "B.B.A.",
    };
    const parsed = createCurriculumSchema.parse(validWithDept);
    expect(parsed.departmentId).toBe("3fa85f64-5717-4562-b3fc-2c963f66afa6");

    const validNullDept = {
      departmentId: null,
      code: "BBA-02",
      nameTh: "หลักสูตรบริหารธุรกิจบัณฑิต 2",
      nameEn: "BBA Program 2",
      degreeTh: "บธ.บ.",
      degreeEn: "B.B.A.",
    };
    const parsedNull = createCurriculumSchema.parse(validNullDept);
    expect(parsedNull.departmentId).toBeNull();
  });
});

describe("department validations", () => {
  it("validate createDepartmentSchema สำเร็จเมื่อข้อมูลครบถ้วน", () => {
    const valid = {
      code: "DEPT-BA",
      nameTh: "ภาควิชาบริหารธุรกิจ",
      nameEn: "Department of Business Administration",
      description: "ภาควิชาจัดการเรียนการสอนบริหารธุรกิจ",
      headName: "ผศ.ดร. ภาณุวัฒน์ กิจการค้า",
      email: "ba@faculty.edu",
      phone: "044-123456",
      officeRoom: "MS-240",
      displayOrder: 1,
      isActive: true,
    };
    const parsed = createDepartmentSchema.parse(valid);
    expect(parsed.code).toBe("DEPT-BA");
    expect(parsed.nameTh).toBe("ภาควิชาบริหารธุรกิจ");
    expect(parsed.displayOrder).toBe(1);
    expect(parsed.isActive).toBe(true);
  });

  it("validate createDepartmentSchema มีค่า default สำหรับ displayOrder และ isActive", () => {
    const minimal = {
      code: "DEPT-ACC",
      nameTh: "ภาควิชาการบัญชี",
      nameEn: "Department of Accounting",
    };
    const parsed = createDepartmentSchema.parse(minimal);
    expect(parsed.displayOrder).toBe(0);
    expect(parsed.isActive).toBe(true);
  });

  it("validate updateDepartmentSchema ตรวจสอบ UUID id", () => {
    const valid = {
      id: "3fa85f64-5717-4562-b3fc-2c963f66afa6",
      code: "DEPT-ECON",
      nameTh: "ภาควิชาเศรษฐศาสตร์",
      nameEn: "Department of Economics",
    };
    const parsed = updateDepartmentSchema.parse(valid);
    expect(parsed.id).toBe("3fa85f64-5717-4562-b3fc-2c963f66afa6");
    expect(parsed.code).toBe("DEPT-ECON");
  });

  it("validate deleteDepartmentSchema ตรวจสอบ UUID id", () => {
    const valid = {
      id: "3fa85f64-5717-4562-b3fc-2c963f66afa6",
    };
    const parsed = deleteDepartmentSchema.parse(valid);
    expect(parsed.id).toBe("3fa85f64-5717-4562-b3fc-2c963f66afa6");
  });
});
