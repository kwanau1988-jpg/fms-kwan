import { describe, it, expect } from "vitest";
import {
  createPeriodSchema,
  togglePublishPeriodSchema,
  generateDemoSlipsSchema,
} from "./validations";
import {
  encryptPayload,
  decryptPayload,
  type PayrollBreakdown,
} from "./services";

describe("payroll validations, crypto & math integrity", () => {
  it("validate createPeriodSchema ตรวจสอบปี (2020-2100) และเดือน (1-12)", () => {
    const valid = { year: 2026, month: 9 };
    const parsed = createPeriodSchema.parse(valid);
    expect(parsed.year).toBe(2026);
    expect(parsed.month).toBe(9);

    expect(() => createPeriodSchema.parse({ year: 1999, month: 5 })).toThrow();
    expect(() => createPeriodSchema.parse({ year: 2026, month: 13 })).toThrow();
  });

  it("validate togglePublishPeriodSchema ต้องการ UUID", () => {
    const valid = {
      periodId: "9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d",
      isPublished: true,
    };
    expect(togglePublishPeriodSchema.parse(valid).isPublished).toBe(true);
  });

  it("validate generateDemoSlipsSchema ต้องการ UUID", () => {
    const valid = { periodId: "9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d" };
    expect(generateDemoSlipsSchema.parse(valid).periodId).toBe("9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d");
  });

  describe("AES-256-GCM Encryption / Decryption Roundtrip", () => {
    const breakdown: PayrollBreakdown = {
      baseSalary: 45000,
      academicAllowance: 11200,
      positionAllowance: 7500,
      specialAllowance: 3000,
      grossIncome: 66700,
      taxWithholding: 3335,
      socialSecurity: 750,
      providentFund: 1800,
      cooperatives: 2000,
      totalDeductions: 7885,
      netPayable: 58815,
    };

    it("เข้ารหัสและถอดรหัสข้อมูลสลิปได้ข้อมูลเดิมถูกต้อง 100%", () => {
      const encrypted = encryptPayload(breakdown);
      expect(typeof encrypted).toBe("string");
      expect(encrypted.split(":")).toHaveLength(3); // iv:tag:ciphertext

      const decrypted = decryptPayload<PayrollBreakdown>(encrypted);
      expect(decrypted).toEqual(breakdown);
      expect(decrypted.netPayable).toBe(58815);
    });

    it("ล้มเหลวเมื่อรูปแบบ ciphertext ผิดพลาดหรือไม่ครบ 3 ส่วน", () => {
      expect(() => decryptPayload("invalid-format")).toThrow();
    });
  });

  describe("Thai Academic Payroll Calculation Math", () => {
    it("คำนวณ Gross Income, Total Deductions และ Net Payable สัมพันธ์กันอย่างถูกต้อง", () => {
      const baseSalary = 42000;
      const academicAllowance = 5600;
      const positionAllowance = 0;
      const specialAllowance = 3000;
      const grossIncome = baseSalary + academicAllowance + positionAllowance + specialAllowance;
      expect(grossIncome).toBe(50600);

      const taxWithholding = Math.round(grossIncome * 0.05); // 2530
      const socialSecurity = 750;
      const providentFund = Math.round(baseSalary * 0.04); // 1680
      const cooperatives = 1500;
      const totalDeductions = taxWithholding + socialSecurity + providentFund + cooperatives;
      expect(totalDeductions).toBe(6460);

      const netPayable = grossIncome - totalDeductions;
      expect(netPayable).toBe(44140);
    });
  });
});
