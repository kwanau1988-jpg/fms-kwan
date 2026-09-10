"use client";

import { useState, useTransition } from "react";
import { Plus, Edit2, Trash2, UserCheck, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { useT, useLocale } from "@/shared/lib/i18n/client";
import { Button } from "@/components/ui/button";
import type { PersonnelProfileDto } from "@/features/personnel";
import {
  createPersonnelProfileAction,
  updatePersonnelProfileAction,
  deletePersonnelProfileAction,
  getPersonnelProfilesAction,
} from "@/features/personnel/actions";

interface Props {
  initialItems: PersonnelProfileDto[];
  canManage: boolean;
}

export function PersonnelClient({ initialItems, canManage }: Props) {
  const t = useT();
  const locale = useLocale();
  const [items, setItems] = useState<PersonnelProfileDto[]>(initialItems);
  const [isPending, startTransition] = useTransition();

  // Dialog states
  const [modalOpen, setModalOpen] = useState(false);
  const [deleteConfirmItem, setDeleteConfirmItem] = useState<PersonnelProfileDto | null>(null);
  const [editingItem, setEditingItem] = useState<PersonnelProfileDto | null>(null);

  // Form states
  const [academicTitle, setAcademicTitle] = useState("");
  const [firstNameTh, setFirstNameTh] = useState("");
  const [lastNameTh, setLastNameTh] = useState("");
  const [firstNameEn, setFirstNameEn] = useState("");
  const [lastNameEn, setLastNameEn] = useState("");
  const [departmentTh, setDepartmentTh] = useState("บริหารธุรกิจ");
  const [departmentEn, setDepartmentEn] = useState("Business Administration");
  const [positionTh, setPositionTh] = useState("อาจารย์ประจำ");
  const [positionEn, setPositionEn] = useState("Lecturer");
  const [email, setEmail] = useState("");
  const [phoneExt, setPhoneExt] = useState("");
  const [roomNumber, setRoomNumber] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [displayOrder, setDisplayOrder] = useState(1);
  const [isActive, setIsActive] = useState(true);

  const openCreateDialog = () => {
    setEditingItem(null);
    setAcademicTitle("อ.");
    setFirstNameTh("");
    setLastNameTh("");
    setFirstNameEn("");
    setLastNameEn("");
    setDepartmentTh("บริหารธุรกิจ");
    setDepartmentEn("Business Administration");
    setPositionTh("อาจารย์ประจำ");
    setPositionEn("Lecturer");
    setEmail("");
    setPhoneExt("");
    setRoomNumber("");
    setAvatarUrl("");
    setDisplayOrder(items.length + 1);
    setIsActive(true);
    setModalOpen(true);
  };

  const openEditDialog = (item: PersonnelProfileDto) => {
    setEditingItem(item);
    setAcademicTitle(item.academicTitle || "");
    setFirstNameTh(item.firstNameTh);
    setLastNameTh(item.lastNameTh);
    setFirstNameEn(item.firstNameEn);
    setLastNameEn(item.lastNameEn);
    setDepartmentTh(item.departmentTh);
    setDepartmentEn(item.departmentEn);
    setPositionTh(item.positionTh);
    setPositionEn(item.positionEn);
    setEmail(item.email);
    setPhoneExt(item.phoneExt || "");
    setRoomNumber(item.roomNumber || "");
    setAvatarUrl(item.avatarUrl || "");
    setDisplayOrder(item.displayOrder);
    setIsActive(item.isActive);
    setModalOpen(true);
  };

  const refreshItems = async () => {
    const res = await getPersonnelProfilesAction();
    if (res.ok) setItems(res.data);
  };

  const handleSave = () => {
    if (!firstNameTh.trim() || !lastNameTh.trim() || !email.trim()) {
      toast.error(locale === "th" ? "กรุณากรอกชื่อ นามสกุล และอีเมล" : "Please fill in Name and Email");
      return;
    }

    startTransition(async () => {
      if (editingItem) {
        const res = await updatePersonnelProfileAction({
          id: editingItem.id,
          academicTitle: academicTitle.trim() || undefined,
          firstNameTh,
          lastNameTh,
          firstNameEn,
          lastNameEn,
          departmentTh,
          departmentEn,
          positionTh,
          positionEn,
          email,
          phoneExt: phoneExt.trim() || undefined,
          roomNumber: roomNumber.trim() || undefined,
          avatarUrl: avatarUrl.trim() || undefined,
          displayOrder,
          isActive,
        });
        if (res.ok) {
          toast.success(t("personnel.updateSuccess"));
          setModalOpen(false);
          await refreshItems();
        } else {
          toast.error(t("common.error"));
        }
      } else {
        const res = await createPersonnelProfileAction({
          academicTitle: academicTitle.trim() || undefined,
          firstNameTh,
          lastNameTh,
          firstNameEn,
          lastNameEn,
          departmentTh,
          departmentEn,
          positionTh,
          positionEn,
          email,
          phoneExt: phoneExt.trim() || undefined,
          roomNumber: roomNumber.trim() || undefined,
          avatarUrl: avatarUrl.trim() || undefined,
          displayOrder,
          isActive,
        });
        if (res.ok) {
          toast.success(t("personnel.createSuccess"));
          setModalOpen(false);
          await refreshItems();
        } else {
          toast.error(t("common.error"));
        }
      }
    });
  };

  const handleDelete = (item: PersonnelProfileDto) => {
    startTransition(async () => {
      const res = await deletePersonnelProfileAction(item.id);
      if (res.ok) {
        toast.success(t("personnel.deleteSuccess"));
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
          <h1 className="text-2xl font-bold tracking-tight text-foreground">{t("personnel.title")}</h1>
          <p className="text-sm text-muted-foreground">{t("personnel.subtitle")}</p>
        </div>
        {canManage && (
          <Button onClick={openCreateDialog} className="gap-2 bg-brand text-on-brand hover:bg-brand/90">
            <Plus className="h-4 w-4" />
            <span>{t("personnel.create")}</span>
          </Button>
        )}
      </div>

      <div className="rounded-2xl border border-border bg-card overflow-hidden shadow-xs">
        {items.length === 0 ? (
          <div className="p-12 text-center text-muted-foreground space-y-2">
            <UserCheck className="w-8 h-8 mx-auto opacity-50" />
            <p className="text-sm">{t("personnel.empty")}</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-muted/50 border-b border-border text-xs font-semibold text-muted-foreground">
                <tr>
                  <th className="px-6 py-3.5">{locale === "th" ? "ลำดับ" : "Order"}</th>
                  <th className="px-6 py-3.5">{locale === "th" ? "ชื่อ-นามสกุล" : "Name"}</th>
                  <th className="px-6 py-3.5">{t("personnel.position")}</th>
                  <th className="px-6 py-3.5">{t("personnel.department")}</th>
                  <th className="px-6 py-3.5">{t("personnel.email")}</th>
                  <th className="px-6 py-3.5">{locale === "th" ? "สถานะ" : "Status"}</th>
                  {canManage && <th className="px-6 py-3.5 text-right">{t("common.actions")}</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {items.map((item) => {
                  const fullName = `${item.academicTitle ? item.academicTitle + " " : ""}${item.firstNameTh} ${item.lastNameTh}`;
                  return (
                    <tr key={item.id} className="hover:bg-muted/30 transition-colors">
                      <td className="px-6 py-4 text-muted-foreground font-mono text-xs">{item.displayOrder}</td>
                      <td className="px-6 py-4 font-semibold text-foreground">{fullName}</td>
                      <td className="px-6 py-4 text-xs text-foreground/90">{item.positionTh}</td>
                      <td className="px-6 py-4 text-xs text-muted-foreground">{item.departmentTh}</td>
                      <td className="px-6 py-4 text-xs text-muted-foreground font-mono">{item.email}</td>
                      <td className="px-6 py-4">
                        <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                          item.isActive
                            ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                            : "bg-muted text-muted-foreground"
                        }`}>
                          {item.isActive ? (locale === "th" ? "ปฏิบัติงาน" : "Active") : (locale === "th" ? "ระงับ" : "Inactive")}
                        </span>
                      </td>
                      {canManage && (
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => openEditDialog(item)}
                              title={t("personnel.edit")}
                              className="h-8 w-8 text-muted-foreground hover:text-foreground"
                            >
                              <Edit2 className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => setDeleteConfirmItem(item)}
                              title={t("personnel.delete")}
                              className="h-8 w-8 text-destructive hover:bg-destructive/10"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </td>
                      )}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal Form */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="w-full max-w-2xl bg-card border border-border rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold text-foreground">
              {editingItem ? t("personnel.edit") : t("personnel.create")}
            </h2>

            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-foreground">คำนำหน้า/ตำแหน่งวิชาการ</label>
                  <input
                    type="text"
                    value={academicTitle}
                    onChange={(e) => setAcademicTitle(e.target.value)}
                    placeholder="ศ., รศ., ดร., อ."
                    className="w-full px-3.5 py-2 text-sm rounded-xl border border-border bg-background"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-foreground">{t("personnel.firstNameTh")} *</label>
                  <input
                    type="text"
                    value={firstNameTh}
                    onChange={(e) => setFirstNameTh(e.target.value)}
                    className="w-full px-3.5 py-2 text-sm rounded-xl border border-border bg-background"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-foreground">{t("personnel.lastNameTh")} *</label>
                  <input
                    type="text"
                    value={lastNameTh}
                    onChange={(e) => setLastNameTh(e.target.value)}
                    className="w-full px-3.5 py-2 text-sm rounded-xl border border-border bg-background"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-foreground">{t("personnel.firstNameEn")}</label>
                  <input
                    type="text"
                    value={firstNameEn}
                    onChange={(e) => setFirstNameEn(e.target.value)}
                    className="w-full px-3.5 py-2 text-sm rounded-xl border border-border bg-background"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-foreground">{t("personnel.lastNameEn")}</label>
                  <input
                    type="text"
                    value={lastNameEn}
                    onChange={(e) => setLastNameEn(e.target.value)}
                    className="w-full px-3.5 py-2 text-sm rounded-xl border border-border bg-background"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-foreground">{t("personnel.position")}</label>
                  <input
                    type="text"
                    value={positionTh}
                    onChange={(e) => setPositionTh(e.target.value)}
                    placeholder="เช่น รองคณบดีฝ่ายวิชาการ"
                    className="w-full px-3.5 py-2 text-sm rounded-xl border border-border bg-background"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-foreground">{t("personnel.department")}</label>
                  <input
                    type="text"
                    value={departmentTh}
                    onChange={(e) => setDepartmentTh(e.target.value)}
                    placeholder="เช่น บริหารธุรกิจ"
                    className="w-full px-3.5 py-2 text-sm rounded-xl border border-border bg-background"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-foreground">{t("personnel.email")} *</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="staff@faculty.edu"
                    className="w-full px-3.5 py-2 text-sm rounded-xl border border-border bg-background"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-foreground">{t("personnel.phone")}</label>
                  <input
                    type="text"
                    value={phoneExt}
                    onChange={(e) => setPhoneExt(e.target.value)}
                    placeholder="1234"
                    className="w-full px-3.5 py-2 text-sm rounded-xl border border-border bg-background"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-foreground">{t("personnel.room")}</label>
                  <input
                    type="text"
                    value={roomNumber}
                    onChange={(e) => setRoomNumber(e.target.value)}
                    placeholder="MS-302"
                    className="w-full px-3.5 py-2 text-sm rounded-xl border border-border bg-background"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-foreground">รูปโปรไฟล์ (URL)</label>
                  <input
                    type="url"
                    value={avatarUrl}
                    onChange={(e) => setAvatarUrl(e.target.value)}
                    placeholder="https://images.unsplash.com/..."
                    className="w-full px-3.5 py-2 text-sm rounded-xl border border-border bg-background"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-foreground">ลำดับการแสดงผล (เลขน้อยขึ้นก่อน)</label>
                  <input
                    type="number"
                    value={displayOrder}
                    onChange={(e) => setDisplayOrder(Number(e.target.value))}
                    className="w-full px-3.5 py-2 text-sm rounded-xl border border-border bg-background"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={isActive}
                  onChange={(e) => setIsActive(e.target.checked)}
                  className="w-4 h-4 rounded text-brand border-border focus:ring-brand"
                />
                <label htmlFor="isActive" className="text-xs font-medium text-foreground cursor-pointer">
                  สถานะปฏิบัติงาน (แสดงในทำเนียบหน้าบ้าน)
                </label>
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
              <h3 className="font-bold text-lg text-foreground">{t("personnel.delete")}</h3>
            </div>
            <p className="text-sm text-muted-foreground">
              {t("personnel.deleteConfirm")}: <span className="font-semibold text-foreground">{deleteConfirmItem.firstNameTh} {deleteConfirmItem.lastNameTh}</span>
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
                {isPending ? "..." : t("personnel.delete")}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
