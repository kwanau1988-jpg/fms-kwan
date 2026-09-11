import { describe, it, expect } from "vitest";
import {
  createSessionSchema,
  checkInSchema,
  updateRecordStatusSchema,
} from "./validations";

/**
 * Pure verification helper to unit test QR Token validation logic
 */
export function verifyQrToken(
  sessionToken: string | null,
  sessionExpiresAt: Date | null,
  inputToken: string,
  now: Date = new Date(),
): { valid: boolean; reason?: "expired" | "mismatch" | "missing" } {
  if (!sessionToken || !sessionExpiresAt) return { valid: false, reason: "missing" };
  if (sessionToken.toUpperCase().trim() !== inputToken.toUpperCase().trim()) {
    return { valid: false, reason: "mismatch" };
  }
  if (now > sessionExpiresAt) {
    return { valid: false, reason: "expired" };
  }
  return { valid: true };
}

describe("attendance validations & QR token logic", () => {
  it("validate createSessionSchema ตรวจสอบรูปแบบวันที่ YYYY-MM-DD และเวลา HH:MM", () => {
    const valid = {
      courseId: "c3947f63-125a-4b92-9a67-d86b59524021",
      roomNumber: "Lab 301",
      sessionDate: "2026-09-18",
      startTime: "09:00",
      endTime: "12:00",
    };
    const parsed = createSessionSchema.parse(valid);
    expect(parsed.sessionDate).toBe("2026-09-18");
    expect(parsed.startTime).toBe("09:00");

    expect(() =>
      createSessionSchema.parse({
        ...valid,
        sessionDate: "18-09-2026", // Wrong date format
      }),
    ).toThrow();

    expect(() =>
      createSessionSchema.parse({
        ...valid,
        startTime: "9am", // Wrong time format
      }),
    ).toThrow();
  });

  it("validate checkInSchema ตรวจสอบความยาว token ขั้นต่ำ", () => {
    const valid = {
      sessionId: "c3947f63-125a-4b92-9a67-d86b59524021",
      qrToken: "AB12CD34",
    };
    expect(checkInSchema.parse(valid).qrToken).toBe("AB12CD34");

    expect(() =>
      checkInSchema.parse({
        sessionId: "c3947f63-125a-4b92-9a67-d86b59524021",
        qrToken: "123", // Too short
      }),
    ).toThrow();
  });

  it("validate updateRecordStatusSchema ตรวจสอบสถานะการเข้าเรียน", () => {
    const valid = {
      recordId: "c3947f63-125a-4b92-9a67-d86b59524021",
      status: "LATE" as const,
      remark: "รถติด",
    };
    expect(updateRecordStatusSchema.parse(valid).status).toBe("LATE");
  });

  describe("Dynamic Anti-Spoof QR Token Validation Logic", () => {
    const expiresAt = new Date("2026-09-18T09:15:00Z"); // 15 mins later
    const token = "B7E4F92A";

    it("ผ่าน: สแกนโทเคนถูกต้องภายในอายุ 15 นาที", () => {
      const currentTime = new Date("2026-09-18T09:05:00Z");
      const result = verifyQrToken(token, expiresAt, "b7e4f92a", currentTime); // test case-insensitivity
      expect(result.valid).toBe(true);
    });

    it("ผ่าน: สแกนโทเคนที่มีช่องว่างรอบข้าง (trim)", () => {
      const currentTime = new Date("2026-09-18T09:14:59Z");
      const result = verifyQrToken(token, expiresAt, "  B7E4F92A  ", currentTime);
      expect(result.valid).toBe(true);
    });

    it("ปฏิเสธ: โทเคนหมดอายุ (เวลาเกิน 15 นาที)", () => {
      const currentTime = new Date("2026-09-18T09:15:01Z");
      const result = verifyQrToken(token, expiresAt, token, currentTime);
      expect(result.valid).toBe(false);
      expect(result.reason).toBe("expired");
    });

    it("ปฏิเสธ: รหัสโทเคนไม่ตรงกับที่ฉายบนจอ", () => {
      const currentTime = new Date("2026-09-18T09:05:00Z");
      const result = verifyQrToken(token, expiresAt, "WRONGTOKEN", currentTime);
      expect(result.valid).toBe(false);
      expect(result.reason).toBe("mismatch");
    });
  });
});
