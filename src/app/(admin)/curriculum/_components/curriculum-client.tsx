"use client";

import { useState, useTransition } from "react";
import {
  Plus,
  Edit2,
  Trash2,
  GraduationCap,
  Building2,
  AlertCircle,
  Search,
  Phone,
  Layers,
  MapPin,
  UserCheck,
} from "lucide-react";
import { toast } from "sonner";
import { useT, useLocale } from "@/shared/lib/i18n/client";
import { Button } from "@/components/ui/button";
import type { CurriculumDto, DepartmentDto } from "@/features/curriculum";
import {
  createCurriculumAction,
  updateCurriculumAction,
  deleteCurriculumAction,
  getCurriculaAction,
  createDepartmentAction,
  updateDepartmentAction,
  deleteDepartmentAction,
  getDepartmentsAction,
} from "@/features/curriculum/actions";

interface Props {
  initialItems: CurriculumDto[];
  initialDepartments: DepartmentDto[];
  canManage: boolean;
  canManageDepartments?: boolean;
  initialTab?: "curricula" | "departments";
}

export function CurriculumClient({
  initialItems,
  initialDepartments,
  canManage,
  canManageDepartments = true,
  initialTab = "curricula",
}: Props) {
  const t = useT();
  const locale = useLocale();
  const isTh = locale === "th";

  // Tab state
  const [activeTab, setActiveTab] = useState<"curricula" | "departments">(initialTab);
  const [prevInitialTab, setPrevInitialTab] = useState(initialTab);
  if (prevInitialTab !== initialTab) {
    setPrevInitialTab(initialTab);
    setActiveTab(initialTab);
  }
  const [items, setItems] = useState<CurriculumDto[]>(initialItems);
  const [departments, setDepartments] = useState<DepartmentDto[]>(initialDepartments);
  const [isPending, startTransition] = useTransition();

  // ----------------------------------------------------
  // Curriculum States
  // ----------------------------------------------------
  const [curriculumSearch, setCurriculumSearch] = useState("");
  const [selectedDeptFilter, setSelectedDeptFilter] = useState("ALL");
  const [selectedLevelFilter, setSelectedLevelFilter] = useState("ALL");

  const [currModalOpen, setCurrModalOpen] = useState(false);
  const [editingCurr, setEditingCurr] = useState<CurriculumDto | null>(null);
  const [deleteConfirmCurr, setDeleteConfirmCurr] = useState<CurriculumDto | null>(null);

  // Curriculum Form
  const [currDeptId, setCurrDeptId] = useState<string>("");
  const [code, setCode] = useState("");
  const [nameTh, setNameTh] = useState("");
  const [nameEn, setNameEn] = useState("");
  const [degreeTh, setDegreeTh] = useState("");
  const [degreeEn, setDegreeEn] = useState("");
  const [degreeLevel, setDegreeLevel] = useState<"BACHELOR" | "MASTER" | "DOCTORAL" | "SHORT_COURSE">("BACHELOR");
  const [totalCredits, setTotalCredits] = useState(128);
  const [tuitionFee, setTuitionFee] = useState<number | "">("");
  const [brochurePdfUrl, setBrochurePdfUrl] = useState("");
  const [status, setStatus] = useState<"OPEN" | "UPDATING" | "CLOSED">("OPEN");

  // ----------------------------------------------------
  // Department States
  // ----------------------------------------------------
  const [deptSearch, setDeptSearch] = useState("");
  const [deptModalOpen, setDeptModalOpen] = useState(false);
  const [editingDept, setEditingDept] = useState<DepartmentDto | null>(null);
  const [deleteConfirmDept, setDeleteConfirmDept] = useState<DepartmentDto | null>(null);

  // Department Form
  const [deptCode, setDeptCode] = useState("");
  const [deptNameTh, setDeptNameTh] = useState("");
  const [deptNameEn, setDeptNameEn] = useState("");
  const [deptDescription, setDeptDescription] = useState("");
  const [deptHeadName, setDeptHeadName] = useState("");
  const [deptEmail, setDeptEmail] = useState("");
  const [deptPhone, setDeptPhone] = useState("");
  const [deptOfficeRoom, setDeptOfficeRoom] = useState("");
  const [deptDisplayOrder, setDeptDisplayOrder] = useState(0);
  const [deptIsActive, setDeptIsActive] = useState(true);

  // Refresh helpers
  const refreshCurricula = async () => {
    const res = await getCurriculaAction();
    if (res.ok) setItems(res.data);
  };

  const refreshDepartments = async () => {
    const res = await getDepartmentsAction(true);
    if (res.ok) setDepartments(res.data);
  };

  // ----------------------------------------------------
  // Curriculum Handlers
  // ----------------------------------------------------
  const openCreateCurrDialog = () => {
    setEditingCurr(null);
    setCurrDeptId("");
    setCode("");
    setNameTh("");
    setNameEn("");
    setDegreeTh("");
    setDegreeEn("");
    setDegreeLevel("BACHELOR");
    setTotalCredits(128);
    setTuitionFee("");
    setBrochurePdfUrl("");
    setStatus("OPEN");
    setCurrModalOpen(true);
  };

  const openEditCurrDialog = (item: CurriculumDto) => {
    setEditingCurr(item);
    setCurrDeptId(item.departmentId || "");
    setCode(item.code);
    setNameTh(item.nameTh);
    setNameEn(item.nameEn);
    setDegreeTh(item.degreeTh);
    setDegreeEn(item.degreeEn);
    setDegreeLevel(item.degreeLevel as "BACHELOR" | "MASTER" | "DOCTORAL" | "SHORT_COURSE");
    setTotalCredits(item.totalCredits);
    setTuitionFee(item.tuitionFee ?? "");
    setBrochurePdfUrl(item.brochurePdfUrl || "");
    setStatus(item.status as "OPEN" | "CLOSED" | "UPDATING");
    setCurrModalOpen(true);
  };

  const handleSaveCurriculum = () => {
    if (!code.trim() || !nameTh.trim() || !degreeTh.trim()) {
      toast.error(isTh ? "กรุณากรอกรหัสและชื่อหลักสูตร" : "Please fill in Program Code and Title");
      return;
    }

    startTransition(async () => {
      if (editingCurr) {
        const res = await updateCurriculumAction({
          id: editingCurr.id,
          departmentId: currDeptId ? currDeptId : null,
          code,
          nameTh,
          nameEn,
          degreeTh,
          degreeEn,
          degreeLevel,
          totalCredits,
          tuitionFee: tuitionFee === "" ? undefined : Number(tuitionFee),
          brochurePdfUrl: brochurePdfUrl.trim() || undefined,
          status,
        });
        if (res.ok) {
          toast.success(t("curriculum.updateSuccess"));
          setCurrModalOpen(false);
          await refreshCurricula();
          await refreshDepartments();
        } else {
          toast.error(t("common.error"));
        }
      } else {
        const res = await createCurriculumAction({
          departmentId: currDeptId ? currDeptId : null,
          code,
          nameTh,
          nameEn,
          degreeTh,
          degreeEn,
          degreeLevel,
          totalCredits,
          tuitionFee: tuitionFee === "" ? undefined : Number(tuitionFee),
          brochurePdfUrl: brochurePdfUrl.trim() || undefined,
          status,
        });
        if (res.ok) {
          toast.success(t("curriculum.createSuccess"));
          setCurrModalOpen(false);
          await refreshCurricula();
          await refreshDepartments();
        } else {
          toast.error(t("common.error"));
        }
      }
    });
  };

  const handleDeleteCurriculum = (item: CurriculumDto) => {
    startTransition(async () => {
      const res = await deleteCurriculumAction(item.id);
      if (res.ok) {
        toast.success(t("curriculum.deleteSuccess"));
        setDeleteConfirmCurr(null);
        await refreshCurricula();
        await refreshDepartments();
      } else {
        toast.error(t("common.error"));
      }
    });
  };

  // ----------------------------------------------------
  // Department Handlers
  // ----------------------------------------------------
  const openCreateDeptDialog = () => {
    setEditingDept(null);
    setDeptCode("");
    setDeptNameTh("");
    setDeptNameEn("");
    setDeptDescription("");
    setDeptHeadName("");
    setDeptEmail("");
    setDeptPhone("");
    setDeptOfficeRoom("");
    setDeptDisplayOrder(departments.length + 1);
    setDeptIsActive(true);
    setDeptModalOpen(true);
  };

  const openEditDeptDialog = (dept: DepartmentDto) => {
    setEditingDept(dept);
    setDeptCode(dept.code);
    setDeptNameTh(dept.nameTh);
    setDeptNameEn(dept.nameEn);
    setDeptDescription(dept.description || "");
    setDeptHeadName(dept.headName || "");
    setDeptEmail(dept.email || "");
    setDeptPhone(dept.phone || "");
    setDeptOfficeRoom(dept.officeRoom || "");
    setDeptDisplayOrder(dept.displayOrder);
    setDeptIsActive(dept.isActive);
    setDeptModalOpen(true);
  };

  const handleSaveDepartment = () => {
    if (!deptCode.trim() || !deptNameTh.trim()) {
      toast.error(isTh ? "กรุณากรอกรหัสและชื่อภาควิชา (ไทย)" : "Please fill in Department Code and Thai Name");
      return;
    }

    startTransition(async () => {
      if (editingDept) {
        const res = await updateDepartmentAction({
          id: editingDept.id,
          code: deptCode.trim(),
          nameTh: deptNameTh.trim(),
          nameEn: deptNameEn.trim() || deptNameTh.trim(),
          description: deptDescription.trim() || undefined,
          headName: deptHeadName.trim() || undefined,
          email: deptEmail.trim() || undefined,
          phone: deptPhone.trim() || undefined,
          officeRoom: deptOfficeRoom.trim() || undefined,
          displayOrder: deptDisplayOrder,
          isActive: deptIsActive,
        });
        if (res.ok) {
          toast.success(t("department.updateSuccess"));
          setDeptModalOpen(false);
          await refreshDepartments();
          await refreshCurricula();
        } else {
          toast.error(t("common.error"));
        }
      } else {
        const res = await createDepartmentAction({
          code: deptCode.trim(),
          nameTh: deptNameTh.trim(),
          nameEn: deptNameEn.trim() || deptNameTh.trim(),
          description: deptDescription.trim() || undefined,
          headName: deptHeadName.trim() || undefined,
          email: deptEmail.trim() || undefined,
          phone: deptPhone.trim() || undefined,
          officeRoom: deptOfficeRoom.trim() || undefined,
          displayOrder: deptDisplayOrder,
          isActive: deptIsActive,
        });
        if (res.ok) {
          toast.success(t("department.createSuccess"));
          setDeptModalOpen(false);
          await refreshDepartments();
        } else {
          toast.error(t("common.error"));
        }
      }
    });
  };

  const handleDeleteDepartment = (dept: DepartmentDto) => {
    if (dept.curriculaCount > 0) {
      toast.error(t("department.deleteHasCurriculaError"));
      return;
    }

    startTransition(async () => {
      const res = await deleteDepartmentAction(dept.id);
      if (res.ok) {
        toast.success(t("department.deleteSuccess"));
        setDeleteConfirmDept(null);
        await refreshDepartments();
      } else {
        toast.error(t("common.error"));
      }
    });
  };

  // ----------------------------------------------------
  // Filtered Lists
  // ----------------------------------------------------
  const filteredCurricula = items.filter((item) => {
    const matchesSearch =
      item.code.toLowerCase().includes(curriculumSearch.toLowerCase()) ||
      item.nameTh.toLowerCase().includes(curriculumSearch.toLowerCase()) ||
      item.nameEn.toLowerCase().includes(curriculumSearch.toLowerCase()) ||
      (item.departmentNameTh && item.departmentNameTh.toLowerCase().includes(curriculumSearch.toLowerCase()));

    const matchesDept =
      selectedDeptFilter === "ALL"
        ? true
        : selectedDeptFilter === "UNASSIGNED"
        ? !item.departmentId
        : item.departmentId === selectedDeptFilter;

    const matchesLevel =
      selectedLevelFilter === "ALL" ? true : item.degreeLevel === selectedLevelFilter;

    return matchesSearch && matchesDept && matchesLevel;
  });

  const filteredDepartments = departments.filter((d) => {
    return (
      d.code.toLowerCase().includes(deptSearch.toLowerCase()) ||
      d.nameTh.toLowerCase().includes(deptSearch.toLowerCase()) ||
      d.nameEn.toLowerCase().includes(deptSearch.toLowerCase()) ||
      (d.headName && d.headName.toLowerCase().includes(deptSearch.toLowerCase()))
    );
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">{t("curriculum.title")}</h1>
          <p className="text-sm text-muted-foreground">{t("curriculum.subtitle")}</p>
        </div>

        {/* Tab Actions */}
        {activeTab === "curricula" && canManage && (
          <Button onClick={openCreateCurrDialog} className="gap-2 bg-brand text-on-brand hover:bg-brand/90">
            <Plus className="h-4 w-4" />
            <span>{t("curriculum.create")}</span>
          </Button>
        )}
        {activeTab === "departments" && canManageDepartments && (
          <Button onClick={openCreateDeptDialog} className="gap-2 bg-brand text-on-brand hover:bg-brand/90">
            <Plus className="h-4 w-4" />
            <span>{t("department.create")}</span>
          </Button>
        )}
      </div>

      {/* Tabs Switcher */}
      <div className="flex items-center gap-2 border-b border-border/60 pb-1">
        <button
          type="button"
          onClick={() => setActiveTab("curricula")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all ${
            activeTab === "curricula"
              ? "bg-brand text-on-brand shadow-xs"
              : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
          }`}
        >
          <GraduationCap className="w-4 h-4" />
          <span>{t("curriculum.tab.curricula")}</span>
          <span
            className={`ml-1 px-2 py-0.5 rounded-full text-xs font-bold ${
              activeTab === "curricula"
                ? "bg-white/20 text-white"
                : "bg-muted text-muted-foreground"
            }`}
          >
            {items.length}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("departments")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all ${
            activeTab === "departments"
              ? "bg-brand text-on-brand shadow-xs"
              : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
          }`}
        >
          <Building2 className="w-4 h-4" />
          <span>{t("curriculum.tab.departments")}</span>
          <span
            className={`ml-1 px-2 py-0.5 rounded-full text-xs font-bold ${
              activeTab === "departments"
                ? "bg-white/20 text-white"
                : "bg-muted text-muted-foreground"
            }`}
          >
            {departments.length}
          </span>
        </button>
      </div>

      {/* ---------------------------------------------------- */}
      {/* TAB 1: CURRICULA LIST */}
      {/* ---------------------------------------------------- */}
      {activeTab === "curricula" && (
        <div className="space-y-4">
          {/* Filters Bar */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                value={curriculumSearch}
                onChange={(e) => setCurriculumSearch(e.target.value)}
                placeholder={t("curriculum.searchPlaceholder")}
                className="w-full pl-10 pr-4 py-2 text-sm rounded-xl border border-border bg-card text-foreground focus:outline-hidden focus:ring-2 focus:ring-brand/30"
              />
            </div>

            {/* Department Filter */}
            <div className="w-full sm:w-60">
              <select
                value={selectedDeptFilter}
                onChange={(e) => setSelectedDeptFilter(e.target.value)}
                className="w-full px-3.5 py-2 text-sm rounded-xl border border-border bg-card text-foreground focus:outline-hidden focus:ring-2 focus:ring-brand/30"
              >
                <option value="ALL">{t("curriculum.allDepartments")}</option>
                <option value="UNASSIGNED">{t("curriculum.noDepartment")}</option>
                {departments.map((d) => (
                  <option key={d.id} value={d.id}>
                    {isTh ? d.nameTh : d.nameEn}
                  </option>
                ))}
              </select>
            </div>

            {/* Level Filter */}
            <div className="w-full sm:w-44">
              <select
                value={selectedLevelFilter}
                onChange={(e) => setSelectedLevelFilter(e.target.value)}
                className="w-full px-3.5 py-2 text-sm rounded-xl border border-border bg-card text-foreground focus:outline-hidden focus:ring-2 focus:ring-brand/30"
              >
                <option value="ALL">{isTh ? "ทุกระดับการศึกษา" : "All Levels"}</option>
                <option value="BACHELOR">{t("curriculum.level.BACHELOR")}</option>
                <option value="MASTER">{t("curriculum.level.MASTER")}</option>
                <option value="DOCTORAL">{t("curriculum.level.DOCTORAL")}</option>
                <option value="SHORT_COURSE">{t("curriculum.level.SHORT_COURSE")}</option>
              </select>
            </div>
          </div>

          {/* Curricula Table */}
          <div className="rounded-2xl border border-border bg-card overflow-hidden shadow-xs">
            {filteredCurricula.length === 0 ? (
              <div className="p-12 text-center text-muted-foreground space-y-2">
                <GraduationCap className="w-8 h-8 mx-auto opacity-50" />
                <p className="text-sm">{t("curriculum.empty")}</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-muted/50 border-b border-border text-xs font-semibold text-muted-foreground">
                    <tr>
                      <th className="px-6 py-3.5">{t("curriculum.code")}</th>
                      <th className="px-6 py-3.5">{t("curriculum.nameTh")}</th>
                      <th className="px-6 py-3.5">{t("curriculum.department")}</th>
                      <th className="px-6 py-3.5">{t("curriculum.degreeLevel")}</th>
                      <th className="px-6 py-3.5">{t("curriculum.totalCredits")}</th>
                      <th className="px-6 py-3.5">{t("curriculum.status")}</th>
                      {canManage && <th className="px-6 py-3.5 text-right">{t("common.actions")}</th>}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {filteredCurricula.map((item) => (
                      <tr key={item.id} className="hover:bg-muted/30 transition-colors">
                        <td className="px-6 py-4 font-mono font-semibold text-xs text-brand">{item.code}</td>
                        <td className="px-6 py-4">
                          <div className="font-semibold text-foreground">{item.nameTh}</div>
                          <div className="text-xs text-muted-foreground font-light">{item.degreeTh}</div>
                        </td>
                        <td className="px-6 py-4">
                          {item.departmentNameTh ? (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium bg-muted text-foreground border border-border/50">
                              <Building2 className="w-3.5 h-3.5 text-brand" />
                              <span>{isTh ? item.departmentNameTh : item.departmentNameEn}</span>
                            </span>
                          ) : (
                            <span className="text-xs text-muted-foreground italic">
                              {t("curriculum.noDepartment")}
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-brand/10 text-brand">
                            {item.degreeLevel}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-xs text-foreground/90 font-medium">
                          {item.totalCredits} {locale === "th" ? "หน่วยกิต" : "Credits"}
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                              item.status === "OPEN"
                                ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                                : item.status === "UPDATING"
                                ? "bg-amber-500/10 text-amber-600"
                                : "bg-muted text-muted-foreground"
                            }`}
                          >
                            {item.status}
                          </span>
                        </td>
                        {canManage && (
                          <td className="px-6 py-4 text-right">
                            <div className="flex items-center justify-end gap-1">
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => openEditCurrDialog(item)}
                                title={t("curriculum.edit")}
                                className="h-8 w-8 text-muted-foreground hover:text-foreground"
                              >
                                <Edit2 className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => setDeleteConfirmCurr(item)}
                                title={t("curriculum.delete")}
                                className="h-8 w-8 text-destructive hover:bg-destructive/10"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </td>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ---------------------------------------------------- */}
      {/* TAB 2: DEPARTMENTS LIST */}
      {/* ---------------------------------------------------- */}
      {activeTab === "departments" && (
        <div className="space-y-4">
          {/* Search bar */}
          <div className="relative max-w-md">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              value={deptSearch}
              onChange={(e) => setDeptSearch(e.target.value)}
              placeholder={t("department.searchPlaceholder")}
              className="w-full pl-10 pr-4 py-2 text-sm rounded-xl border border-border bg-card text-foreground focus:outline-hidden focus:ring-2 focus:ring-brand/30"
            />
          </div>

          {/* Departments Table */}
          <div className="rounded-2xl border border-border bg-card overflow-hidden shadow-xs">
            {filteredDepartments.length === 0 ? (
              <div className="p-12 text-center text-muted-foreground space-y-2">
                <Building2 className="w-8 h-8 mx-auto opacity-50" />
                <p className="text-sm">{t("department.empty")}</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-muted/50 border-b border-border text-xs font-semibold text-muted-foreground">
                    <tr>
                      <th className="px-6 py-3.5">{t("department.code")}</th>
                      <th className="px-6 py-3.5">{t("department.nameTh")}</th>
                      <th className="px-6 py-3.5">{t("department.headName")}</th>
                      <th className="px-6 py-3.5">{t("department.officeRoom")}</th>
                      <th className="px-6 py-3.5">{t("department.curriculaCount")}</th>
                      <th className="px-6 py-3.5">{t("department.status")}</th>
                      {canManageDepartments && <th className="px-6 py-3.5 text-right">{t("common.actions")}</th>}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {filteredDepartments.map((dept) => (
                      <tr key={dept.id} className="hover:bg-muted/30 transition-colors">
                        <td className="px-6 py-4 font-mono font-semibold text-xs text-brand">
                          {dept.code}
                        </td>
                        <td className="px-6 py-4">
                          <div className="font-semibold text-foreground">{dept.nameTh}</div>
                          <div className="text-xs text-muted-foreground">{dept.nameEn}</div>
                        </td>
                        <td className="px-6 py-4">
                          {dept.headName ? (
                            <div className="flex items-center gap-1.5 text-xs text-foreground">
                              <UserCheck className="w-3.5 h-3.5 text-brand" />
                              <span>{dept.headName}</span>
                            </div>
                          ) : (
                            <span className="text-xs text-muted-foreground">-</span>
                          )}
                        </td>
                        <td className="px-6 py-4 text-xs text-muted-foreground">
                          {dept.officeRoom ? (
                            <div className="flex items-center gap-1.5 text-foreground">
                              <MapPin className="w-3.5 h-3.5 text-muted-foreground" />
                              <span>{dept.officeRoom}</span>
                            </div>
                          ) : null}
                          {dept.phone && (
                            <div className="flex items-center gap-1.5 mt-0.5">
                              <Phone className="w-3 h-3 text-muted-foreground" />
                              <span>{dept.phone}</span>
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-brand/10 text-brand">
                            <Layers className="w-3 h-3" />
                            <span>{dept.curriculaCount} {isTh ? "หลักสูตร" : "programs"}</span>
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                              dept.isActive
                                ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                                : "bg-muted text-muted-foreground"
                            }`}
                          >
                            {dept.isActive ? t("department.status.active") : t("department.status.inactive")}
                          </span>
                        </td>
                        {canManageDepartments && (
                          <td className="px-6 py-4 text-right">
                            <div className="flex items-center justify-end gap-1">
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => openEditDeptDialog(dept)}
                                title={t("department.edit")}
                                className="h-8 w-8 text-muted-foreground hover:text-foreground"
                              >
                                <Edit2 className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => setDeleteConfirmDept(dept)}
                                title={t("department.delete")}
                                className="h-8 w-8 text-destructive hover:bg-destructive/10"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </td>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ---------------------------------------------------- */}
      {/* MODAL: CREATE / EDIT CURRICULUM */}
      {/* ---------------------------------------------------- */}
      {currModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="w-full max-w-2xl bg-card border border-border rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold text-foreground">
              {editingCurr ? t("curriculum.edit") : t("curriculum.create")}
            </h2>

            <div className="space-y-4">
              {/* Department selector */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                  <Building2 className="w-3.5 h-3.5 text-brand" />
                  <span>{t("curriculum.department")}</span>
                </label>
                <select
                  value={currDeptId}
                  onChange={(e) => setCurrDeptId(e.target.value)}
                  className="w-full px-3.5 py-2 text-sm rounded-xl border border-border bg-background text-foreground"
                >
                  <option value="">{t("curriculum.departmentPlaceholder")}</option>
                  {departments
                    .filter((d) => d.isActive || d.id === currDeptId)
                    .map((d) => (
                      <option key={d.id} value={d.id}>
                        {d.code} - {isTh ? d.nameTh : d.nameEn}
                      </option>
                    ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-foreground">{t("curriculum.code")} *</label>
                  <input
                    type="text"
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    placeholder="เช่น B.B.A.-01"
                    className="w-full px-3.5 py-2 text-sm rounded-xl border border-border bg-background"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-foreground">{t("curriculum.degreeLevel")}</label>
                  <select
                    value={degreeLevel}
                    onChange={(e) =>
                      setDegreeLevel(e.target.value as "BACHELOR" | "MASTER" | "DOCTORAL" | "SHORT_COURSE")
                    }
                    className="w-full px-3.5 py-2 text-sm rounded-xl border border-border bg-background"
                  >
                    <option value="BACHELOR">{t("curriculum.level.BACHELOR")}</option>
                    <option value="MASTER">{t("curriculum.level.MASTER")}</option>
                    <option value="DOCTORAL">{t("curriculum.level.DOCTORAL")}</option>
                    <option value="SHORT_COURSE">{t("curriculum.level.SHORT_COURSE")}</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">{t("curriculum.nameTh")} *</label>
                <input
                  type="text"
                  value={nameTh}
                  onChange={(e) => setNameTh(e.target.value)}
                  placeholder="เช่น หลักสูตรบริหารธุรกิจบัณฑิต สาขาวิชาการตลาดดิจิทัล"
                  className="w-full px-3.5 py-2 text-sm rounded-xl border border-border bg-background"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">{t("curriculum.nameEn")}</label>
                <input
                  type="text"
                  value={nameEn}
                  onChange={(e) => setNameEn(e.target.value)}
                  placeholder="e.g. Bachelor of Business Administration in Digital Marketing"
                  className="w-full px-3.5 py-2 text-sm rounded-xl border border-border bg-background"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-foreground">{t("curriculum.degreeTh")} *</label>
                  <input
                    type="text"
                    value={degreeTh}
                    onChange={(e) => setDegreeTh(e.target.value)}
                    placeholder="เช่น บธ.บ. (การตลาดดิจิทัล)"
                    className="w-full px-3.5 py-2 text-sm rounded-xl border border-border bg-background"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-foreground">{t("curriculum.degreeEn")}</label>
                  <input
                    type="text"
                    value={degreeEn}
                    onChange={(e) => setDegreeEn(e.target.value)}
                    placeholder="e.g. B.B.A. (Digital Marketing)"
                    className="w-full px-3.5 py-2 text-sm rounded-xl border border-border bg-background"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-foreground">{t("curriculum.totalCredits")}</label>
                  <input
                    type="number"
                    value={totalCredits}
                    onChange={(e) => setTotalCredits(Number(e.target.value))}
                    className="w-full px-3.5 py-2 text-sm rounded-xl border border-border bg-background"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-foreground">{t("curriculum.tuitionFee")}</label>
                  <input
                    type="number"
                    value={tuitionFee}
                    onChange={(e) => setTuitionFee(e.target.value === "" ? "" : Number(e.target.value))}
                    placeholder="บาท"
                    className="w-full px-3.5 py-2 text-sm rounded-xl border border-border bg-background"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-foreground">{t("curriculum.status")}</label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as "OPEN" | "CLOSED" | "UPDATING")}
                    className="w-full px-3.5 py-2 text-sm rounded-xl border border-border bg-background"
                  >
                    <option value="OPEN">OPEN (เปิดรับสมัคร)</option>
                    <option value="UPDATING">UPDATING (กำลังปรับปรุง)</option>
                    <option value="CLOSED">CLOSED (ปิดรับ)</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">ลิงก์เล่มหลักสูตร PDF</label>
                <input
                  type="url"
                  value={brochurePdfUrl}
                  onChange={(e) => setBrochurePdfUrl(e.target.value)}
                  placeholder="https://.../curriculum-2026.pdf"
                  className="w-full px-3.5 py-2 text-sm rounded-xl border border-border bg-background"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-border">
              <Button
                variant="outline"
                onClick={() => setCurrModalOpen(false)}
                disabled={isPending}
                className="rounded-xl"
              >
                {t("common.cancel")}
              </Button>
              <Button
                onClick={handleSaveCurriculum}
                disabled={isPending}
                className="rounded-xl bg-brand text-on-brand hover:bg-brand/90"
              >
                {isPending ? "..." : t("common.save")}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* ---------------------------------------------------- */}
      {/* MODAL: CREATE / EDIT DEPARTMENT */}
      {/* ---------------------------------------------------- */}
      {deptModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="w-full max-w-xl bg-card border border-border rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold text-foreground">
              {editingDept ? t("department.edit") : t("department.create")}
            </h2>

            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">{t("department.code")} *</label>
                <input
                  type="text"
                  value={deptCode}
                  onChange={(e) => setDeptCode(e.target.value)}
                  placeholder="เช่น DEPT-BA"
                  className="w-full px-3.5 py-2 text-sm rounded-xl border border-border bg-background"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">{t("department.nameTh")} *</label>
                <input
                  type="text"
                  value={deptNameTh}
                  onChange={(e) => setDeptNameTh(e.target.value)}
                  placeholder="เช่น ภาควิชาบริหารธุรกิจ"
                  className="w-full px-3.5 py-2 text-sm rounded-xl border border-border bg-background"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">{t("department.nameEn")}</label>
                <input
                  type="text"
                  value={deptNameEn}
                  onChange={(e) => setDeptNameEn(e.target.value)}
                  placeholder="e.g. Department of Business Administration"
                  className="w-full px-3.5 py-2 text-sm rounded-xl border border-border bg-background"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">{t("department.headName")}</label>
                <input
                  type="text"
                  value={deptHeadName}
                  onChange={(e) => setDeptHeadName(e.target.value)}
                  placeholder="เช่น ผศ.ดร. สมชาย บริหารเลิศ"
                  className="w-full px-3.5 py-2 text-sm rounded-xl border border-border bg-background"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-foreground">{t("department.officeRoom")}</label>
                  <input
                    type="text"
                    value={deptOfficeRoom}
                    onChange={(e) => setDeptOfficeRoom(e.target.value)}
                    placeholder="เช่น อาคาร 2 ชั้น 4 (MS-240)"
                    className="w-full px-3.5 py-2 text-sm rounded-xl border border-border bg-background"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-foreground">{t("department.phone")}</label>
                  <input
                    type="text"
                    value={deptPhone}
                    onChange={(e) => setDeptPhone(e.target.value)}
                    placeholder="เช่น 044-123456 ต่อ 1400"
                    className="w-full px-3.5 py-2 text-sm rounded-xl border border-border bg-background"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-foreground">{t("department.email")}</label>
                  <input
                    type="email"
                    value={deptEmail}
                    onChange={(e) => setDeptEmail(e.target.value)}
                    placeholder="ba.dept@faculty.edu"
                    className="w-full px-3.5 py-2 text-sm rounded-xl border border-border bg-background"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-foreground">{t("department.displayOrder")}</label>
                  <input
                    type="number"
                    value={deptDisplayOrder}
                    onChange={(e) => setDeptDisplayOrder(Number(e.target.value))}
                    className="w-full px-3.5 py-2 text-sm rounded-xl border border-border bg-background"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">{t("department.description")}</label>
                <textarea
                  value={deptDescription}
                  onChange={(e) => setDeptDescription(e.target.value)}
                  rows={3}
                  placeholder="รายละเอียดและภารกิจของภาควิชา..."
                  className="w-full px-3.5 py-2 text-sm rounded-xl border border-border bg-background text-foreground"
                />
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="deptIsActive"
                  checked={deptIsActive}
                  onChange={(e) => setDeptIsActive(e.target.checked)}
                  className="rounded border-border text-brand focus:ring-brand"
                />
                <label htmlFor="deptIsActive" className="text-xs font-semibold text-foreground cursor-pointer">
                  {t("department.status.active")}
                </label>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-border">
              <Button
                variant="outline"
                onClick={() => setDeptModalOpen(false)}
                disabled={isPending}
                className="rounded-xl"
              >
                {t("common.cancel")}
              </Button>
              <Button
                onClick={handleSaveDepartment}
                disabled={isPending}
                className="rounded-xl bg-brand text-on-brand hover:bg-brand/90"
              >
                {isPending ? "..." : t("common.save")}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* ---------------------------------------------------- */}
      {/* DELETE CURRICULUM CONFIRM */}
      {/* ---------------------------------------------------- */}
      {deleteConfirmCurr && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="w-full max-w-md bg-card border border-border rounded-3xl p-6 space-y-4 shadow-2xl">
            <div className="flex items-center gap-3 text-destructive">
              <AlertCircle className="w-6 h-6 shrink-0" />
              <h3 className="font-bold text-lg text-foreground">{t("curriculum.delete")}</h3>
            </div>
            <p className="text-sm text-muted-foreground">
              {t("curriculum.deleteConfirm")}: <span className="font-semibold text-foreground">{deleteConfirmCurr.nameTh}</span>
            </p>
            <div className="flex items-center justify-end gap-2 pt-2">
              <Button
                variant="outline"
                onClick={() => setDeleteConfirmCurr(null)}
                disabled={isPending}
                className="rounded-xl"
              >
                {t("common.cancel")}
              </Button>
              <Button
                variant="destructive"
                onClick={() => handleDeleteCurriculum(deleteConfirmCurr)}
                disabled={isPending}
                className="rounded-xl"
              >
                {isPending ? "..." : t("curriculum.delete")}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* ---------------------------------------------------- */}
      {/* DELETE DEPARTMENT CONFIRM */}
      {/* ---------------------------------------------------- */}
      {deleteConfirmDept && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="w-full max-w-md bg-card border border-border rounded-3xl p-6 space-y-4 shadow-2xl">
            <div className="flex items-center gap-3 text-destructive">
              <AlertCircle className="w-6 h-6 shrink-0" />
              <h3 className="font-bold text-lg text-foreground">{t("department.delete")}</h3>
            </div>

            {deleteConfirmDept.curriculaCount > 0 ? (
              <div className="p-3.5 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-xs space-y-2">
                <p className="font-semibold">{t("department.deleteHasCurriculaError")}</p>
                <p>
                  ภาควิชานี้มีหลักสูตรสังกัดอยู่ {deleteConfirmDept.curriculaCount} หลักสูตร
                </p>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">
                {t("department.deleteConfirm")}:{" "}
                <span className="font-semibold text-foreground">{deleteConfirmDept.nameTh}</span>
              </p>
            )}

            <div className="flex items-center justify-end gap-2 pt-2">
              <Button
                variant="outline"
                onClick={() => setDeleteConfirmDept(null)}
                disabled={isPending}
                className="rounded-xl"
              >
                {t("common.cancel")}
              </Button>
              {deleteConfirmDept.curriculaCount === 0 && (
                <Button
                  variant="destructive"
                  onClick={() => handleDeleteDepartment(deleteConfirmDept)}
                  disabled={isPending}
                  className="rounded-xl"
                >
                  {isPending ? "..." : t("department.delete")}
                </Button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
