"use client";

import { useState } from "react";
import {
  FileText,
  Lock,
  Eye,
  ShieldAlert,
  Printer,
} from "lucide-react";
import { useT, useLocale } from "@/shared/lib/i18n/client";
import {
  LiyonCard,
  DataTable,
  LiyonDialog,
  LiyonDialogHeader,
  LiyonDialogBody,
  LiyonDialogFooter,
  type DataTableColumn,
} from "@/shared/components/liyon";
import { Button } from "@/components/ui/button";
import type { PayrollSlipDto } from "@/features/payroll";

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
  initialSlips: PayrollSlipDto[];
}

export function MyPayrollClient({ initialSlips }: Props) {
  const t = useT();
  const locale = useLocale();
  const [slips] = useState<PayrollSlipDto[]>(initialSlips);
  const [selectedSlip, setSelectedSlip] = useState<PayrollSlipDto | null>(null);

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

  const columns: DataTableColumn<PayrollSlipDto>[] = [
    {
      key: "period",
      header: t("payroll.period"),
      render: (row) => (
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center font-bold text-xs">
            {row.month}
          </div>
          <div>
            <span className="font-semibold text-foreground text-sm block">
              {getMonthName(row.month)} {getDisplayYear(row.year)}
            </span>
            <span className="text-xs text-muted-foreground">
              {row.bankAccountMasked || "—"}
            </span>
          </div>
        </div>
      ),
    },
    {
      key: "netPayable",
      header: t("payroll.netPayable"),
      className: "nowrap text-right font-mono font-bold text-foreground",
      render: (row) => (
        <span className="text-emerald-700 dark:text-emerald-400 text-base">
          ฿{formatCurrency(row.netPayable)}
        </span>
      ),
    },
    {
      key: "actions",
      header: t("common.actions"),
      className: "nowrap text-right",
      render: (row) => (
        <Button
          size="sm"
          variant="outline"
          className="h-8 gap-1.5 text-xs"
          onClick={() => setSelectedSlip(row)}
        >
          <Eye className="w-3.5 h-3.5" />
          {t("payroll.viewSlip")}
        </Button>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">{t("payroll.mySlips")}</h1>
        <p className="text-sm text-muted-foreground">{t("payroll.subtitle")}</p>
      </div>

      {/* Security alert banner */}
      <div className="flex items-start gap-3 p-4 rounded-xl border border-amber-500/30 bg-amber-500/10 text-amber-900 dark:text-amber-200 text-xs">
        <ShieldAlert className="w-5 h-5 shrink-0 text-amber-600 mt-0.5" />
        <div>
          <p className="font-semibold text-sm">{t("payroll.confidentialNotice")}</p>
          <p className="mt-0.5 opacity-90">
            ข้อมูลเงินเดือนและสิทธิประโยชน์ได้รับการเข้ารหัสลับด้วยมาตรฐาน AES-256-GCM ตลอดการจัดเก็บและการเรียกดู
          </p>
        </div>
      </div>

      <LiyonCard>
        <DataTable<PayrollSlipDto>
          headHeading={<span>{t("payroll.mySlips")}</span>}
          state={slips.length === 0 ? "empty" : "data"}
          rows={slips}
          columns={columns}
          getRowId={(row) => row.id}
          empty={{
            icon: <FileText className="h-10 w-10 text-muted-foreground/50" />,
            title: t("payroll.empty"),
            description: t("payroll.subtitle"),
          }}
          error={{
            icon: <ShieldAlert className="h-10 w-10 text-destructive" />,
            title: t("common.error"),
          }}
        />
      </LiyonCard>

      {/* Modal ดูรายละเอียดสลิปเงินเดือน */}
      <LiyonDialog
        open={!!selectedSlip}
        onOpenChange={(open) => !open && setSelectedSlip(null)}
        wide
      >
        <LiyonDialogHeader
          title={
            selectedSlip
              ? `ใบแจ้งยอดเงินเดือน — ${getMonthName(selectedSlip.month)} ${getDisplayYear(selectedSlip.year)}`
              : t("payroll.viewSlip")
          }
          description="Faculty of Management Sciences • Confidential Payroll Slip"
        />
        <LiyonDialogBody>
          {selectedSlip && selectedSlip.breakdown && (
            <div className="space-y-6 py-2">
              {/* Slip Header Box */}
              <div className="p-4 bg-muted/40 rounded-xl border grid grid-cols-2 gap-3 text-xs">
                <div>
                  <span className="text-muted-foreground block">ชื่อ-สกุลบุคลากร</span>
                  <span className="font-semibold text-sm text-foreground">{selectedSlip.userName}</span>
                </div>
                <div>
                  <span className="text-muted-foreground block">บัญชีธนาคาร</span>
                  <span className="font-mono text-sm text-foreground">{selectedSlip.bankAccountMasked}</span>
                </div>
                <div>
                  <span className="text-muted-foreground block">รอบเดือนที่จ่าย</span>
                  <span className="font-medium text-foreground">
                    {getMonthName(selectedSlip.month)} {getDisplayYear(selectedSlip.year)}
                  </span>
                </div>
                <div>
                  <span className="text-muted-foreground block">สถานะการตรวจสอบ</span>
                  <span className="text-emerald-600 font-semibold inline-flex items-center gap-1">
                    <Lock className="w-3 h-3" /> เข้ารหัสความลับเรียบร้อย
                  </span>
                </div>
              </div>

              {/* Breakdown Tables (Income vs Deductions) */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* รายการเงินได้ */}
                <div className="border rounded-xl p-4 bg-emerald-500/5 border-emerald-500/20">
                  <h4 className="font-semibold text-sm text-emerald-800 dark:text-emerald-300 pb-2 border-b border-emerald-500/20">
                    {t("payroll.totalIncome")}
                  </h4>
                  <div className="divide-y divide-emerald-500/10 text-xs py-2 space-y-1.5">
                    <div className="flex justify-between pt-1">
                      <span className="text-muted-foreground">{t("payroll.baseSalary")}</span>
                      <span className="font-mono font-medium">฿{formatCurrency(selectedSlip.breakdown.baseSalary)}</span>
                    </div>
                    <div className="flex justify-between pt-1.5">
                      <span className="text-muted-foreground">{t("payroll.academicAllowance")}</span>
                      <span className="font-mono font-medium">฿{formatCurrency(selectedSlip.breakdown.academicAllowance)}</span>
                    </div>
                    {selectedSlip.breakdown.positionAllowance > 0 && (
                      <div className="flex justify-between pt-1.5">
                        <span className="text-muted-foreground">{t("payroll.positionAllowance")}</span>
                        <span className="font-mono font-medium">฿{formatCurrency(selectedSlip.breakdown.positionAllowance)}</span>
                      </div>
                    )}
                    <div className="flex justify-between pt-1.5">
                      <span className="text-muted-foreground">{t("payroll.specialAllowance")}</span>
                      <span className="font-mono font-medium">฿{formatCurrency(selectedSlip.breakdown.specialAllowance)}</span>
                    </div>
                  </div>
                  <div className="pt-2 border-t border-emerald-500/30 flex justify-between font-bold text-sm text-emerald-900 dark:text-emerald-200">
                    <span>{t("payroll.totalIncome")}</span>
                    <span className="font-mono">฿{formatCurrency(selectedSlip.breakdown.grossIncome)}</span>
                  </div>
                </div>

                {/* รายการหัก */}
                <div className="border rounded-xl p-4 bg-rose-500/5 border-rose-500/20">
                  <h4 className="font-semibold text-sm text-rose-800 dark:text-rose-300 pb-2 border-b border-rose-500/20">
                    {t("payroll.totalDeductions")}
                  </h4>
                  <div className="divide-y divide-rose-500/10 text-xs py-2 space-y-1.5">
                    <div className="flex justify-between pt-1">
                      <span className="text-muted-foreground">{t("payroll.tax")}</span>
                      <span className="font-mono font-medium text-rose-600">฿{formatCurrency(selectedSlip.breakdown.taxWithholding)}</span>
                    </div>
                    <div className="flex justify-between pt-1.5">
                      <span className="text-muted-foreground">{t("payroll.socialSecurity")}</span>
                      <span className="font-mono font-medium text-rose-600">฿{formatCurrency(selectedSlip.breakdown.socialSecurity)}</span>
                    </div>
                    <div className="flex justify-between pt-1.5">
                      <span className="text-muted-foreground">{t("payroll.providentFund")}</span>
                      <span className="font-mono font-medium text-rose-600">฿{formatCurrency(selectedSlip.breakdown.providentFund)}</span>
                    </div>
                    <div className="flex justify-between pt-1.5">
                      <span className="text-muted-foreground">{t("payroll.cooperative")}</span>
                      <span className="font-mono font-medium text-rose-600">฿{formatCurrency(selectedSlip.breakdown.cooperatives)}</span>
                    </div>
                  </div>
                  <div className="pt-2 border-t border-rose-500/30 flex justify-between font-bold text-sm text-rose-900 dark:text-rose-200">
                    <span>{t("payroll.totalDeductions")}</span>
                    <span className="font-mono">฿{formatCurrency(selectedSlip.breakdown.totalDeductions)}</span>
                  </div>
                </div>
              </div>

              {/* Grand Total Net Payable */}
              <div className="p-4 bg-primary/10 border-2 border-primary/30 rounded-xl flex items-center justify-between">
                <div>
                  <span className="text-xs text-muted-foreground uppercase font-semibold tracking-wider">
                    {t("payroll.netPayable")}
                  </span>
                  <p className="text-xs text-muted-foreground">โอนเข้าบัญชีเรียบร้อย</p>
                </div>
                <span className="text-2xl md:text-3xl font-black font-mono text-primary">
                  ฿{formatCurrency(selectedSlip.breakdown.netPayable)}
                </span>
              </div>
            </div>
          )}
        </LiyonDialogBody>
        <LiyonDialogFooter>
          <Button
            variant="outline"
            className="gap-1.5"
            onClick={() => window.print()}
          >
            <Printer className="w-4 h-4" />
            พิมพ์สลิป (Print / PDF)
          </Button>
          <Button variant="default" onClick={() => setSelectedSlip(null)}>
            {t("common.close")}
          </Button>
        </LiyonDialogFooter>
      </LiyonDialog>
    </div>
  );
}
