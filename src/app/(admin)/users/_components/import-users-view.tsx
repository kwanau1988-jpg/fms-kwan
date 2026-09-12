"use client";
import { useState, useRef, useTransition } from "react";
import { Upload, Download, FileSpreadsheet, CheckCircle2, XCircle, Trash2, Loader2, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { useT, useLocale } from "@/shared/lib/i18n/client";
import { generateCsv, parseCsv } from "@/shared/lib/format/csv";
import { importUsersBatchAction } from "@/features/identity/actions";
import type { RolePick } from "./types";

export interface ValidatedRow {
  rowNum: number;
  name: string;
  email: string;
  role: string;
  password: string;
  isValid: boolean;
  errors: string[];
}

export function ImportUsersView({
  roles,
  onSuccess,
  onCancel,
}: {
  roles: RolePick[];
  onSuccess: () => void;
  onCancel?: () => void;
}) {
  const t = useT();
  const locale = useLocale();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [fileName, setFileName] = useState<string | null>(null);
  const [rows, setRows] = useState<ValidatedRow[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [pending, startTransition] = useTransition();

  // Role matching map
  const roleCodeMap = new Map<string, RolePick>();
  for (const r of roles) {
    roleCodeMap.set(r.code.toUpperCase(), r);
    roleCodeMap.set(r.nameTh.toLowerCase(), r);
    roleCodeMap.set(r.nameEn.toLowerCase(), r);
  }

  // Template download
  function handleDownloadTemplate() {
    const headers = ["name", "email", "role", "password"];
    const sampleRows = [
      ["สมชาย ใจดี", "somchai.j@example.com", "STAFF", "Pass123456!"],
      ["สมหญิง รักเรียน", "somying.r@example.com", "VIEWER", "Pass123456!"],
      ["วิชัย เก่งการงาน", "wichai.k@example.com", "ADMIN", "Pass123456!"],
    ];
    const csvContent = generateCsv(headers, sampleRows);
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "user_import_template.csv";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    toast.success(t("users.downloadTemplate"));
  }

  // Process file content
  function processCsvText(text: string, name: string) {
    const parsed = parseCsv(text);
    if (parsed.rows.length === 0) {
      toast.error(t("users.noResults"));
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const seenEmails = new Set<string>();
    const validatedRows: ValidatedRow[] = [];

    parsed.rows.forEach((row, idx) => {
      const rowNum = idx + 1;
      const rowName = (row.name || "").trim();
      const rawEmail = (row.email || "").trim().toLowerCase();
      const rawRole = (row.role || "").trim();
      const rawPassword = (row.password || "").trim();

      const errors: string[] = [];

      // Name validation
      if (!rowName) {
        errors.push(t("users.err.nameRequired"));
      }

      // Email validation
      if (!rawEmail) {
        errors.push(t("users.err.emailInvalid"));
      } else if (!emailRegex.test(rawEmail)) {
        errors.push(t("users.err.emailInvalid"));
      } else if (seenEmails.has(rawEmail)) {
        errors.push(t("users.err.emailDuplicateInCsv"));
      } else {
        seenEmails.add(rawEmail);
      }

      // Role validation
      if (!rawRole) {
        errors.push(t("users.err.roleNotFound"));
      } else {
        const matched = roleCodeMap.get(rawRole.toUpperCase()) || roleCodeMap.get(rawRole.toLowerCase());
        if (!matched) {
          errors.push(t("users.err.roleNotFound"));
        }
      }

      // Password validation (optional, but if given must be >= 8)
      if (rawPassword && rawPassword.length < 8) {
        errors.push(t("users.err.passwordTooShort"));
      }

      validatedRows.push({
        rowNum,
        name: rowName,
        email: rawEmail,
        role: rawRole,
        password: rawPassword,
        isValid: errors.length === 0,
        errors,
      });
    });

    setFileName(name);
    setRows(validatedRows);
  }

  function handleFileSelected(file: File) {
    if (!file.name.toLowerCase().endsWith(".csv")) {
      toast.error(t("users.dropFileHint"));
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      if (text) {
        processCsvText(text, file.name);
      }
    };
    reader.readAsText(file, "UTF-8");
  }

  function handleDrop(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileSelected(e.dataTransfer.files[0]);
    }
  }

  function handleReset() {
    setFileName(null);
    setRows([]);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }

  const validRows = rows.filter((r) => r.isValid);
  const invalidRows = rows.filter((r) => !r.isValid);

  function handleConfirmImport() {
    if (validRows.length === 0) return;

    startTransition(async () => {
      const payload = {
        users: validRows.map((r) => ({
          name: r.name,
          email: r.email,
          role: r.role,
          password: r.password || "",
        })),
      };

      const res = await importUsersBatchAction(payload);
      if (!res.ok) {
        toast.error(res.error.message || t("users.importFail"));
        return;
      }

      const { successCount, failCount, results } = res.data;
      if (failCount === 0) {
        toast.success(t("users.importSuccess", { count: successCount }));
        onSuccess();
      } else {
        toast.warning(t("users.importPartial", { done: successCount, fail: failCount }));
        // Update row errors with server response
        const serverErrMap = new Map<string, string>();
        for (const item of results) {
          if (item.status === "error" && item.error) {
            serverErrMap.set(item.email, item.error === "email_already_exists" ? t("users.err.emailExists") : item.error);
          }
        }
        setRows((prev) =>
          prev.map((r) => {
            const sErr = serverErrMap.get(r.email);
            if (sErr) {
              return { ...r, isValid: false, errors: [...r.errors, sErr] };
            }
            return r;
          }),
        );
        onSuccess();
      }
    });
  }

  return (
    <div className="space-y-4">
      {/* Action header bar: Template info and Download button */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 bg-muted/40 rounded-xl border border-border/60">
        <div className="space-y-0.5 text-sm">
          <p className="font-semibold text-foreground flex items-center gap-1.5">
            <FileSpreadsheet className="size-4 text-primary" />
            {t("users.templateHint")}
          </p>
          <p className="text-xs text-muted-foreground">
            {locale === "th"
              ? "หัวคอลัมน์ที่รองรับ: name (ชื่อ), email (อีเมล), role (บทบาท เช่น STAFF, VIEWER, ADMIN), password (รหัสผ่าน >= 8 ตัว หรือเว้นว่าง)"
              : "Supported columns: name, email, role (e.g. STAFF, VIEWER, ADMIN), password (>= 8 chars or blank)"}
          </p>
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={handleDownloadTemplate}
          className="shrink-0 gap-1.5 font-medium border-dashed hover:border-primary hover:text-primary"
        >
          <Download className="size-3.5" />
          {t("users.downloadTemplate")}
        </Button>
      </div>

      {/* File Upload Zone */}
      {!fileName ? (
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragging(true);
          }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`flex flex-col items-center justify-center p-8 border-2 border-dashed rounded-2xl cursor-pointer transition-all ${
            isDragging
              ? "border-primary bg-primary/5 scale-[0.99]"
              : "border-border/80 hover:border-primary/60 hover:bg-muted/30"
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv"
            className="hidden"
            onChange={(e) => {
              if (e.target.files && e.target.files.length > 0) {
                handleFileSelected(e.target.files[0]);
              }
            }}
          />
          <div className="size-12 rounded-full bg-primary/10 flex items-center justify-center text-primary mb-3 shadow-xs">
            <Upload className="size-6" />
          </div>
          <p className="font-medium text-foreground text-sm mb-1">{t("users.dropFile")}</p>
          <p className="text-xs text-muted-foreground">{t("users.dropFileHint")}</p>
        </div>
      ) : (
        <div className="space-y-4">
          {/* File summary & stats bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-card rounded-xl border border-border shadow-2xs">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="size-9 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                <FileSpreadsheet className="size-5" />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-foreground truncate">{fileName}</p>
                <div className="flex items-center gap-2 text-xs mt-0.5">
                  <span className="text-muted-foreground">{t("users.previewTotal", { total: rows.length })}</span>
                  <span>•</span>
                  <span className="text-emerald-600 dark:text-emerald-400 font-medium">
                    {t("users.previewValid", { count: validRows.length })}
                  </span>
                  {invalidRows.length > 0 && (
                    <>
                      <span>•</span>
                      <span className="text-destructive font-medium">
                        {t("users.previewInvalid", { count: invalidRows.length })}
                      </span>
                    </>
                  )}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button type="button" variant="outline" size="sm" onClick={handleReset} className="text-xs gap-1">
                <Trash2 className="size-3.5 text-muted-foreground" />
                {t("users.chooseNewFile")}
              </Button>
            </div>
          </div>

          {/* Validation Table Preview */}
          <div className="border border-border/80 rounded-xl overflow-hidden shadow-2xs bg-card">
            <div className="max-h-[340px] overflow-y-auto">
              <table className="w-full text-xs text-left border-collapse">
                <thead className="bg-muted/70 sticky top-0 z-10 border-b border-border text-muted-foreground font-medium uppercase tracking-wider">
                  <tr>
                    <th className="py-2.5 px-3 w-12 text-center">{t("users.colRow")}</th>
                    <th className="py-2.5 px-3">{t("users.colName")}</th>
                    <th className="py-2.5 px-3">{t("users.email")}</th>
                    <th className="py-2.5 px-3">{t("users.roles")}</th>
                    <th className="py-2.5 px-3">{t("users.colPassword")}</th>
                    <th className="py-2.5 px-3 text-right min-w-[180px]">{t("users.colStatus")}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60">
                  {rows.map((row) => (
                    <tr
                      key={row.rowNum}
                      className={`hover:bg-muted/30 transition-colors ${
                        !row.isValid ? "bg-destructive/5" : ""
                      }`}
                    >
                      <td className="py-2.5 px-3 text-center text-muted-foreground font-mono">
                        {row.rowNum}
                      </td>
                      <td className="py-2.5 px-3 font-medium text-foreground">
                        {row.name || <span className="text-destructive italic">({t("users.err.nameRequired")})</span>}
                      </td>
                      <td className="py-2.5 px-3 text-muted-foreground font-mono">
                        {row.email}
                      </td>
                      <td className="py-2.5 px-3">
                        <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-medium bg-muted text-foreground border border-border/60">
                          {row.role || "-"}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-muted-foreground">
                        {row.password ? (
                          <span className="font-mono text-xs">••••••••</span>
                        ) : (
                          <span className="text-[11px] text-muted-foreground italic">
                            {t("users.passwordSetupNotice")}
                          </span>
                        )}
                      </td>
                      <td className="py-2.5 px-3 text-right">
                        {row.isValid ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                            <CheckCircle2 className="size-3" />
                            {t("users.statusValid")}
                          </span>
                        ) : (
                          <div className="inline-flex flex-col items-end gap-0.5">
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium bg-destructive/10 text-destructive border border-destructive/20">
                              <XCircle className="size-3" />
                              {t("users.statusInvalid")}
                            </span>
                            <span className="text-[10px] text-destructive leading-tight text-right">
                              {row.errors.join(", ")}
                            </span>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Warning banner if there are invalid rows */}
          {invalidRows.length > 0 && (
            <div className="flex items-center gap-2 p-2.5 rounded-lg bg-amber-500/10 text-amber-800 dark:text-amber-300 border border-amber-500/20 text-xs">
              <AlertCircle className="size-4 shrink-0" />
              <span>
                {locale === "th"
                  ? `ระบบจะข้ามรายการที่ไม่ถูกต้อง ${invalidRows.length} รายการ และนำเข้าเฉพาะรายการที่ตรวจสอบผ่าน (${validRows.length} รายการ)`
                  : `The system will skip ${invalidRows.length} invalid rows and import only the ${validRows.length} verified rows.`}
              </span>
            </div>
          )}

          {/* Action Footer */}
          <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-border">
            {onCancel && (
              <Button type="button" variant="outline" onClick={onCancel} disabled={pending}>
                {t("common.cancel")}
              </Button>
            )}
            <Button
              type="button"
              disabled={validRows.length === 0 || pending}
              onClick={handleConfirmImport}
              className="gap-2 min-w-36"
            >
              {pending ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  {t("users.importing")}
                </>
              ) : (
                <>
                  <CheckCircle2 className="size-4" />
                  {t("users.confirmImport", { count: validRows.length })}
                </>
              )}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
