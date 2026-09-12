"use client";

import { useState } from "react";
import {
  FileText,
  Eye,
  ShieldAlert,
} from "lucide-react";
import { useT, useLocale } from "@/shared/lib/i18n/client";
import {
  LiyonCard,
  DataTable,
  type DataTableColumn,
} from "@/shared/components/liyon";
import { Button } from "@/components/ui/button";
import { OfficialPayslipModal, type PayrollSlipDto } from "@/features/payroll";


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

      {/* Modal ดูรายละเอียดสลิปเงินเดือนฉบับทางการ */}
      <OfficialPayslipModal
        slip={selectedSlip}
        open={!!selectedSlip}
        onOpenChange={(open) => !open && setSelectedSlip(null)}
      />

    </div>
  );
}
