"use client";

import { Printer, Shield, Building2, CheckCircle2 } from "lucide-react";
import { useT, useLocale } from "@/shared/lib/i18n/client";
import { formatThaiBahtText } from "@/shared/lib/format/thai-baht";
import {
  LiyonDialog,
  LiyonDialogHeader,
  LiyonDialogBody,
  LiyonDialogFooter,
} from "@/shared/components/liyon";
import { Button } from "@/components/ui/button";
import type { PayrollSlipDto } from "../_internal/services";


const THAI_MONTHS = [
  "",
  "มกราคม",
  "กุมภาพันธ์",
  "มีนาคม",
  "เมษายน",
  "พฤษภาคม",
  "มิถุนายน",
  "กรกฎาคม",
  "สิงหาคม",
  "กันยายน",
  "ตุลาคม",
  "พฤศจิกายน",
  "ธันวาคม",
];

const ENG_MONTHS = [
  "",
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

interface Props {
  slip: PayrollSlipDto | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function OfficialPayslipModal({ slip, open, onOpenChange }: Props) {
  const t = useT();
  const locale = useLocale();

  if (!slip || !slip.breakdown) return null;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat(locale === "th" ? "th-TH" : "en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  const getMonthName = (month: number) => {
    return locale === "th" ? THAI_MONTHS[month] : ENG_MONTHS[month];
  };

  const getDisplayYear = (year: number) => {
    return locale === "th" ? year + 543 : year;
  };

  const handlePrint = () => {
    window.print();
  };

  const b = slip.breakdown;
  const thaiBahtWords = formatThaiBahtText(b.netPayable);

  return (
    <LiyonDialog open={open} onOpenChange={onOpenChange} wide>
      <LiyonDialogHeader
        title={t("payroll.officialSlipTitle")}
        description={`${t("payroll.facultyName")} • ${getMonthName(slip.month)} ${getDisplayYear(slip.year)}`}
      />
      <LiyonDialogBody>
        <div id="printable-payslip" className="p-6 md:p-8 bg-card rounded-2xl border text-foreground space-y-6 shadow-sm print:p-0 print:border-0 print:shadow-none print:bg-white print:text-black">
          {/* Header & Logo */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between border-b pb-5 gap-4">
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold text-xl border border-primary/20 shrink-0 print:border-black">
                <Building2 className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold tracking-tight text-foreground print:text-black">
                  {t("payroll.facultyName")}
                </h3>
                <p className="text-xs text-muted-foreground print:text-gray-600">
                  {t("payroll.officialSlipTitle")} (Electronic Payslip)
                </p>
              </div>
            </div>
            <div className="text-left sm:text-right text-xs space-y-1">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 font-semibold print:border print:border-gray-400">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>{t("payroll.published")}</span>
              </div>
              <p className="text-muted-foreground print:text-gray-600">
                {t("payroll.period")}: <strong className="text-foreground print:text-black">{getMonthName(slip.month)} {getDisplayYear(slip.year)}</strong>
              </p>
            </div>
          </div>

          {/* Personnel Information Card */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 p-4 rounded-xl bg-muted/40 border text-xs print:bg-gray-50 print:border-gray-300">
            <div>
              <span className="text-muted-foreground block print:text-gray-600">{t("payroll.personnelName")}</span>
              <span className="font-bold text-sm text-foreground print:text-black">
                {slip.academicTitle ? `${slip.academicTitle} ` : ""}{slip.userName}
              </span>
            </div>
            <div>
              <span className="text-muted-foreground block print:text-gray-600">ตำแหน่ง / สังกัด</span>
              <span className="font-semibold text-foreground print:text-black">
                {slip.positionTh || "บุคลากร"} ({slip.departmentTh || "คณะวิทยาการจัดการ"})
              </span>
            </div>
            <div>
              <span className="text-muted-foreground block print:text-gray-600">{t("payroll.bankAccount")}</span>
              <span className="font-mono font-semibold text-foreground print:text-black">
                {slip.bankAccountMasked || "—"}
              </span>
            </div>
            <div>
              <span className="text-muted-foreground block print:text-gray-600">อีเมลบุคลากร</span>
              <span className="font-mono text-muted-foreground print:text-gray-600">{slip.userEmail}</span>
            </div>
          </div>

          {/* Two-Column Earnings & Deductions Tables */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Earnings Column */}
            <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-4 print:border-gray-300 print:bg-transparent">
              <div className="flex items-center justify-between pb-2 border-b border-emerald-500/20 mb-3">
                <span className="font-bold text-sm text-emerald-900 dark:text-emerald-300 print:text-black">
                  {t("payroll.earnings")}
                </span>
                <span className="text-xs text-muted-foreground">จำนวนเงิน (บาท)</span>
              </div>
              <div className="space-y-2.5 text-xs">
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground print:text-gray-700">{t("payroll.baseSalary")}</span>
                  <span className="font-mono font-semibold">฿{formatCurrency(b.baseSalary)}</span>
                </div>
                {b.academicAllowance > 0 && (
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground print:text-gray-700">{t("payroll.academicAllowance")}</span>
                    <span className="font-mono font-semibold">฿{formatCurrency(b.academicAllowance)}</span>
                  </div>
                )}
                {b.positionAllowance > 0 && (
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground print:text-gray-700">{t("payroll.positionAllowance")}</span>
                    <span className="font-mono font-semibold">฿{formatCurrency(b.positionAllowance)}</span>
                  </div>
                )}
                {b.specialAllowance > 0 && (
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground print:text-gray-700">{t("payroll.specialAllowance")}</span>
                    <span className="font-mono font-semibold">฿{formatCurrency(b.specialAllowance)}</span>
                  </div>
                )}
              </div>
              <div className="mt-4 pt-3 border-t border-emerald-500/30 flex justify-between items-center text-sm font-bold text-emerald-950 dark:text-emerald-200 print:text-black">
                <span>{t("payroll.totalGross")}</span>
                <span className="font-mono">฿{formatCurrency(b.grossIncome)}</span>
              </div>
            </div>

            {/* Deductions Column */}
            <div className="rounded-xl border border-rose-500/20 bg-rose-500/5 p-4 print:border-gray-300 print:bg-transparent">
              <div className="flex items-center justify-between pb-2 border-b border-rose-500/20 mb-3">
                <span className="font-bold text-sm text-rose-900 dark:text-rose-300 print:text-black">
                  {t("payroll.deductions")}
                </span>
                <span className="text-xs text-muted-foreground">จำนวนเงิน (บาท)</span>
              </div>
              <div className="space-y-2.5 text-xs">
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground print:text-gray-700">{t("payroll.tax")}</span>
                  <span className="font-mono font-semibold text-rose-600 dark:text-rose-400 print:text-black">
                    ฿{formatCurrency(b.taxWithholding)}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground print:text-gray-700">{t("payroll.socialSecurity")}</span>
                  <span className="font-mono font-semibold text-rose-600 dark:text-rose-400 print:text-black">
                    ฿{formatCurrency(b.socialSecurity)}
                  </span>
                </div>
                {b.providentFund > 0 && (
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground print:text-gray-700">{t("payroll.providentFund")}</span>
                    <span className="font-mono font-semibold text-rose-600 dark:text-rose-400 print:text-black">
                      ฿{formatCurrency(b.providentFund)}
                    </span>
                  </div>
                )}
                {b.cooperatives > 0 && (
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground print:text-gray-700">{t("payroll.cooperative")}</span>
                    <span className="font-mono font-semibold text-rose-600 dark:text-rose-400 print:text-black">
                      ฿{formatCurrency(b.cooperatives)}
                    </span>
                  </div>
                )}
              </div>
              <div className="mt-4 pt-3 border-t border-rose-500/30 flex justify-between items-center text-sm font-bold text-rose-950 dark:text-rose-200 print:text-black">
                <span>{t("payroll.totalDeductions")}</span>
                <span className="font-mono">฿{formatCurrency(b.totalDeductions)}</span>
              </div>
            </div>
          </div>

          {/* Grand Net Payable Banner with Thai Baht Words */}
          <div className="p-5 rounded-xl border-2 border-primary/30 bg-primary/10 print:border-black print:bg-gray-100 flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
            <div>
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block print:text-gray-700">
                {t("payroll.netTotal")}
              </span>
              <p className="text-sm font-bold text-primary dark:text-primary-foreground print:text-black">
                {t("payroll.thaiBahtText")}: {thaiBahtWords}
              </p>
            </div>
            <div className="text-left md:text-right">
              <span className="text-2xl sm:text-3xl font-black font-mono text-primary print:text-black">
                ฿{formatCurrency(b.netPayable)}
              </span>
            </div>
          </div>

          {/* Confidentiality and Certified Notice */}
          <div className="pt-2 text-center text-xs text-muted-foreground space-y-1 print:text-gray-600">
            <p className="flex items-center justify-center gap-1">
              <Shield className="w-3.5 h-3.5 text-primary" />
              <span>{t("payroll.confidentialNotice")}</span>
            </p>
            <p className="text-[11px] opacity-80">
              เอกสารนี้ออกโดยระบบบริหารจัดการเงินเดือนอิเล็กทรอนิกส์ (E-Payroll) คณะวิทยาการจัดการ มีผลสมบูรณ์ตาม พ.ร.บ.ธุรกรรมทางอิเล็กทรอนิกส์ ไม่ต้องลงลายมือชื่อ
            </p>
          </div>
        </div>
      </LiyonDialogBody>
      <LiyonDialogFooter>
        <Button
          variant="outline"
          className="gap-1.5"
          onClick={handlePrint}
        >
          <Printer className="w-4 h-4" />
          {t("payroll.printOfficial")}
        </Button>
        <Button variant="default" onClick={() => onOpenChange(false)}>
          {t("common.close")}
        </Button>
      </LiyonDialogFooter>
    </LiyonDialog>
  );
}
