import { describe, it, expect } from "vitest";
import {
  createReservationSchema,
  decideReservationSchema,
  updateReservationSchema,
  createResourceSchema,
  updateResourceSchema,
} from "./validations";

/**
 * Pure collision detection logic helper to unit-test collision algorithm
 * Used in Prisma query: { startTime: { lt: end }, endTime: { gt: start } }
 */
export function hasTimeConflict(
  existingStart: Date,
  existingEnd: Date,
  newStart: Date,
  newEnd: Date,
): boolean {
  return newStart < existingEnd && newEnd > existingStart;
}

describe("booking validations & collision logic", () => {
  it("validate createReservationSchema สำเร็จเมื่อเวลาเริ่มต้นก่อนเวลาสิ้นสุด", () => {
    const valid = {
      resourceId: "550e8400-e29b-41d4-a716-446655440000",
      title: "ประชุมคณะกรรมการประจำคณะฯ",
      startTime: "2026-09-15T09:00:00.000Z",
      endTime: "2026-09-15T12:00:00.000Z",
      attendeesCount: 15,
      contactPhone: "081-234-5678",
    };
    const parsed = createReservationSchema.parse(valid);
    expect(parsed.title).toBe(valid.title);
    expect(parsed.attendeesCount).toBe(15);
  });

  it("validate createReservationSchema ล้มเหลวเมื่อเวลาสิ้นสุดมาก่อนหรือเท่ากับเวลาเริ่มต้น", () => {
    const invalidReverse = {
      resourceId: "550e8400-e29b-41d4-a716-446655440000",
      title: "การประชุม",
      startTime: "2026-09-15T12:00:00.000Z",
      endTime: "2026-09-15T09:00:00.000Z",
    };
    expect(() => createReservationSchema.parse(invalidReverse)).toThrow();

    const invalidEqual = {
      resourceId: "550e8400-e29b-41d4-a716-446655440000",
      title: "การประชุม",
      startTime: "2026-09-15T09:00:00.000Z",
      endTime: "2026-09-15T09:00:00.000Z",
    };
    expect(() => createReservationSchema.parse(invalidEqual)).toThrow();
  });

  it("validate decideReservationSchema ตรวจสอบ decision", () => {
    const valid = {
      reservationId: "550e8400-e29b-41d4-a716-446655440000",
      decision: "APPROVED" as const,
    };
    expect(decideReservationSchema.parse(valid).decision).toBe("APPROVED");
  });

  describe("Time-slot Collision Detection Algorithm", () => {
    const existingStart = new Date("2026-09-15T09:00:00Z");
    const existingEnd = new Date("2026-09-15T12:00:00Z");

    it("ไม่ชน: ช่วงเวลาก่อนหน้าเสร็จสิ้นก่อนเริ่ม (reqEnd <= existingStart)", () => {
      const newStart = new Date("2026-09-15T07:00:00Z");
      const newEnd = new Date("2026-09-15T09:00:00Z");
      expect(hasTimeConflict(existingStart, existingEnd, newStart, newEnd)).toBe(false);
    });

    it("ไม่ชน: ช่วงเวลาถัดไปเริ่มหลังสิ้นสุด (newStart >= existingEnd)", () => {
      const newStart = new Date("2026-09-15T12:00:00Z");
      const newEnd = new Date("2026-09-15T14:00:00Z");
      expect(hasTimeConflict(existingStart, existingEnd, newStart, newEnd)).toBe(false);
    });

    it("ชน: ทับซ้อนช่วงต้น (newStart < existingStart และ newEnd อยู่ระหว่างนั้น)", () => {
      const newStart = new Date("2026-09-15T08:30:00Z");
      const newEnd = new Date("2026-09-15T10:00:00Z");
      expect(hasTimeConflict(existingStart, existingEnd, newStart, newEnd)).toBe(true);
    });

    it("ชน: อยู่ภายในช่วงเวลาเดิมทั้งหมด (newStart > existingStart และ newEnd < existingEnd)", () => {
      const newStart = new Date("2026-09-15T09:30:00Z");
      const newEnd = new Date("2026-09-15T11:00:00Z");
      expect(hasTimeConflict(existingStart, existingEnd, newStart, newEnd)).toBe(true);
    });

    it("ชน: ครอบคลุมช่วงเวลาเดิมทั้งหมด (newStart < existingStart และ newEnd > existingEnd)", () => {
      const newStart = new Date("2026-09-15T08:00:00Z");
      const newEnd = new Date("2026-09-15T13:00:00Z");
      expect(hasTimeConflict(existingStart, existingEnd, newStart, newEnd)).toBe(true);
    });

    it("ชน: ทับซ้อนช่วงท้าย (newStart อยู่ระหว่างนั้น และ newEnd > existingEnd)", () => {
      const newStart = new Date("2026-09-15T11:30:00Z");
      const newEnd = new Date("2026-09-15T13:30:00Z");
      expect(hasTimeConflict(existingStart, existingEnd, newStart, newEnd)).toBe(true);
    });
  });

  describe("updateReservationSchema & resource schemas", () => {
    it("validate updateReservationSchema ถูกต้อง", () => {
      const valid = {
        reservationId: "550e8400-e29b-41d4-a716-446655440001",
        resourceId: "550e8400-e29b-41d4-a716-446655440002",
        title: "ประชุมแก้ไขวาระพิเศษ",
        startTime: "2026-09-15T13:00:00.000Z",
        endTime: "2026-09-15T15:00:00.000Z",
        attendeesCount: 20,
        contactPhone: "089-999-8888",
      };
      const parsed = updateReservationSchema.parse(valid);
      expect(parsed.title).toBe("ประชุมแก้ไขวาระพิเศษ");
      expect(parsed.attendeesCount).toBe(20);
    });

    it("validate createResourceSchema ถูกต้องและมีค่า default", () => {
      const valid = {
        type: "ROOM" as const,
        nameTh: "ห้องประชุม Smart Boardroom MS-501",
        nameEn: "Smart Boardroom MS-501",
        capacity: 30,
        locationOrPlate: "อาคาร 4 ชั้น 5",
        amenities: ["Zoom Conference", "4K Projector", "Wireless Mic"],
        isAvailable: true,
      };
      const parsed = createResourceSchema.parse(valid);
      expect(parsed.nameTh).toBe("ห้องประชุม Smart Boardroom MS-501");
      expect(parsed.amenities).toHaveLength(3);
    });

    it("validate updateResourceSchema ยอมรับข้อมูลแบบ partial", () => {
      const partial = {
        resourceId: "550e8400-e29b-41d4-a716-446655440003",
        capacity: 50,
        isAvailable: false,
      };
      const parsed = updateResourceSchema.parse(partial);
      expect(parsed.capacity).toBe(50);
      expect(parsed.isAvailable).toBe(false);
    });
  });
});

