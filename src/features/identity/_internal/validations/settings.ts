import { z } from "zod";
import { PALETTE_IDS } from "@/shared/lib/palette";

const isValidUrlOrPath = (val: string) => {
  if (!val) return true;
  if (val.startsWith("/")) return true;
  try {
    const u = new URL(val);
    return u.protocol === "http:" || u.protocol === "https:";
  } catch {
    return false;
  }
};

export const smtpSettingsSchema = z.object({
  enabled: z.boolean().default(false),
  user: z.string().trim().default(""),
  appPassword: z.string().trim().default(""),
  fromName: z.string().trim().default(""),
  port: z.union([z.literal(465), z.literal(587)]).default(465),
});

export const updateSettingsSchema = z.object({
  nameTh: z.string().trim().min(1).max(255),
  nameEn: z.string().trim().min(1).max(255),
  logoUrl: z.string().trim().max(500).refine(isValidUrlOrPath, { message: "invalid" }).default(""),
  palette: z.enum(PALETTE_IDS),
  smtp: smtpSettingsSchema.optional(),
});

export const testSmtpSchema = z.object({
  recipient: z.string().trim().email(),
  smtp: smtpSettingsSchema,
});

export const updateProfileSchema = z.object({ name: z.string().trim().min(1).max(255), locale: z.enum(["th", "en"]) });
export type SmtpSettings = z.infer<typeof smtpSettingsSchema>;
export type UpdateSettingsInput = z.infer<typeof updateSettingsSchema>;
export type TestSmtpInput = z.infer<typeof testSmtpSchema>;
export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;

