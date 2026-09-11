import { describe, it, expect } from "vitest";
import {
  createPersonnelProfileSchema,
  updatePersonnelProfileSchema,
} from "./validations";

describe("personnel validations", () => {
  it("validate createPersonnelProfileSchema สำเร็จเมื่อข้อมูลถูกต้อง", () => {
    const valid = {
      academicTitle: "ผศ.ดร.",
      firstNameTh: "สมชาย",
      lastNameTh: "ใจดี",
      firstNameEn: "Somchai",
      lastNameEn: "Jaidee",
      departmentTh: "สาขาวิชาการตลาด",
      departmentEn: "Department of Marketing",
      positionTh: "อาจารย์ประจำสาขา",
      positionEn: "Lecturer",
      email: "somchai@fms.ac.th",
      phoneExt: "1234",
      roomNumber: "MS-402",
      avatarUrl: "https://example.com/somchai.png",
      displayOrder: 1,
      isActive: true,
    };
    const parsed = createPersonnelProfileSchema.parse(valid);
    expect(parsed.email).toBe("somchai@fms.ac.th");
    expect(parsed.displayOrder).toBe(1);
    expect(parsed.isActive).toBe(true);
  });

  it("validate createPersonnelProfileSchema ล้มเหลวเมื่อรูปแบบอีเมลไม่ถูกต้อง", () => {
    const invalid = {
      firstNameTh: "สมชาย",
      lastNameTh: "ใจดี",
      firstNameEn: "Somchai",
      lastNameEn: "Jaidee",
      departmentTh: "การตลาด",
      departmentEn: "Marketing",
      positionTh: "อาจารย์",
      positionEn: "Lecturer",
      email: "not-an-email",
    };
    expect(() => createPersonnelProfileSchema.parse(invalid)).toThrow();
  });

  it("validate updatePersonnelProfileSchema ต้องการ id เป็น uuid", () => {
    const valid = {
      id: "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
      firstNameTh: "สมชาย",
      lastNameTh: "ใจดี",
      firstNameEn: "Somchai",
      lastNameEn: "Jaidee",
      departmentTh: "การตลาด",
      departmentEn: "Marketing",
      positionTh: "อาจารย์",
      positionEn: "Lecturer",
      email: "somchai@fms.ac.th",
    };
    const parsed = updatePersonnelProfileSchema.parse(valid);
    expect(parsed.id).toBe("a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11");
  });
});
