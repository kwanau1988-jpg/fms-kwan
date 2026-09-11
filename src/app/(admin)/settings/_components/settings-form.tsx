"use client";
import { useState, useRef, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Upload, Trash2, Loader2, Building2, Eye, EyeOff, Mail, Send, KeyRound, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { LiyonCard, LiyonField, PalettePicker } from "@/shared/components/liyon";
import { useT } from "@/shared/lib/i18n/client";
import type { PaletteId } from "@/shared/lib/palette";
import type { TenantSettings } from "@/features/identity";
import { updateSettingsAction, uploadLogoAction, testSmtpAction } from "@/features/identity/actions";

export function SettingsForm({ initial }: { initial: TenantSettings }) {
  const t = useT();
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [form, setForm] = useState({
    nameTh: initial.nameTh,
    nameEn: initial.nameEn,
    logoUrl: initial.logoUrl ?? "",
    palette: initial.palette as PaletteId,
    smtp: initial.smtp ?? {
      enabled: false,
      user: "",
      appPassword: "",
      fromName: "",
      port: 465,
    },
  });
  const [showPassword, setShowPassword] = useState(false);
  const [testEmail, setTestEmail] = useState("");
  const [testingSmtp, setTestingSmtp] = useState(false);
  const [errors, setErrors] = useState<Record<string, string[]>>({});
  const [uploading, setUploading] = useState(false);
  const [pending, start] = useTransition();

  async function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error(t("settings.logoErrorSize"));
      e.target.value = "";
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    setUploading(true);
    try {
      const res = await uploadLogoAction(formData);
      if (!res.ok) {
        toast.error(t(res.error.message));
        return;
      }
      const newLogoUrl = res.data.url;
      setForm((prev) => ({ ...prev, logoUrl: newLogoUrl }));
      // Auto-save logo immediately into tenant settings
      const saveRes = await updateSettingsAction({ ...form, logoUrl: newLogoUrl });
      if (typeof window !== "undefined") {
        window.dispatchEvent(new CustomEvent("tenant-branding-updated"));
      }
      if (saveRes.ok) {
        toast.success(t("settings.logoUploadSuccess"));
        router.refresh();
      } else {
        toast.success(t("settings.logoUploadSuccess"));
      }
    } catch {
      toast.error(t("error.internal"));
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  }

  async function handleRemoveLogo() {
    setForm((prev) => ({ ...prev, logoUrl: "" }));
    try {
      await updateSettingsAction({ ...form, logoUrl: "" });
      if (typeof window !== "undefined") {
        window.dispatchEvent(new CustomEvent("tenant-branding-updated"));
      }
      toast.success(t("settings.saveOk"));
      router.refresh();
    } catch {
      toast.error(t("error.internal"));
    }
  }

  async function handleTestSmtp() {
    if (!testEmail) {
      toast.error(t("settings.smtpTestRecipient") + ": required");
      return;
    }
    if (!form.smtp.user) {
      toast.error(t("settings.smtpUser") + ": required");
      return;
    }
    if (!form.smtp.appPassword) {
      toast.error(t("settings.smtpPassword") + ": required");
      return;
    }

    setTestingSmtp(true);
    try {
      const res = await testSmtpAction({
        recipient: testEmail,
        smtp: form.smtp,
      });
      if (res.ok) {
        toast.success(t("settings.smtpTestSuccess"));
      } else {
        toast.error(t("settings.smtpTestFailed", { reason: res.error.message }));
      }
    } catch {
      toast.error(t("error.internal"));
    } finally {
      setTestingSmtp(false);
    }
  }

  function save() {
    start(async () => {
      const r = await updateSettingsAction(form);
      if (!r.ok) {
        setErrors(r.error.fieldErrors ?? {});
        if (!r.error.fieldErrors) toast.error(t(`error.${r.error.code}`));
        return;
      }
      setErrors({});
      if (typeof window !== "undefined") {
        window.dispatchEvent(new CustomEvent("tenant-branding-updated"));
      }
      toast.success(t("settings.saveOk"));
      router.refresh();
    });
  }

  return (
    <>
      <header className="ph"><h1>{t("settings.title")}</h1></header>
      <div className="set-cards">
        <LiyonCard>
          <h2>{t("settings.orgTitle")}</h2>
          <div className="fields">
            <LiyonField label={t("settings.nameTh")} htmlFor="s-name-th" error={errors.nameTh?.[0]}>
              <input id="s-name-th" value={form.nameTh} onChange={(e) => setForm({ ...form, nameTh: e.target.value })} />
            </LiyonField>
            <LiyonField label={t("settings.nameEn")} htmlFor="s-name-en" error={errors.nameEn?.[0]}>
              <input id="s-name-en" value={form.nameEn} onChange={(e) => setForm({ ...form, nameEn: e.target.value })} />
            </LiyonField>
            <LiyonField
              label={t("settings.logoUrl")}
              htmlFor="s-logo"
              hint={t("settings.logoUploadHint")}
              error={errors.logoUrl?.[0]}
            >
              <div className="logo-up">
                <div className="prev">
                  {form.logoUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={form.logoUrl}
                      alt="Logo"
                      className="w-full h-full object-contain"
                      onError={(e) => {
                        (e.currentTarget as HTMLElement).style.display = "none";
                      }}
                    />
                  ) : (
                    <Building2 className="w-7 h-7 text-muted-foreground" />
                  )}
                </div>
                <div className="flex-1 space-y-2 min-w-[240px]">
                  <div className="flex items-center gap-2">
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/png,image/jpeg,image/webp,image/svg+xml"
                      className="hidden"
                      onChange={handleFileSelect}
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      disabled={uploading || pending}
                      onClick={() => fileInputRef.current?.click()}
                    >
                      {uploading ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin mr-1.5" />
                      ) : (
                        <Upload className="w-3.5 h-3.5 mr-1.5" />
                      )}
                      {uploading ? t("settings.logoUploading") : t("settings.logoUploadBtn")}
                    </Button>
                    {form.logoUrl && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        disabled={uploading || pending}
                        onClick={handleRemoveLogo}
                        className="text-destructive hover:text-destructive hover:bg-destructive/10"
                      >
                        <Trash2 className="w-3.5 h-3.5 mr-1.5" />
                        {t("settings.logoRemoveBtn")}
                      </Button>
                    )}
                  </div>
                  <input
                    id="s-logo"
                    type="text"
                    placeholder="https://... หรือ /uploads/..."
                    value={form.logoUrl}
                    onChange={(e) => setForm({ ...form, logoUrl: e.target.value })}
                  />
                </div>
              </div>
            </LiyonField>
          </div>
        </LiyonCard>

        {/* Gmail SMTP Configuration Card */}
        <LiyonCard>
          <h2>{t("settings.smtpTitle")}</h2>
          <p>{t("settings.smtpDesc")}</p>
          <div className="fields">
            <div className="pt-1 pb-2">
              <label className="flex items-center gap-2.5 cursor-pointer font-medium select-none text-sm">
                <input
                  type="checkbox"
                  className="w-4 h-4 rounded border-border text-brand focus:ring-brand"
                  checked={form.smtp.enabled}
                  onChange={(e) => setForm({ ...form, smtp: { ...form.smtp, enabled: e.target.checked } })}
                />
                <span>{t("settings.smtpEnabled")}</span>
              </label>
            </div>

            {form.smtp.enabled && (
              <>
                {/* Google App Password Help Box */}
                <div className="bg-muted/40 border border-border/70 rounded-lg p-3 text-xs space-y-1 text-muted-foreground my-2">
                  <div className="font-semibold text-foreground flex items-center gap-1.5 pb-0.5">
                    <KeyRound className="w-3.5 h-3.5 text-brand" />
                    {t("settings.smtpHelpTitle")}
                  </div>
                  <p>{t("settings.smtpHelpStep1")}</p>
                  <p>
                    {t("settings.smtpHelpStep2")}{" "}
                    <a
                      href="https://myaccount.google.com/apppasswords"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-brand underline hover:opacity-80 inline-flex items-center gap-0.5 font-medium"
                    >
                      myaccount.google.com/apppasswords
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </p>
                  <p>{t("settings.smtpHelpStep3")}</p>
                </div>

                <LiyonField label={t("settings.smtpUser")} htmlFor="s-smtp-user" hint="เช่น your-faculty@gmail.com">
                  <input
                    id="s-smtp-user"
                    type="email"
                    placeholder="example@gmail.com"
                    value={form.smtp.user}
                    onChange={(e) => setForm({ ...form, smtp: { ...form.smtp, user: e.target.value } })}
                  />
                </LiyonField>

                <LiyonField label={t("settings.smtpFromName")} htmlFor="s-smtp-from" hint="เช่น คณะวิทยาการจัดการ หรือ FMS System">
                  <input
                    id="s-smtp-from"
                    type="text"
                    placeholder="Faculty of Management Science"
                    value={form.smtp.fromName}
                    onChange={(e) => setForm({ ...form, smtp: { ...form.smtp, fromName: e.target.value } })}
                  />
                </LiyonField>

                <LiyonField label={t("settings.smtpPassword")} htmlFor="s-smtp-pass" hint="รหัสผ่านแอป 16 ตัวอักษรที่สร้างจาก Google Account">
                  <div className="relative flex items-center">
                    <input
                      id="s-smtp-pass"
                      type={showPassword ? "text" : "password"}
                      placeholder="abcd efgh ijkl mnop"
                      value={form.smtp.appPassword}
                      onChange={(e) => setForm({ ...form, smtp: { ...form.smtp, appPassword: e.target.value } })}
                      className="pr-10 w-full"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-2.5 p-1 text-muted-foreground hover:text-foreground"
                      title={showPassword ? "Hide password" : "Show password"}
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </LiyonField>

                <LiyonField label={t("settings.smtpPort")} htmlFor="s-smtp-port">
                  <select
                    id="s-smtp-port"
                    value={form.smtp.port}
                    onChange={(e) => setForm({ ...form, smtp: { ...form.smtp, port: Number(e.target.value) as 465 | 587 } })}
                    className="w-full bg-background border border-input rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand"
                  >
                    <option value={465}>Port 465 (SSL - แนะนำสำหรับ Gmail)</option>
                    <option value={587}>Port 587 (TLS/STARTTLS)</option>
                  </select>
                </LiyonField>

                {/* Inline Test Email Tool */}
                <div className="mt-3 pt-3 border-t border-border space-y-2">
                  <label className="text-xs font-semibold flex items-center gap-1.5 text-foreground">
                    <Mail className="w-3.5 h-3.5 text-brand" />
                    {t("settings.smtpTestTitle")}
                  </label>
                  <div className="flex flex-col sm:flex-row gap-2">
                    <input
                      type="email"
                      placeholder={t("settings.smtpTestRecipient")}
                      value={testEmail}
                      onChange={(e) => setTestEmail(e.target.value)}
                      className="flex-1 text-sm bg-background border border-input rounded-md px-3 py-1.5"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      disabled={testingSmtp || !form.smtp.user || !form.smtp.appPassword}
                      onClick={handleTestSmtp}
                      className="shrink-0"
                    >
                      {testingSmtp ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin mr-1.5" />
                      ) : (
                        <Send className="w-3.5 h-3.5 mr-1.5" />
                      )}
                      {testingSmtp ? t("settings.smtpTesting") : t("settings.smtpTestBtn")}
                    </Button>
                  </div>
                </div>
              </>
            )}
          </div>
        </LiyonCard>

        <LiyonCard>
          <h2>{t("settings.brandTitle")}</h2>
          <p>{t("settings.brandDesc")}</p>
          <PalettePicker value={form.palette} onChange={(p) => setForm({ ...form, palette: p })} label={t("settings.paletteLabel")} />
          {form.palette === "coral" && <p className="warn" role="note">{t("settings.coralWarn")}</p>}
        </LiyonCard>
        <div className="savebar">
          <Button type="button" onClick={save} disabled={pending || uploading}>
            {t("common.save")}
          </Button>
        </div>
      </div>
    </>
  );
}

