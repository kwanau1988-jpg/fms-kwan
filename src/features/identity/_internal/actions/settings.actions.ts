"use server";
import { revalidatePath } from "next/cache";
import { runAction, type ActionResult } from "@/shared/lib/result";
import { getLocale } from "@/shared/lib/i18n/server";
import { zodErrorMap } from "@/shared/lib/i18n/zod-locale";
import { P } from "../../permissions";
import { requirePermission } from "../rbac";
import { updateSettingsSchema, testSmtpSchema } from "../validations/settings";
import { getTenantSettings, updateTenantSettings, getTenantRawSmtp, MASKED_PASSWORD, type TenantSettings } from "../services/tenant.service";

import { writeFile, mkdir } from "node:fs/promises";
import path from "node:path";
import crypto from "node:crypto";
import { errors } from "@/shared/lib/errors";

const ALLOWED_MIME_TYPES: Record<string, string> = {
  "image/png": ".png",
  "image/x-png": ".png",
  "image/jpeg": ".jpg",
  "image/jpg": ".jpg",
  "image/pjpeg": ".jpg",
  "image/webp": ".webp",
  "image/svg+xml": ".svg",
};
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB for flexibility

import { prisma } from "@/shared/lib/infra/prisma";

export async function getSettingsAction(): Promise<ActionResult<TenantSettings>> {
  return runAction(async () => getTenantSettings((await requirePermission(P.settingsManage)).tenantId));
}

export async function getTenantBrandingAction(): Promise<ActionResult<{ logoUrl: string | null; nameTh: string; nameEn: string }>> {
  return runAction(async () => {
    const t = await prisma.tenant.findFirst({ orderBy: { createdAt: "asc" }, select: { logoUrl: true, nameTh: true, nameEn: true } });
    return { logoUrl: t?.logoUrl ?? null, nameTh: t?.nameTh ?? "", nameEn: t?.nameEn ?? "" };
  });
}

export async function updateSettingsAction(input: unknown): Promise<ActionResult<void>> {
  return runAction(async () => {
    const ctx = await requirePermission(P.settingsManage);
    await updateTenantSettings({ tenantId: ctx.tenantId, actorId: ctx.userId, ...updateSettingsSchema.parse(input, { error: zodErrorMap(await getLocale()) }) });
    revalidatePath("/", "layout");
    revalidatePath("/portal", "layout");
    revalidatePath("/portal", "page");
    revalidatePath("/dashboard", "layout");
    revalidatePath("/settings", "page");
  });
}

export async function uploadLogoAction(formData: FormData): Promise<ActionResult<{ url: string }>> {
  return runAction(async () => {
    const ctx = await requirePermission(P.settingsManage);
    const file = formData.get("file") as File | null;
    if (!file || file.size === 0) {
      throw errors.validation("settings.logoErrorEmpty", { file: ["settings.logoErrorEmpty"] });
    }

    let ext = ALLOWED_MIME_TYPES[file.type.toLowerCase()];
    if (!ext && file.name) {
      const match = file.name.match(/\.(png|jpe?g|webp|svg)$/i);
      if (match) {
        const raw = match[1].toLowerCase();
        ext = raw === "jpeg" ? ".jpg" : `.${raw}`;
      }
    }

    if (!ext) {
      throw errors.validation("settings.logoErrorType", { file: ["settings.logoErrorType"] });
    }

    if (file.size > MAX_FILE_SIZE) {
      throw errors.validation("settings.logoErrorSize", { file: ["settings.logoErrorSize"] });
    }

    const uploadDir = path.join(process.cwd(), "public", "uploads", "logos");
    await mkdir(uploadDir, { recursive: true });

    const safeTenant = ctx.tenantId.replace(/[^a-zA-Z0-9]/g, "").slice(0, 8);
    const uniqueSuffix = `${Date.now()}-${crypto.randomBytes(4).toString("hex")}`;
    const filename = `logo-${safeTenant}-${uniqueSuffix}${ext}`;
    const filePath = path.join(uploadDir, filename);

    const buffer = Buffer.from(await file.arrayBuffer());

    // Security check: Prevent Stored XSS via malicious SVG files
    if (ext === ".svg") {
      const content = buffer.toString("utf8");
      if (
        /<script[\s>]/i.test(content) ||
        /javascript:/i.test(content) ||
        /on\w+\s*=/i.test(content) ||
        /<foreignObject[\s>]/i.test(content)
      ) {
        throw errors.validation("settings.logoErrorType", { file: ["settings.logoErrorType"] });
      }
    }

    await writeFile(filePath, buffer);

    return { url: `/uploads/logos/${filename}` };
  });
}

export async function testSmtpAction(input: unknown): Promise<ActionResult<{ success: boolean; message?: string }>> {
  return runAction(async () => {
    const ctx = await requirePermission(P.settingsManage);
    const parsed = testSmtpSchema.parse(input, { error: zodErrorMap(await getLocale()) });
    const { recipient, smtp } = parsed;

    let passwordToUse = smtp.appPassword;
    if (passwordToUse === MASKED_PASSWORD || !passwordToUse) {
      const tenantSmtp = await getTenantRawSmtp(ctx.tenantId);
      passwordToUse = tenantSmtp?.appPassword || "";
    }

    if (!smtp.user || !passwordToUse) {
      throw errors.validation("settings.smtpErrorEmpty", { user: ["settings.smtpUserRequired"] });
    }

    const host = "smtp.gmail.com";
    const port = smtp.port;
    const from = smtp.fromName
      ? `"${smtp.fromName.replace(/"/g, "")}" <${smtp.user}>`
      : smtp.user;

    const nodemailer = (await import("nodemailer")).default;
    const transport = nodemailer.createTransport({
      host,
      port,
      secure: port === 465,
      auth: {
        user: smtp.user,
        pass: passwordToUse.replace(/\s+/g, ""),
      },
    });

    try {
      await transport.verify();
      await transport.sendMail({
        from,
        to: recipient,
        subject: `[FMS Test] ทดสอบการเชื่อมต่อ Gmail SMTP สำเร็จ`,
        text: `สวัสดีครับ\n\nอีเมลฉบับนี้เป็นการทดสอบการตั้งค่า Gmail SMTP จากระบบ Faculty Management System (FMS)\n\nหากคุณได้รับอีเมลนี้ แสดงว่าการตั้งค่าอีเมลผู้ส่ง (${smtp.user}) ทำงานได้ถูกต้องสมบูรณ์แล้วครับ\n\nเวลาส่ง: ${new Date().toLocaleString("th-TH")}`,
        html: `
          <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 8px;">
            <h2 style="color: #059669; margin-top: 0;">✓ ทดสอบการเชื่อมต่อ Gmail SMTP สำเร็จ</h2>
            <p>สวัสดีครับ</p>
            <p>อีเมลฉบับนี้เป็นการทดสอบการตั้งค่า <strong>Gmail SMTP</strong> จากระบบ <strong>Faculty Management System (FMS)</strong></p>
            <div style="background-color: #f8fafc; border-left: 4px solid #10b981; padding: 12px 16px; margin: 16px 0;">
              <p style="margin: 0;"><strong>อีเมลผู้ส่ง:</strong> ${smtp.user}</p>
              <p style="margin: 4px 0 0 0;"><strong>พอร์ต:</strong> ${port} (${port === 465 ? "SSL" : "TLS"})</p>
              <p style="margin: 4px 0 0 0;"><strong>เวลาที่ส่ง:</strong> ${new Date().toLocaleString("th-TH")}</p>
            </div>
            <p style="color: #64748b; font-size: 14px;">ระบบ FMS พร้อมสำหรับการส่งอีเมลแจ้งเตือน รหัสผ่าน และข่าวสารผ่านบัญชี Gmail นี้เรียบร้อยแล้ว</p>
          </div>
        `,
      });
      return { success: true };
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      throw errors.internal(msg);
    }
  });
}

