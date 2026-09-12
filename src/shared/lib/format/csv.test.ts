import { describe, expect, it } from "vitest";
import { generateCsv, parseCsv, parseCsvRows, escapeCsvCell } from "./csv";

describe("csv utility", () => {
  describe("escapeCsvCell", () => {
    it("escapes comma and quotes", () => {
      expect(escapeCsvCell("hello, world")).toBe('"hello, world"');
      expect(escapeCsvCell('hello "world"')).toBe('"hello ""world"""');
      expect(escapeCsvCell("normal")).toBe("normal");
      expect(escapeCsvCell(null)).toBe("");
      expect(escapeCsvCell(undefined)).toBe("");
      expect(escapeCsvCell(123)).toBe("123");
    });
  });

  describe("generateCsv", () => {
    it("generates CSV with UTF-8 BOM", () => {
      const headers = ["ชื่อ", "อีเมล", "บทบาท"];
      const rows = [
        ["สมชาย ใจดี", "somchai@example.com", "STAFF"],
        ["สมหญิง, รักดี", 'somying "test"@example.com', "VIEWER"],
      ];
      const csv = generateCsv(headers, rows);
      expect(csv.charCodeAt(0)).toBe(0xfeff);
      expect(csv).toContain("ชื่อ,อีเมล,บทบาท");
      expect(csv).toContain('"สมหญิง, รักดี"');
      expect(csv).toContain('"somying ""test""@example.com"');
    });
  });

  describe("parseCsvRows & parseCsv", () => {
    it("parses raw rows with parseCsvRows", () => {
      const rows = parseCsvRows('a,b,"c,d"\r\n1,2,3');
      expect(rows).toEqual([["a", "b", "c,d"], ["1", "2", "3"]]);
    });

    it("parses CSV with BOM and quoted commas", () => {
      const csv = '\uFEFFname,email,role,password\r\n"Somchai, Dee",somchai@test.com,STAFF,"Secret,123"\r\nSomying,somying@test.com,VIEWER,Pass1234';
      const parsed = parseCsv(csv);
      expect(parsed.headers).toEqual(["name", "email", "role", "password"]);
      expect(parsed.rows.length).toBe(2);
      expect(parsed.rows[0].name).toBe("Somchai, Dee");
      expect(parsed.rows[0].email).toBe("somchai@test.com");
      expect(parsed.rows[0].role).toBe("STAFF");
      expect(parsed.rows[0].password).toBe("Secret,123");
      expect(parsed.rows[1].name).toBe("Somying");
    });

    it("maps Thai headers to canonical fields", () => {
      const csv = "ชื่อ,อีเมล,บทบาท,รหัสผ่าน\r\nสมชาย,somchai@test.com,เจ้าหน้าที่,Pass1234";
      const parsed = parseCsv(csv);
      expect(parsed.canonicalHeaders).toEqual(["name", "email", "role", "password"]);
      expect(parsed.rows[0].name).toBe("สมชาย");
      expect(parsed.rows[0].email).toBe("somchai@test.com");
      expect(parsed.rows[0].role).toBe("เจ้าหน้าที่");
      expect(parsed.rows[0].password).toBe("Pass1234");
    });
  });
});
