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

export const updateSettingsSchema = z.object({
  nameTh: z.string().trim().min(1).max(255),
  nameEn: z.string().trim().min(1).max(255),
  logoUrl: z.string().trim().max(500).refine(isValidUrlOrPath, { message: "invalid" }).default(""),
  palette: z.enum(PALETTE_IDS),
});
export const updateProfileSchema = z.object({ name: z.string().trim().min(1).max(255), locale: z.enum(["th", "en"]) });
export type UpdateSettingsInput = z.infer<typeof updateSettingsSchema>;
export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
