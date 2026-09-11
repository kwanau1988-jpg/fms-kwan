"use client";

import { useState, useTransition } from "react";
import {
  Plus,
  Coins,
  Lock,
  Unlock,
  Wand2,
  AlertCircle,
} from "lucide-react";
import { toast } from "sonner";
import { useT, useLocale } from "@/shared/lib/i18n/client";
import {
  LiyonCard,
  DataTable,
  StatusPill,
  LiyonDialog,
  LiyonDialogHeader,
  LiyonDialogBody,
  LiyonDialogFooter,
  LiyonField,
  LiyonSelect,
  type DataTableColumn,
} from "@/shared/components/liyon";
import { Button } from "@/components/ui/button";
import type { PayrollPeriodDto } from "@/features/payroll";
import {
  createPayrollPeriodAction,
  togglePublishPeriodAction,
  generateDemoSlipsAction,
  getPayrollPeriodsAction,
} from "@/features/payroll/actions";

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
  initialPeriods: PayrollPeriodDto[];
}

export function PayrollAdminClient({ initialPeriods }: Props) {
  const t = useT();
  const locale = useLocale();
  const [periods, setPeriods] = useState<PayrollPeriodDto[]>(initialPeriods);
  const [isPending, startTransition] = useTransition();

  // Create modal state
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [formYear, setFormYear] = useState(2026);
  const [formMonth, setFormMonth] = useState(9);

  const refreshPeriods = async () => {
    const res = await getPayrollPeriodsAction();
    if (res.ok) {
      setPeriods(res.data);
    }
  };

  const getMonthName = (month: number) => {
    return locale === "th" ? THAI_MONTHS[month] : ENG_MONTHS[month];
  };

  const getDisplayYear = (year: number) => {
    return locale === "th" ? year + 543 : year;
  };

  const handleCreate = () => {
    startTransition(async () => {
      const res = await createPayrollPeriodAction({
        year: Number(formYear),
        month: Number(formMonth),
      });

      if (res.ok) {
        toast.success(t("common.saveSuccess"));
        setCreateModalOpen(false);
        await refreshPeriods();
      } else {
        toast.error(res.error.message ? t(res.error.message as Parameters<typeof t>[0]) : t("common.error"));
      }
    });
  };

  const handleTogglePublish = (period: PayrollPeriodDto) => {
    startTransition(async () => {
      const res = await togglePublishPeriodAction({
        periodId: period.id,
        isPublished: !period.isPublished,
      });

      if (res.ok) {
        toast.success(
          !period.isPublished
            ? t("payroll.published")
            : t("payroll.draft"),
        );
        await refreshPeriods();
      } else {
        toast.error(res.error.message ? t(res.error.message as Parameters<typeof t>[0]) : t("common.error"));
      }
    });
  };

  const handleGenerateSlips = (period: PayrollPeriodDto) => {
    startTransition(async () => {
      const res = await generateDemoSlipsAction({
        periodId: period.id,
      });

      if (res.ok) {
        toast.success(`${t("payroll.generateDemo")} (${res.data.count})`);
        await refreshPeriods();
      } else {
        toast.error(res.error.message ? t(res.error.message as Parameters<typeof t>[0]) : t("common.error"));
      }
    });
  };

  const columns: DataTableColumn<PayrollPeriodDto>[] = [
    {
      key: "period",
      header: t("payroll.period"),
      render: (row) => (
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center font-bold text-xs">
            {row.month}
          </div>
          <div>
            <span className="font-semibold text-foreground text-sm block">
              {getMonthName(row.month)} {getDisplayYear(row.year)}
            </span>
            <span className="text-xs text-muted-foreground">
              (ค.ศ. {row.year} / {row.month})
            </span>
          </div>
        </div>
      ),
    },
    {
      key: "slipsCount",
      header: "จำนวนสลิปที่ออก",
      render: (row) => (
        <span className="font-medium text-xs">
          {row.slipsCount} ฉบับ
        </span>
      ),
    },
    {
      key: "status",
      header: t("payroll.period"),
      render: (row) => (
        <StatusPill tone={row.isPublished ? "ok" : "warn"}>
          {row.isPublished ? t("payroll.published") : t("payroll.draft")}
        </StatusPill>
      ),
    },
    {
      key: "actions",
      header: t("common.actions"),
      className: "nowrap text-right",
      render: (row) => (
        <div className="flex items-center justify-end gap-2">
          <Button
            size="sm"
            variant="outline"
            className="h-8 gap-1 text-xs"
            onClick={() => handleGenerateSlips(row)}
            disabled={isPending}
          >
            <Wand2 className="w-3.5 h-3.5 text-primary" />
            {t("payroll.generateDemo")}
          </Button>
          <Button
            size="sm"
            variant={row.isPublished ? "outline" : "default"}
            className="h-8 gap-1 text-xs"
            onClick={() => handleTogglePublish(row)}
            disabled={isPending}
          >
            {row.isPublished ? (
              <>
                <Lock className="w-3.5 h-3.5" />
                {t("payroll.unpublishBtn")}
              </>
            ) : (
              <>
                <Unlock className="w-3.5 h-3.5" />
                {t("payroll.publishBtn")}
              </>
            )}
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{t("payroll.managePeriods")}</h1>
          <p className="text-sm text-muted-foreground">{t("payroll.subtitle")}</p>
        </div>
        <Button onClick={() => setCreateModalOpen(true)} className="gap-2">
          <Plus className="h-4 w-4" />
          {t("payroll.createPeriod")}
        </Button>
      </div>

      <LiyonCard>
        <DataTable<PayrollPeriodDto>
          headHeading={<span>{t("payroll.managePeriods")}</span>}
          state={periods.length === 0 ? "empty" : "data"}
          rows={periods}
          columns={columns}
          getRowId={(row) => row.id}
          empty={{
            icon: <Coins className="h-10 w-10 text-muted-foreground/50" />,
            title: t("payroll.empty"),
            description: t("payroll.subtitle"),
          }}
          error={{
            icon: <AlertCircle className="h-10 w-10 text-destructive" />,
            title: t("common.error"),
          }}
        />
      </LiyonCard>

      {/* Modal สร้างรอบเงินเดือนใหม่ */}
      <LiyonDialog open={createModalOpen} onOpenChange={setCreateModalOpen}>
        <LiyonDialogHeader
          title={t("payroll.createPeriod")}
          description="กำหนดปีและเดือนสำหรับการจ่ายเงินเดือนบุคลากร"
        />
        <LiyonDialogBody>
          <div className="space-y-4 py-2">
            <LiyonField label={t("payroll.year")}>
              <LiyonSelect
                value={formYear}
                onChange={(e) => setFormYear(Number(e.target.value))}
              >
                <option value={2026}>2569 (2026)</option>
                <option value={2027}>2570 (2027)</option>
                <option value={2025}>2568 (2025)</option>
              </LiyonSelect>
            </LiyonField>

            <LiyonField label={t("payroll.month")}>
              <LiyonSelect
                value={formMonth}
                onChange={(e) => setFormMonth(Number(e.target.value))}
              >
                {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
                  <option key={m} value={m}>
                    {getMonthName(m)} (เดือน {m})
                  </option>
                ))}
              </LiyonSelect>
            </LiyonField>
          </div>
        </LiyonDialogBody>
        <LiyonDialogFooter>
          <Button
            variant="outline"
            onClick={() => setCreateModalOpen(false)}
            disabled={isPending}
          >
            {t("sample.cancel")}
          </Button>
          <Button onClick={handleCreate} disabled={isPending}>
            {t("sample.save")}
          </Button>
        </LiyonDialogFooter>
      </LiyonDialog>
    </div>
  );
}
