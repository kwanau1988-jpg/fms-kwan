/**
 * ยูทิลิตี้จัดการไฟล์ CSV ตามมาตรฐาน RFC 4180
 * รองรับ UTF-8 BOM (\uFEFF) เพื่อให้อ่านภาษาไทยใน Microsoft Excel ได้ถูกต้องโดยไม่มีปัญหาตัวอักษรเพี้ยน
 */

export function escapeCsvCell(val: unknown): string {
  if (val === null || val === undefined) return "";
  const str = String(val);
  if (str.includes(",") || str.includes('"') || str.includes("\n") || str.includes("\r")) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

/**
 * สร้างสตริง CSV จากหัวตารางและแถวข้อมูล พร้อมเติม UTF-8 BOM
 */
export function generateCsv(headers: string[], rows: unknown[][]): string {
  const headerLine = headers.map(escapeCsvCell).join(",");
  const dataLines = rows.map((row) => row.map(escapeCsvCell).join(","));
  return "\uFEFF" + [headerLine, ...dataLines].join("\r\n");
}

/**
 * แยกบรรทัดและคอลัมน์ของสตริง CSV ตามมาตรฐาน RFC 4180 (รองรับ Quoted Fields และ Escaped Quotes)
 */
export function parseCsvRows(csvText: string): string[][] {
  let text = csvText.trim();
  if (text.charCodeAt(0) === 0xfeff) {
    text = text.slice(1);
  }
  if (!text) return [];

  const rows: string[][] = [];
  let currentRow: string[] = [];
  let currentCell = "";
  let inQuotes = false;
  let i = 0;

  while (i < text.length) {
    const char = text[i];
    const nextChar = text[i + 1];

    if (inQuotes) {
      if (char === '"') {
        if (nextChar === '"') {
          // Escaped quote
          currentCell += '"';
          i += 2;
          continue;
        } else {
          // Closing quote
          inQuotes = false;
          i++;
          continue;
        }
      } else {
        currentCell += char;
        i++;
        continue;
      }
    } else {
      if (char === '"') {
        inQuotes = true;
        i++;
        continue;
      } else if (char === ",") {
        currentRow.push(currentCell.trim());
        currentCell = "";
        i++;
        continue;
      } else if (char === "\r") {
        if (nextChar === "\n") {
          i++;
        }
        currentRow.push(currentCell.trim());
        currentCell = "";
        rows.push(currentRow);
        currentRow = [];
        i++;
        continue;
      } else if (char === "\n") {
        currentRow.push(currentCell.trim());
        currentCell = "";
        rows.push(currentRow);
        currentRow = [];
        i++;
        continue;
      } else {
        currentCell += char;
        i++;
        continue;
      }
    }
  }

  // Last cell and row
  if (currentCell.length > 0 || currentRow.length > 0) {
    currentRow.push(currentCell.trim());
    rows.push(currentRow);
  }

  // Filter out empty rows
  return rows.filter((r) => r.some((c) => c.length > 0));
}

/** แมปชื่อคอลัมน์ทั้งไทยและอังกฤษให้อยู่ในรูปแบบ canonical */
export const CSV_HEADER_ALIASES: Record<string, string> = {
  name: "name",
  "display name": "name",
  ชื่อ: "name",
  "ชื่อ-สกุล": "name",
  ชื่อผู้ใช้: "name",
  ชื่อที่แสดง: "name",

  email: "email",
  "e-mail": "email",
  อีเมล: "email",
  อีเมล์: "email",

  role: "role",
  rolecode: "role",
  "role code": "role",
  บทบาท: "role",
  บทบาทผู้ใช้: "role",
  สิทธิ์: "role",

  password: "password",
  รหัสผ่าน: "password",
  รหัสผ่านเริ่มต้น: "password",
};

export interface ParsedCsvResult<T = Record<string, string>> {
  headers: string[];
  canonicalHeaders: string[];
  rows: T[];
  rawRows: string[][];
}

/**
 * แปลงไฟล์ CSV เป็นออบเจกต์ พร้อมจับคู่หัวคอลัมน์ภาษาไทยและอังกฤษ
 */
export function parseCsv(csvText: string): ParsedCsvResult {
  const rawRows = parseCsvRows(csvText);
  if (rawRows.length === 0) {
    return { headers: [], canonicalHeaders: [], rows: [], rawRows: [] };
  }

  const headers = rawRows[0];
  const canonicalHeaders = headers.map((h) => {
    const clean = h.trim().toLowerCase();
    return CSV_HEADER_ALIASES[clean] || clean;
  });

  const dataRows = rawRows.slice(1);
  const rows: Record<string, string>[] = [];

  for (const row of dataRows) {
    const obj: Record<string, string> = {};
    for (let c = 0; c < headers.length; c++) {
      const key = canonicalHeaders[c];
      obj[key] = row[c] ?? "";
    }
    rows.push(obj);
  }

  return { headers, canonicalHeaders, rows, rawRows };
}
