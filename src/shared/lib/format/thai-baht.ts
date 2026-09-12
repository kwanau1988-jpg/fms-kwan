/**
 * แปลงจำนวนเงินตัวเลขเป็นตัวอักษรภาษาไทยมาตรฐาน
 * ตัวอย่าง: 57902 -> "ห้าหมื่นเจ็ดพันเก้าร้อยสองบาทถ้วน"
 * ตัวอย่าง: 3500.50 -> "สามพันห้าร้อยบาทห้าสิบสตางค์"
 */
export function formatThaiBahtText(amount: number): string {
  if (isNaN(amount)) return "";
  if (amount === 0) return "ศูนย์บาทถ้วน";

  const isNegative = amount < 0;
  const absAmount = Math.abs(amount);

  // ปัดเศษทศนิยม 2 ตำแหน่ง
  const rounded = Math.round(absAmount * 100) / 100;
  const parts = rounded.toFixed(2).split(".");
  const integerPart = parts[0];
  const decimalPart = parts[1];

  const digits = ["", "หนึ่ง", "สอง", "สาม", "สี่", "ห้า", "หก", "เจ็ด", "แปด", "เก้า"];
  const positions = ["", "สิบ", "ร้อย", "พัน", "หมื่น", "แสน", "ล้าน"];

  function convertGroup(numStr: string, hasHigherDigits: boolean): string {
    let result = "";
    const len = numStr.length;

    for (let i = 0; i < len; i++) {
      const digit = Number(numStr[i]);
      const pos = len - i - 1;

      if (digit === 0) continue;

      if (pos === 0 && digit === 1) {
        const hasPrevInChunk = numStr.slice(0, i).split("").some((d) => Number(d) > 0);
        if (hasPrevInChunk || hasHigherDigits) {
          result += "เอ็ด";
        } else {
          result += "หนึ่ง";
        }
      } else if (pos === 1 && digit === 1) {
        result += "สิบ";
      } else if (pos === 1 && digit === 2) {
        result += "ยี่สิบ";
      } else {
        result += digits[digit] + positions[pos];
      }
    }

    return result;
  }

  function convertInteger(numStr: string): string {
    if (numStr === "0") return "";
    let result = "";
    let remaining = numStr;
    let isBaseChunk = true;

    // แบ่งทีละ 6 หลัก (ระดับ "ล้าน")
    while (remaining.length > 6) {
      const chunk = remaining.slice(-6);
      remaining = remaining.slice(0, -6);
      const hasHigher = remaining.split("").some((d) => Number(d) > 0);
      result = convertGroup(chunk, hasHigher) + (result ? "ล้าน" + result : "");
      isBaseChunk = false;
    }

    const chunkResult = convertGroup(remaining, false);
    if (isBaseChunk) {
      result = chunkResult;
    } else {
      result = chunkResult + "ล้าน" + result;
    }

    return result;
  }


  let text = convertInteger(integerPart);
  if (!text && Number(decimalPart) === 0) {
    return "ศูนย์บาทถ้วน";
  }

  if (text) {
    text += "บาท";
  }

  const satang = Number(decimalPart);
  if (satang === 0) {
    text += "ถ้วน";
  } else {
    text += convertGroup(decimalPart, false) + "สตางค์";
  }

  return (isNegative ? "ลบ" : "") + text;
}
