"use client";

import { useState, useTransition, useMemo } from "react";
import {
  Plus,
  Coins,
  Lock,
  Unlock,
  Wand2,
  AlertCircle,
  ArrowLeft,
  Search,
  Eye,
  Edit2,
  Trash2,
  KeyRound,
  FileSpreadsheet,
  Copy,
  RefreshCw,
} from "lucide-react";
import { toast } from "sonner";
import { useT, useLocale } from "@/shared/lib/i18n/client";
import { formatThaiBahtText } from "@/shared/lib/format/thai-baht";
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

function FormInput(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className={`w-full px-3 py-2 text-sm rounded-xl border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/20 ${props.className || ""}`}
    />
  );
}

import {
  OfficialPayslipModal,
  type PayrollPeriodDto,
  type PayrollSlipDto,
  type EligiblePersonnelDto,
} from "@/features/payroll";
import {
  createPayrollPeriodAction,
  togglePublishPeriodAction,
  generateDemoSlipsAction,
  getPayrollPeriodsAction,
  getPeriodSlipsAction,
  getEligiblePersonnelAction,
  upsertPayrollSlipAction,
  deletePayrollSlipAction,
  setUserPayrollPasswordAction,
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
  const [selectedPeriod, setSelectedPeriod] = useState<PayrollPeriodDto | null>(null);
  const [slips, setSlips] = useState<PayrollSlipDto[]>([]);
  const [personnelList, setPersonnelList] = useState<EligiblePersonnelDto[]>([]);
  const [isPending, startTransition] = useTransition();

  // Filter & search
  const [searchQuery, setSearchQuery] = useState("");

  // Create period modal
  const [createPeriodModalOpen, setCreatePeriodModalOpen] = useState(false);
  const [formYear, setFormYear] = useState(2026);
  const [formMonth, setFormMonth] = useState(9);

  // Add / Edit Slip modal
  const [slipModalOpen, setSlipModalOpen] = useState(false);
  const [editingSlip, setEditingSlip] = useState<PayrollSlipDto | null>(null);
  const [selectedUserId, setSelectedUserId] = useState("");
  const [baseSalary, setBaseSalary] = useState(35000);
  const [academicAllowance, setAcademicAllowance] = useState(0);
  const [positionAllowance, setPositionAllowance] = useState(0);
  const [specialAllowance, setSpecialAllowance] = useState(0);
  const [taxWithholding, setTaxWithholding] = useState(0);
  const [socialSecurity, setSocialSecurity] = useState(750);
  const [providentFund, setProvidentFund] = useState(0);
  const [cooperatives, setCooperatives] = useState(0);
  const [bankAccountMasked, setBankAccountMasked] = useState("xxx-x-xx1234-0");
  const [setLoginPasswordChecked, setSetLoginPasswordChecked] = useState(false);
  const [loginPassword, setLoginPassword] = useState("");

  // Delete Slip dialog
  const [deleteConfirmSlip, setDeleteConfirmSlip] = useState<PayrollSlipDto | null>(null);

  // Set Password modal
  const [passwordModalOpen, setPasswordModalOpen] = useState(false);
  const [passwordTargetUser, setPasswordTargetUser] = useState<{ userId: string; name: string; email: string } | null>(null);
  const [directPasswordInput, setDirectPasswordInput] = useState("");

  // Official Payslip preview modal
  const [officialSlipPreview, setOfficialSlipPreview] = useState<PayrollSlipDto | null>(null);

  const getMonthName = (month: number) => {
    return locale === "th" ? THAI_MONTHS[month] : ENG_MONTHS[month];
  };

  const getDisplayYear = (year: number) => {
    return locale === "th" ? year + 543 : year;
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat(locale === "th" ? "th-TH" : "en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  const refreshPeriods = async () => {
    const res = await getPayrollPeriodsAction();
    if (res.ok) setPeriods(res.data);
  };

  const loadPeriodSlips = async (period: PayrollPeriodDto) => {
    const res = await getPeriodSlipsAction(period.id);
    if (res.ok) {
      setSlips(res.data);
    }
  };

  const loadPersonnel = async () => {
    const res = await getEligiblePersonnelAction();
    if (res.ok) {
      setPersonnelList(res.data);
    }
  };

  const handleSelectPeriod = async (period: PayrollPeriodDto) => {
    setSelectedPeriod(period);
    setSearchQuery("");
    await Promise.all([loadPeriodSlips(period), loadPersonnel()]);
  };

  const handleBackToPeriods = async () => {
    setSelectedPeriod(null);
    await refreshPeriods();
  };

  const handleCreatePeriod = () => {
    startTransition(async () => {
      const res = await createPayrollPeriodAction({
        year: Number(formYear),
        month: Number(formMonth),
      });

      if (res.ok) {
        toast.success(t("common.saveSuccess"));
        setCreatePeriodModalOpen(false);
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
        if (selectedPeriod?.id === period.id) {
          setSelectedPeriod({ ...selectedPeriod, isPublished: !period.isPublished });
        }
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
        if (selectedPeriod?.id === period.id) {
          await loadPeriodSlips(period);
        }
      } else {
        toast.error(res.error.message ? t(res.error.message as Parameters<typeof t>[0]) : t("common.error"));
      }
    });
  };

  // Open modal to add new slip
  const handleOpenAddSlip = async () => {
    setEditingSlip(null);
    if (personnelList.length === 0) {
      await loadPersonnel();
    }
    const defaultUser = personnelList[0]?.userId || "";
    setSelectedUserId(defaultUser);
    setBaseSalary(35000);
    setAcademicAllowance(5600);
    setPositionAllowance(0);
    setSpecialAllowance(2000);
    setTaxWithholding(2000);
    setSocialSecurity(750);
    setProvidentFund(1400);
    setCooperatives(1000);
    setBankAccountMasked("xxx-x-xx" + Math.floor(1000 + Math.random() * 9000) + "-0");
    setSetLoginPasswordChecked(false);
    setLoginPassword("");
    setSlipModalOpen(true);
  };

  // Open modal to edit existing slip
  const handleOpenEditSlip = (slip: PayrollSlipDto) => {
    setEditingSlip(slip);
    setSelectedUserId(slip.userId);
    const b = slip.breakdown;
    setBaseSalary(b?.baseSalary || 0);
    setAcademicAllowance(b?.academicAllowance || 0);
    setPositionAllowance(b?.positionAllowance || 0);
    setSpecialAllowance(b?.specialAllowance || 0);
    setTaxWithholding(b?.taxWithholding || 0);
    setSocialSecurity(b?.socialSecurity || 750);
    setProvidentFund(b?.providentFund || 0);
    setCooperatives(b?.cooperatives || 0);
    setBankAccountMasked(slip.bankAccountMasked || "");
    setSetLoginPasswordChecked(false);
    setLoginPassword("");
    setSlipModalOpen(true);
  };

  // Live calculations for Add/Edit form
  const computedGross = baseSalary + academicAllowance + positionAllowance + specialAllowance;
  const computedDeductions = taxWithholding + socialSecurity + providentFund + cooperatives;
  const computedNet = computedGross - computedDeductions;
  const computedThaiBaht = formatThaiBahtText(computedNet);

  const handleSaveSlip = () => {
    if (!selectedPeriod) return;
    if (!selectedUserId) {
      toast.error(t("payroll.selectPersonnel"));
      return;
    }
    if (setLoginPasswordChecked && loginPassword.trim().length < 8) {
      toast.error(t("payroll.passwordHint"));
      return;
    }

    startTransition(async () => {
      const res = await upsertPayrollSlipAction({
        periodId: selectedPeriod.id,
        userId: selectedUserId,
        baseSalary,
        academicAllowance,
        positionAllowance,
        specialAllowance,
        taxWithholding,
        socialSecurity,
        providentFund,
        cooperatives,
        bankAccountMasked: bankAccountMasked.trim() || null,
        loginPassword: setLoginPasswordChecked && loginPassword.trim() ? loginPassword.trim() : null,
      });

      if (res.ok) {
        toast.success(t("payroll.saveSlipSuccess"));
        setSlipModalOpen(false);
        await loadPeriodSlips(selectedPeriod);
        await refreshPeriods();
      } else {
        toast.error(res.error.message ? t(res.error.message as Parameters<typeof t>[0]) : t("common.error"));
      }
    });
  };

  const handleDeleteSlip = () => {
    if (!deleteConfirmSlip || !selectedPeriod) return;
    startTransition(async () => {
      const res = await deletePayrollSlipAction(deleteConfirmSlip.id);
      if (res.ok) {
        toast.success(t("payroll.deleteSlipSuccess"));
        setDeleteConfirmSlip(null);
        await loadPeriodSlips(selectedPeriod);
        await refreshPeriods();
      } else {
        toast.error(res.error.message ? t(res.error.message as Parameters<typeof t>[0]) : t("common.error"));
      }
    });
  };

  // Open set password modal
  const handleOpenSetPassword = (user: { userId: string; name: string; email: string }) => {
    setPasswordTargetUser(user);
    setDirectPasswordInput("Pass" + Math.floor(100000 + Math.random() * 900000) + "!");
    setPasswordModalOpen(true);
  };

  const handleSaveDirectPassword = () => {
    if (!passwordTargetUser) return;
    if (directPasswordInput.trim().length < 8) {
      toast.error(t("payroll.passwordHint"));
      return;
    }

    startTransition(async () => {
      const res = await setUserPayrollPasswordAction({
        userId: passwordTargetUser.userId,
        password: directPasswordInput.trim(),
      });

      if (res.ok) {
        toast.success(t("payroll.setPasswordSuccess"));
        setPasswordModalOpen(false);
        if (selectedPeriod) await loadPeriodSlips(selectedPeriod);
      } else {
        toast.error(res.error.message ? t(res.error.message as Parameters<typeof t>[0]) : t("common.error"));
      }
    });
  };

  const handleCopyPassword = () => {
    navigator.clipboard.writeText(directPasswordInput);
    toast.success(locale === "th" ? "คัดลอกรหัสผ่านแล้ว" : "Password copied to clipboard");
  };

  const handleGenerateRandomPassword = () => {
    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789!@#$%";
    let pwd = "Pass";
    for (let i = 0; i < 6; i++) {
      pwd += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    pwd += "!";
    setDirectPasswordInput(pwd);
  };

  // Filtered slips for table
  const filteredSlips = useMemo(() => {
    if (!searchQuery.trim()) return slips;
    const q = searchQuery.toLowerCase();
    return slips.filter(
      (s) =>
        s.userName.toLowerCase().includes(q) ||
        s.userEmail.toLowerCase().includes(q) ||
        (s.positionTh && s.positionTh.toLowerCase().includes(q)) ||
        (s.departmentTh && s.departmentTh.toLowerCase().includes(q)),
    );
  }, [slips, searchQuery]);

  // Statistics for selected period
  const totalGrossPayout = useMemo(() => {
    return slips.reduce((sum, s) => sum + (s.breakdown?.grossIncome || s.netPayable), 0);
  }, [slips]);

  const totalDeductionsPayout = useMemo(() => {
    return slips.reduce((sum, s) => sum + (s.breakdown?.totalDeductions || 0), 0);
  }, [slips]);

  const totalNetPayout = useMemo(() => {
    return slips.reduce((sum, s) => sum + s.netPayable, 0);
  }, [slips]);

  // ----------------------------------------------------
  // Columns for Periods List View
  // ----------------------------------------------------
  const periodColumns: DataTableColumn<PayrollPeriodDto>[] = [
    {
      key: "period",
      header: t("payroll.period"),
      render: (row) => (
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold text-sm">
            {row.month}
          </div>
          <div>
            <button
              onClick={() => handleSelectPeriod(row)}
              className="font-semibold text-foreground text-sm hover:underline text-left block"
            >
              {getMonthName(row.month)} {getDisplayYear(row.year)}
            </button>
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
        <span className="font-semibold text-xs px-2.5 py-1 rounded-full bg-muted">
          {row.slipsCount} ฉบับ
        </span>
      ),
    },
    {
      key: "status",
      header: "สถานะการเผยแพร่",
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
        <div className="flex items-center justify-end gap-1.5">
          <Button
            size="sm"
            variant="default"
            className="h-8 gap-1 text-xs"
            onClick={() => handleSelectPeriod(row)}
          >
            <FileSpreadsheet className="w-3.5 h-3.5" />
            {t("payroll.manageSlips")}
          </Button>
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
            variant={row.isPublished ? "outline" : "secondary"}
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

  // ----------------------------------------------------
  // Columns for Slips in Period Drilldown View
  // ----------------------------------------------------
  const slipColumns: DataTableColumn<PayrollSlipDto>[] = [
    {
      key: "personnel",
      header: t("payroll.personnelName"),
      render: (row) => (
        <div>
          <span className="font-semibold text-sm text-foreground block">
            {row.academicTitle ? `${row.academicTitle} ` : ""}{row.userName}
          </span>
          <span className="text-xs text-muted-foreground block">{row.userEmail}</span>
        </div>
      ),
    },
    {
      key: "dept",
      header: t("payroll.departmentPosition"),
      render: (row) => (
        <div className="text-xs">
          <span className="font-medium text-foreground block">{row.positionTh || "บุคลากร"}</span>
          <span className="text-muted-foreground">{row.departmentTh || "คณะวิทยาการจัดการ"}</span>
        </div>
      ),
    },
    {
      key: "gross",
      header: t("payroll.totalGross"),
      className: "nowrap text-right font-mono text-xs",
      render: (row) => (
        <span>฿{formatCurrency(row.breakdown?.grossIncome || row.netPayable)}</span>
      ),
    },
    {
      key: "deductions",
      header: t("payroll.totalDeductions"),
      className: "nowrap text-right font-mono text-xs text-rose-600 dark:text-rose-400",
      render: (row) => (
        <span>-฿{formatCurrency(row.breakdown?.totalDeductions || 0)}</span>
      ),
    },
    {
      key: "netPayable",
      header: t("payroll.netPayable"),
      className: "nowrap text-right font-mono font-bold",
      render: (row) => (
        <span className="text-emerald-700 dark:text-emerald-400 text-sm">
          ฿{formatCurrency(row.netPayable)}
        </span>
      ),
    },
    {
      key: "bankAccount",
      header: t("payroll.bankAccount"),
      className: "text-xs font-mono",
      render: (row) => row.bankAccountMasked || "—",
    },
    {
      key: "credentials",
      header: t("payroll.loginCredentials"),
      className: "nowrap",
      render: (row) => (
        <Button
          size="sm"
          variant="outline"
          className="h-7 text-xs gap-1 px-2 text-primary border-primary/30 hover:bg-primary/10"
          onClick={() => handleOpenSetPassword({ userId: row.userId, name: row.userName, email: row.userEmail })}
        >
          <KeyRound className="w-3 h-3" />
          {t("payroll.setPassword")}
        </Button>
      ),
    },
    {
      key: "actions",
      header: t("common.actions"),
      className: "nowrap text-right",
      render: (row) => (
        <div className="flex items-center justify-end gap-1">
          <Button
            size="sm"
            variant="outline"
            className="h-8 gap-1 text-xs"
            title={t("payroll.printOfficial")}
            onClick={() => setOfficialSlipPreview(row)}
          >
            <Eye className="w-3.5 h-3.5" />
            สลิปทางการ
          </Button>
          <Button
            size="sm"
            variant="ghost"
            className="h-8 w-8 p-0"
            title={t("payroll.editSlip")}
            onClick={() => handleOpenEditSlip(row)}
          >
            <Edit2 className="w-3.5 h-3.5 text-muted-foreground" />
          </Button>
          <Button
            size="sm"
            variant="ghost"
            className="h-8 w-8 p-0 hover:text-destructive"
            title={t("payroll.deleteSlip")}
            onClick={() => setDeleteConfirmSlip(row)}
          >
            <Trash2 className="w-3.5 h-3.5" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* ---------------------------------------------------- */}
      {/* VIEW 1: PERIOD LIST VIEW */}
      {/* ---------------------------------------------------- */}
      {!selectedPeriod && (
        <>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold tracking-tight">{t("payroll.managePeriods")}</h1>
              <p className="text-sm text-muted-foreground">{t("payroll.subtitle")}</p>
            </div>
            <Button onClick={() => setCreatePeriodModalOpen(true)} className="gap-2">
              <Plus className="h-4 w-4" />
              {t("payroll.createPeriod")}
            </Button>
          </div>

          <LiyonCard>
            <DataTable<PayrollPeriodDto>
              headHeading={<span>{t("payroll.managePeriods")}</span>}
              state={periods.length === 0 ? "empty" : "data"}
              rows={periods}
              columns={periodColumns}
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
        </>
      )}

      {/* ---------------------------------------------------- */}
      {/* VIEW 2: PERIOD SLIPS DRILLDOWN VIEW */}
      {/* ---------------------------------------------------- */}
      {selectedPeriod && (
        <div className="space-y-6">
          {/* Top navigation & action bar */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                size="sm"
                className="gap-1 text-xs"
                onClick={handleBackToPeriods}
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                {t("payroll.backToPeriods")}
              </Button>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-xl font-bold tracking-tight text-foreground">
                    รอบเดือน {getMonthName(selectedPeriod.month)} {getDisplayYear(selectedPeriod.year)}
                  </h1>
                  <StatusPill tone={selectedPeriod.isPublished ? "ok" : "warn"}>
                    {selectedPeriod.isPublished ? t("payroll.published") : t("payroll.draft")}
                  </StatusPill>
                </div>
                <p className="text-xs text-muted-foreground">
                  จัดการสลิปเงินเดือนรายบุคคล กำหนดรหัสผ่านเข้าระบบ และพิมพ์สลิปทางการ
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <Button
                size="sm"
                variant="outline"
                className="gap-1.5 text-xs"
                onClick={() => handleGenerateSlips(selectedPeriod)}
                disabled={isPending}
              >
                <Wand2 className="w-3.5 h-3.5 text-primary" />
                {t("payroll.generateDemo")}
              </Button>
              <Button
                size="sm"
                variant={selectedPeriod.isPublished ? "outline" : "secondary"}
                className="gap-1.5 text-xs"
                onClick={() => handleTogglePublish(selectedPeriod)}
                disabled={isPending}
              >
                {selectedPeriod.isPublished ? (
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
              <Button
                size="sm"
                onClick={handleOpenAddSlip}
                className="gap-1.5 text-xs"
              >
                <Plus className="w-4 h-4" />
                {t("payroll.addSlip")}
              </Button>
            </div>
          </div>

          {/* Period Statistics Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-4 rounded-xl border bg-card shadow-sm">
              <span className="text-xs text-muted-foreground block">{t("payroll.totalSlipsCount")}</span>
              <span className="text-2xl font-bold font-mono text-foreground mt-1 block">
                {slips.length} ฉบับ
              </span>
            </div>
            <div className="p-4 rounded-xl border bg-card shadow-sm">
              <span className="text-xs text-muted-foreground block">{t("payroll.totalGross")}</span>
              <span className="text-2xl font-bold font-mono text-foreground mt-1 block">
                ฿{formatCurrency(totalGrossPayout)}
              </span>
            </div>
            <div className="p-4 rounded-xl border bg-card shadow-sm">
              <span className="text-xs text-muted-foreground block">{t("payroll.totalDeductions")}</span>
              <span className="text-2xl font-bold font-mono text-rose-600 dark:text-rose-400 mt-1 block">
                -฿{formatCurrency(totalDeductionsPayout)}
              </span>
            </div>
            <div className="p-4 rounded-xl border bg-emerald-500/10 border-emerald-500/30 shadow-sm">
              <span className="text-xs font-semibold text-emerald-800 dark:text-emerald-300 block">
                {t("payroll.totalNetPayout")}
              </span>
              <span className="text-2xl font-extrabold font-mono text-emerald-700 dark:text-emerald-400 mt-1 block">
                ฿{formatCurrency(totalNetPayout)}
              </span>
            </div>
          </div>

          {/* Search bar */}
          <div className="flex items-center gap-3">
            <div className="relative flex-1 max-w-sm">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                placeholder="ค้นหาชื่อบุคลากร อีเมล หรือตำแหน่ง..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border bg-card focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>
          </div>

          {/* Slips DataTable */}
          <LiyonCard>
            <DataTable<PayrollSlipDto>
              headHeading={
                <span>
                  {t("payroll.slipsInPeriod")} ({filteredSlips.length})
                </span>
              }
              state={filteredSlips.length === 0 ? "empty" : "data"}
              rows={filteredSlips}
              columns={slipColumns}
              getRowId={(row) => row.id}
              empty={{
                icon: <FileSpreadsheet className="h-10 w-10 text-muted-foreground/50" />,
                title: t("payroll.empty"),
                description: "ยังไม่มีข้อมูลสลิปเงินเดือนในรอบนี้ กด '+ เพิ่มสลิปรายบุคคล' หรือ 'จำลองสลิปบุคลากร' เพื่อเริ่มต้น",
              }}
              error={{
                icon: <AlertCircle className="h-10 w-10 text-destructive" />,
                title: t("common.error"),
              }}
            />
          </LiyonCard>
        </div>
      )}

      {/* ---------------------------------------------------- */}
      {/* MODAL 1: CREATE PERIOD */}
      {/* ---------------------------------------------------- */}
      <LiyonDialog open={createPeriodModalOpen} onOpenChange={setCreatePeriodModalOpen}>
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
            onClick={() => setCreatePeriodModalOpen(false)}
            disabled={isPending}
          >
            {t("sample.cancel")}
          </Button>
          <Button onClick={handleCreatePeriod} disabled={isPending}>
            {t("sample.save")}
          </Button>
        </LiyonDialogFooter>
      </LiyonDialog>

      {/* ---------------------------------------------------- */}
      {/* MODAL 2: ADD / EDIT INDIVIDUAL SLIP */}
      {/* ---------------------------------------------------- */}
      <LiyonDialog open={slipModalOpen} onOpenChange={setSlipModalOpen} wide>
        <LiyonDialogHeader
          title={editingSlip ? t("payroll.editSlip") : t("payroll.addSlip")}
          description={
            selectedPeriod
              ? `ประจำรอบเดือน ${getMonthName(selectedPeriod.month)} ${getDisplayYear(selectedPeriod.year)}`
              : ""
          }
        />
        <LiyonDialogBody>
          <div className="space-y-6 py-2">
            {/* Personnel selection */}
            <div className="p-4 rounded-xl border bg-muted/40 space-y-3">
              <LiyonField label={t("payroll.selectPersonnel")}>
                {editingSlip ? (
                  <div className="p-3 bg-card rounded-lg border text-sm font-semibold">
                    {editingSlip.userName} ({editingSlip.userEmail})
                  </div>
                ) : (
                  <LiyonSelect
                    value={selectedUserId}
                    onChange={(e) => setSelectedUserId(e.target.value)}
                  >
                    {personnelList.map((p) => (
                      <option key={p.userId} value={p.userId}>
                        {p.academicTitle ? `${p.academicTitle} ` : ""}{p.name} ({p.positionTh || "บุคลากร"}) — {p.email}
                      </option>
                    ))}
                  </LiyonSelect>
                )}
              </LiyonField>
            </div>

            {/* Income and Deductions 2-Column Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* Earnings Form */}
              <div className="p-4 rounded-xl border border-emerald-500/20 bg-emerald-500/5 space-y-3">
                <h4 className="font-bold text-sm text-emerald-900 dark:text-emerald-300 pb-1 border-b border-emerald-500/20">
                  {t("payroll.earnings")}
                </h4>
                <LiyonField label={t("payroll.baseSalary")}>
                  <FormInput
                    type="number"
                    value={baseSalary}
                    onChange={(e) => setBaseSalary(Number(e.target.value))}
                  />
                </LiyonField>
                <LiyonField label={t("payroll.academicAllowance")}>
                  <FormInput
                    type="number"
                    value={academicAllowance}
                    onChange={(e) => setAcademicAllowance(Number(e.target.value))}
                  />
                </LiyonField>
                <LiyonField label={t("payroll.positionAllowance")}>
                  <FormInput
                    type="number"
                    value={positionAllowance}
                    onChange={(e) => setPositionAllowance(Number(e.target.value))}
                  />
                </LiyonField>
                <LiyonField label={t("payroll.specialAllowance")}>
                  <FormInput
                    type="number"
                    value={specialAllowance}
                    onChange={(e) => setSpecialAllowance(Number(e.target.value))}
                  />
                </LiyonField>
                <div className="pt-2 border-t border-emerald-500/30 flex justify-between font-bold text-sm text-emerald-950 dark:text-emerald-200">
                  <span>{t("payroll.totalGross")}</span>
                  <span className="font-mono">฿{formatCurrency(computedGross)}</span>
                </div>
              </div>

              {/* Deductions Form */}
              <div className="p-4 rounded-xl border border-rose-500/20 bg-rose-500/5 space-y-3">
                <h4 className="font-bold text-sm text-rose-900 dark:text-rose-300 pb-1 border-b border-rose-500/20">
                  {t("payroll.deductions")}
                </h4>
                <LiyonField label={t("payroll.tax")}>
                  <FormInput
                    type="number"
                    value={taxWithholding}
                    onChange={(e) => setTaxWithholding(Number(e.target.value))}
                  />
                </LiyonField>
                <LiyonField label={t("payroll.socialSecurity")}>
                  <FormInput
                    type="number"
                    value={socialSecurity}
                    onChange={(e) => setSocialSecurity(Number(e.target.value))}
                  />
                </LiyonField>
                <LiyonField label={t("payroll.providentFund")}>
                  <FormInput
                    type="number"
                    value={providentFund}
                    onChange={(e) => setProvidentFund(Number(e.target.value))}
                  />
                </LiyonField>
                <LiyonField label={t("payroll.cooperative")}>
                  <FormInput
                    type="number"
                    value={cooperatives}
                    onChange={(e) => setCooperatives(Number(e.target.value))}
                  />
                </LiyonField>
                <div className="pt-2 border-t border-rose-500/30 flex justify-between font-bold text-sm text-rose-950 dark:text-rose-200">
                  <span>{t("payroll.totalDeductions")}</span>
                  <span className="font-mono">฿{formatCurrency(computedDeductions)}</span>
                </div>
              </div>
            </div>

            {/* Bank Account & Live Net Summary */}
            <div className="p-4 rounded-xl border bg-card space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <LiyonField label={t("payroll.bankAccount")}>
                  <FormInput
                    type="text"
                    placeholder="xxx-x-xx1234-0"
                    value={bankAccountMasked}
                    onChange={(e) => setBankAccountMasked(e.target.value)}
                  />
                </LiyonField>
                <div className="p-3 bg-primary/10 rounded-xl border border-primary/20 flex flex-col justify-center">
                  <span className="text-xs text-muted-foreground font-semibold uppercase">{t("payroll.netTotal")}</span>
                  <span className="text-2xl font-black font-mono text-primary">
                    ฿{formatCurrency(computedNet)}
                  </span>
                  <span className="text-[11px] text-muted-foreground mt-0.5">
                    {computedThaiBaht}
                  </span>
                </div>
              </div>
            </div>

            {/* Set System Password Section */}
            <div className="p-4 rounded-xl border border-primary/20 bg-primary/5 space-y-3">
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="setLoginPasswordCheck"
                  checked={setLoginPasswordChecked}
                  onChange={(e) => setSetLoginPasswordChecked(e.target.checked)}
                  className="rounded border-gray-300 text-primary focus:ring-primary w-4 h-4 cursor-pointer"
                />
                <label htmlFor="setLoginPasswordCheck" className="text-sm font-semibold cursor-pointer select-none">
                  {t("payroll.setPassword")} สำหรับบุคลากรท่านนี้ (กำหนดรหัสผ่านเข้าดูสลิป)
                </label>
              </div>

              {setLoginPasswordChecked && (
                <div className="pt-2 space-y-2">
                  <div className="flex items-center gap-2">
                    <FormInput
                      type="text"
                      placeholder="รหัสผ่านใหม่ (อย่างน้อย 8 ตัวอักษร)"
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      className="font-mono text-xs flex-1"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        const pwd = "Pass" + Math.floor(100000 + Math.random() * 900000) + "!";
                        setLoginPassword(pwd);
                      }}
                      className="text-xs shrink-0"
                    >
                      <RefreshCw className="w-3.5 h-3.5 mr-1" />
                      สุ่มรหัส
                    </Button>
                  </div>
                  <p className="text-[11px] text-muted-foreground">
                    {t("payroll.passwordHint")}
                  </p>
                </div>
              )}
            </div>
          </div>
        </LiyonDialogBody>
        <LiyonDialogFooter>
          <Button
            variant="outline"
            onClick={() => setSlipModalOpen(false)}
            disabled={isPending}
          >
            {t("sample.cancel")}
          </Button>
          <Button onClick={handleSaveSlip} disabled={isPending}>
            {t("sample.save")}
          </Button>
        </LiyonDialogFooter>
      </LiyonDialog>

      {/* ---------------------------------------------------- */}
      {/* MODAL 3: DIRECT SET LOGIN PASSWORD MODAL */}
      {/* ---------------------------------------------------- */}
      <LiyonDialog open={passwordModalOpen} onOpenChange={setPasswordModalOpen}>
        <LiyonDialogHeader
          title={t("payroll.setPassword")}
          description={`กำหนดรหัสผ่านเข้าสู่ระบบสำหรับบุคลากร: ${passwordTargetUser?.name || ""}`}
        />
        <LiyonDialogBody>
          <div className="space-y-4 py-2">
            <div className="p-3 bg-muted/40 rounded-xl border text-xs">
              <span className="text-muted-foreground block">อีเมลสำหรับเข้าสู่ระบบ</span>
              <span className="font-mono font-semibold text-foreground text-sm">{passwordTargetUser?.email}</span>
            </div>

            <LiyonField label={t("payroll.newPassword")}>
              <div className="flex items-center gap-2">
                <FormInput
                  type="text"
                  value={directPasswordInput}
                  onChange={(e) => setDirectPasswordInput(e.target.value)}
                  className="font-mono text-sm flex-1"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleGenerateRandomPassword}
                  title="สุ่มรหัสผ่านใหม่"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleCopyPassword}
                  title="คัดลอกรหัสผ่าน"
                >
                  <Copy className="w-3.5 h-3.5" />
                </Button>
              </div>
            </LiyonField>
            <p className="text-xs text-muted-foreground">
              {t("payroll.passwordHint")}
            </p>
          </div>
        </LiyonDialogBody>
        <LiyonDialogFooter>
          <Button
            variant="outline"
            onClick={() => setPasswordModalOpen(false)}
            disabled={isPending}
          >
            {t("sample.cancel")}
          </Button>
          <Button onClick={handleSaveDirectPassword} disabled={isPending}>
            {t("sample.save")}
          </Button>
        </LiyonDialogFooter>
      </LiyonDialog>

      {/* ---------------------------------------------------- */}
      {/* MODAL 4: DELETE SLIP CONFIRMATION */}
      {/* ---------------------------------------------------- */}
      <LiyonDialog
        open={!!deleteConfirmSlip}
        onOpenChange={(open) => !open && setDeleteConfirmSlip(null)}
      >
        <LiyonDialogHeader
          title={t("payroll.deleteSlip")}
          description={t("payroll.deleteConfirm")}
        />
        <LiyonDialogBody>
          {deleteConfirmSlip && (
            <div className="p-4 bg-destructive/10 text-destructive rounded-xl border border-destructive/20 text-xs space-y-1">
              <p className="font-semibold text-sm">
                {deleteConfirmSlip.userName}
              </p>
              <p>
                ยอดสุทธิ: ฿{formatCurrency(deleteConfirmSlip.netPayable)}
              </p>
            </div>
          )}
        </LiyonDialogBody>
        <LiyonDialogFooter>
          <Button
            variant="outline"
            onClick={() => setDeleteConfirmSlip(null)}
            disabled={isPending}
          >
            {t("sample.cancel")}
          </Button>
          <Button
            variant="destructive"
            onClick={handleDeleteSlip}
            disabled={isPending}
          >
            {t("payroll.deleteSlip")}
          </Button>
        </LiyonDialogFooter>
      </LiyonDialog>

      {/* ---------------------------------------------------- */}
      {/* MODAL 5: OFFICIAL PAYSLIP VIEW & PRINT */}
      {/* ---------------------------------------------------- */}
      <OfficialPayslipModal
        slip={officialSlipPreview}
        open={!!officialSlipPreview}
        onOpenChange={(open) => !open && setOfficialSlipPreview(null)}
      />
    </div>
  );
}
