"use server";
import { revalidatePath } from "next/cache";
import { runAction, type ActionResult } from "@/shared/lib/result";
import { getLocale } from "@/shared/lib/i18n/server";
import { zodErrorMap } from "@/shared/lib/i18n/zod-locale";
import { P } from "../../permissions";
import { requirePermission } from "../rbac";
import { updateSettingsSchema } from "../validations/settings";
import { getTenantSettings, updateTenantSettings, type TenantSettings } from "../services/tenant.service";

import { writeFile, mkdir } from "node:fs/promises";
import path from "node:path";
import crypto from "node:crypto";
import { errors } from "@/shared/lib/errors";

const ALLOWED_MIME_TYPES: Record<string, string> = {
  "image/png": ".png",
  "image/jpeg": ".jpg",
  "image/webp": ".webp",
  "image/svg+xml": ".svg",
};
const MAX_FILE_SIZE = 2 * 1024 * 1024; // 2MB

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
    revalidatePath("/", "layout"); // data-palette บน <html> อ่านใหม่
  });
}

export async function uploadLogoAction(formData: FormData): Promise<ActionResult<{ url: string }>> {
  return runAction(async () => {
    const ctx = await requirePermission(P.settingsManage);
    const file = formData.get("file") as File | null;
    if (!file || file.size === 0) {
      throw errors.validation("settings.logoErrorEmpty", { file: ["settings.logoErrorEmpty"] });
    }

    const ext = ALLOWED_MIME_TYPES[file.type];
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
    await writeFile(filePath, buffer);

    return { url: `/uploads/logos/${filename}` };
  });
}

