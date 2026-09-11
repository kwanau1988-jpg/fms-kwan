import { describe, it, expect } from "vitest";
import {
  createDocumentSchema,
  decideDocumentSchema,
} from "./validations";

describe("e-document validations", () => {
  it("validate createDocumentSchema สำเร็จเมื่อมีสายการอนุมัติอย่างน้อย 1 คน", () => {
    const valid = {
      title: "ขออนุมัติจัดซื้ออุปกรณ์คอมพิวเตอร์ประจำห้องปฏิบัติการ",
      docType: "PROCUREMENT",
      approverIds: [
        "c3947f63-125a-4b92-9a67-d86b59524021",
        "d4858e74-236b-4c03-ab78-e97c60635132",
      ],
      attachmentUrls: ["https://example.com/quotation.pdf"],
      metadata: { budget: 150000, department: "IT" },
    };
    const parsed = createDocumentSchema.parse(valid);
    expect(parsed.approverIds).toHaveLength(2);
    expect(parsed.docType).toBe("PROCUREMENT");
  });

  it("validate createDocumentSchema ล้มเหลวเมื่อ approverIds ว่างเปล่า", () => {
    const invalid = {
      title: "บันทึกข้อความ",
      docType: "GENERAL",
      approverIds: [],
    };
    expect(() => createDocumentSchema.parse(invalid)).toThrow();
  });

  it("validate decideDocumentSchema ตรวจสอบการตัดสินใจ APPROVED หรือ REJECTED", () => {
    const approve = {
      requestId: "c3947f63-125a-4b92-9a67-d86b59524021",
      decision: "APPROVED" as const,
      comment: "เห็นชอบตามเสนอ",
    };
    expect(decideDocumentSchema.parse(approve).decision).toBe("APPROVED");

    const reject = {
      requestId: "c3947f63-125a-4b92-9a67-d86b59524021",
      decision: "REJECTED" as const,
      comment: "เอกสารงบประมาณยังไม่ครบถ้วน",
    };
    expect(decideDocumentSchema.parse(reject).decision).toBe("REJECTED");

    expect(() =>
      decideDocumentSchema.parse({
        requestId: "c3947f63-125a-4b92-9a67-d86b59524021",
        decision: "INVALID_STATUS",
      }),
    ).toThrow();
  });
});
