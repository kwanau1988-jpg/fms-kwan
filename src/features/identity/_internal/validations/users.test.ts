import { describe, it, expect } from "vitest";
import { createUserSchema, updateUserSchema, importUserRowSchema, importUsersBatchSchema, exportUsersQuerySchema } from "./users";

const ROLE_A = "11111111-1111-4111-8111-111111111111";
const ROLE_B = "22222222-2222-4222-8222-222222222222";
const assign = (roleId: string) => ({ roleId, scopeType: "ALL" as const, scopeId: null });

/**
 * B4 — `@@unique([userTenantId, roleId, scopeType, scopeId])` ไม่ dedupe เมื่อ `scope_id` เป็น NULL
 * (มาตรฐาน SQL: NULL ≠ NULL) `createMany` จึงแทรก (roleId, ALL, null) ซ้ำได้ ผลคือ memberCount ของ
 * บทบาทพองเกินจริงและลบบทบาทนั้นไม่ได้อีกเลย — ฐานข้อมูลกันให้ไม่ได้ ต้องกันที่ชั้น validation
 */
describe("roleAssignments — กันบทบาทซ้ำในคำขอเดียว", () => {
  it("createUser: บทบาทเดียวกันสองครั้ง → validation ล้ม", () => {
    const r = createUserSchema.safeParse({ email: "a@b.co", name: "A", roles: [assign(ROLE_A), assign(ROLE_A)] });
    expect(r.success).toBe(false);
    expect(r.error?.issues.some((i) => i.message === "duplicate_role_assignment")).toBe(true);
  });

  it("createUser: บทบาทต่างกัน → ผ่าน", () => {
    expect(createUserSchema.safeParse({ email: "a@b.co", name: "A", roles: [assign(ROLE_A), assign(ROLE_B)] }).success).toBe(true);
  });

  it("updateUser: กฎเดียวกันเมื่อส่ง roles มาด้วย และไม่บังคับเมื่อไม่ส่ง", () => {
    expect(updateUserSchema.safeParse({ userId: ROLE_A, roles: [assign(ROLE_B), assign(ROLE_B)] }).success).toBe(false);
    expect(updateUserSchema.safeParse({ userId: ROLE_A, name: "A" }).success).toBe(true);
  });
});

describe("importUsersBatchSchema", () => {
  it("validates valid batch user rows", () => {
    const valid = importUsersBatchSchema.safeParse({
      users: [
        { name: "สมชาย ใจดี", email: "somchai@test.com", role: "STAFF", password: "Password123!" },
        { name: "สมหญิง", email: "somying@test.com", role: "VIEWER", password: "" },
      ],
    });
    expect(valid.success).toBe(true);
  });

  it("fails on invalid email or empty name", () => {
    const invalidEmail = importUserRowSchema.safeParse({ name: "สมชาย", email: "notanemail", role: "STAFF" });
    expect(invalidEmail.success).toBe(false);

    const emptyName = importUserRowSchema.safeParse({ name: "", email: "somchai@test.com", role: "STAFF" });
    expect(emptyName.success).toBe(false);
  });

  it("fails on password less than 8 characters when provided", () => {
    const shortPass = importUserRowSchema.safeParse({ name: "สมชาย", email: "somchai@test.com", role: "STAFF", password: "123" });
    expect(shortPass.success).toBe(false);
  });
});

describe("exportUsersQuerySchema", () => {
  it("applies defaults correctly", () => {
    const res = exportUsersQuerySchema.safeParse({});
    expect(res.success).toBe(true);
    if (res.success) {
      expect(res.data.status).toBe("all");
      expect(res.data.search).toBe("");
    }
  });
});
