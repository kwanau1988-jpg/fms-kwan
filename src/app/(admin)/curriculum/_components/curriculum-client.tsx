"use client";

import { useState, useTransition } from "react";
import { Plus, Edit2, Trash2, GraduationCap, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { useT, useLocale } from "@/shared/lib/i18n/client";
import { Button } from "@/components/ui/button";
import type { CurriculumDto } from "@/features/curriculum";
import {
  createCurriculumAction,
  updateCurriculumAction,
  deleteCurriculumAction,
  getCurriculaAction,
} from "@/features/curriculum/actions";

interface Props {
  initialItems: CurriculumDto[];
  canManage: boolean;
}

export function CurriculumClient({ initialItems, canManage }: Props) {
  const t = useT();
  const locale = useLocale();
  const [items, setItems] = useState<CurriculumDto[]>(initialItems);
  const [isPending, startTransition] = useTransition();

  // Dialog states
  const [modalOpen, setModalOpen] = useState(false);
  const [deleteConfirmItem, setDeleteConfirmItem] = useState<CurriculumDto | null>(null);
  const [editingItem, setEditingItem] = useState<CurriculumDto | null>(null);

  // Form states
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

  const openCreateDialog = () => {
    setEditingItem(null);
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
    setModalOpen(true);
  };

  const openEditDialog = (item: CurriculumDto) => {
    setEditingItem(item);
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
    setModalOpen(true);
  };

  const refreshItems = async () => {
    const res = await getCurriculaAction();
    if (res.ok) setItems(res.data);
  };

  const handleSave = () => {
    if (!code.trim() || !nameTh.trim() || !degreeTh.trim()) {
      toast.error(locale === "th" ? "กรุณากรอกรหัสและชื่อหลักสูตร" : "Please fill in Program Code and Title");
      return;
    }

    startTransition(async () => {
      if (editingItem) {
        const res = await updateCurriculumAction({
          id: editingItem.id,
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
          setModalOpen(false);
          await refreshItems();
        } else {
          toast.error(t("common.error"));
        }
      } else {
        const res = await createCurriculumAction({
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
          setModalOpen(false);
          await refreshItems();
        } else {
          toast.error(t("common.error"));
        }
      }
    });
  };

  const handleDelete = (item: CurriculumDto) => {
    startTransition(async () => {
      const res = await deleteCurriculumAction(item.id);
      if (res.ok) {
        toast.success(t("curriculum.deleteSuccess"));
        setDeleteConfirmItem(null);
        await refreshItems();
      } else {
        toast.error(t("common.error"));
      }
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">{t("curriculum.title")}</h1>
          <p className="text-sm text-muted-foreground">{t("curriculum.subtitle")}</p>
        </div>
        {canManage && (
          <Button onClick={openCreateDialog} className="gap-2 bg-brand text-on-brand hover:bg-brand/90">
            <Plus className="h-4 w-4" />
            <span>{t("curriculum.create")}</span>
          </Button>
        )}
      </div>

      <div className="rounded-2xl border border-border bg-card overflow-hidden shadow-xs">
        {items.length === 0 ? (
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
                  <th className="px-6 py-3.5">{t("curriculum.degreeLevel")}</th>
                  <th className="px-6 py-3.5">{t("curriculum.totalCredits")}</th>
                  <th className="px-6 py-3.5">{t("curriculum.status")}</th>
                  {canManage && <th className="px-6 py-3.5 text-right">{t("common.actions")}</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {items.map((item) => (
                  <tr key={item.id} className="hover:bg-muted/30 transition-colors">
                    <td className="px-6 py-4 font-mono font-semibold text-xs text-brand">{item.code}</td>
                    <td className="px-6 py-4">
                      <div className="font-semibold text-foreground">{item.nameTh}</div>
                      <div className="text-xs text-muted-foreground font-light">{item.degreeTh}</div>
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
                      <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                        item.status === "OPEN"
                          ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                          : item.status === "UPDATING"
                          ? "bg-amber-500/10 text-amber-600"
                          : "bg-muted text-muted-foreground"
                      }`}>
                        {item.status}
                      </span>
                    </td>
                    {canManage && (
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => openEditDialog(item)}
                            title={t("curriculum.edit")}
                            className="h-8 w-8 text-muted-foreground hover:text-foreground"
                          >
                            <Edit2 className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setDeleteConfirmItem(item)}
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

      {/* Create / Edit Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="w-full max-w-2xl bg-card border border-border rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold text-foreground">
              {editingItem ? t("curriculum.edit") : t("curriculum.create")}
            </h2>

            <div className="space-y-4">
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
                    onChange={(e) => setDegreeLevel(e.target.value as "BACHELOR" | "MASTER" | "DOCTORAL" | "SHORT_COURSE")}
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
                onClick={() => setModalOpen(false)}
                disabled={isPending}
                className="rounded-xl"
              >
                {t("common.cancel")}
              </Button>
              <Button
                onClick={handleSave}
                disabled={isPending}
                className="rounded-xl bg-brand text-on-brand hover:bg-brand/90"
              >
                {isPending ? "..." : t("common.save")}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirm */}
      {deleteConfirmItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="w-full max-w-md bg-card border border-border rounded-3xl p-6 space-y-4 shadow-2xl">
            <div className="flex items-center gap-3 text-destructive">
              <AlertCircle className="w-6 h-6 shrink-0" />
              <h3 className="font-bold text-lg text-foreground">{t("curriculum.delete")}</h3>
            </div>
            <p className="text-sm text-muted-foreground">
              {t("curriculum.deleteConfirm")}: <span className="font-semibold text-foreground">{deleteConfirmItem.nameTh}</span>
            </p>
            <div className="flex items-center justify-end gap-2 pt-2">
              <Button
                variant="outline"
                onClick={() => setDeleteConfirmItem(null)}
                disabled={isPending}
                className="rounded-xl"
              >
                {t("common.cancel")}
              </Button>
              <Button
                variant="destructive"
                onClick={() => handleDelete(deleteConfirmItem)}
                disabled={isPending}
                className="rounded-xl"
              >
                {isPending ? "..." : t("curriculum.delete")}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
