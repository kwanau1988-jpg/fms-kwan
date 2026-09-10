"use client";

import { useState, useTransition } from "react";
import { Plus, Edit2, Trash2, Pin, AlertCircle, Newspaper } from "lucide-react";
import { toast } from "sonner";
import { useT, useLocale } from "@/shared/lib/i18n/client";
import { formatDate } from "@/shared/lib/format";
import { Button } from "@/components/ui/button";
import type { NewsArticleDto } from "@/features/news";
import {
  createNewsArticleAction,
  updateNewsArticleAction,
  deleteNewsArticleAction,
  getNewsArticlesAction,
} from "@/features/news/actions";

interface Props {
  initialItems: NewsArticleDto[];
  canManage: boolean;
}

export function NewsClient({ initialItems, canManage }: Props) {
  const t = useT();
  const locale = useLocale();
  const [items, setItems] = useState<NewsArticleDto[]>(initialItems);
  const [isPending, startTransition] = useTransition();

  // Dialog states
  const [modalOpen, setModalOpen] = useState(false);
  const [deleteConfirmItem, setDeleteConfirmItem] = useState<NewsArticleDto | null>(null);
  const [editingItem, setEditingItem] = useState<NewsArticleDto | null>(null);

  // Form states
  const [titleTh, setTitleTh] = useState("");
  const [titleEn, setTitleEn] = useState("");
  const [category, setCategory] = useState<"ACADEMIC" | "ACTIVITY" | "RESEARCH" | "GENERAL">("GENERAL");
  const [contentTh, setContentTh] = useState("");
  const [contentEn, setContentEn] = useState("");
  const [coverImageUrl, setCoverImageUrl] = useState("");
  const [isPinned, setIsPinned] = useState(false);
  const [status, setStatus] = useState<"DRAFT" | "PUBLISHED" | "ARCHIVED">("PUBLISHED");

  const openCreateDialog = () => {
    setEditingItem(null);
    setTitleTh("");
    setTitleEn("");
    setCategory("GENERAL");
    setContentTh("");
    setContentEn("");
    setCoverImageUrl("");
    setIsPinned(false);
    setStatus("PUBLISHED");
    setModalOpen(true);
  };

  const openEditDialog = (item: NewsArticleDto) => {
    setEditingItem(item);
    setTitleTh(item.titleTh);
    setTitleEn(item.titleEn);
    setCategory(item.category as "ACADEMIC" | "ACTIVITY" | "RESEARCH" | "GENERAL");
    setContentTh(item.contentTh);
    setContentEn(item.contentEn);
    setCoverImageUrl(item.coverImageUrl || "");
    setIsPinned(item.isPinned);
    setStatus(item.status as "DRAFT" | "PUBLISHED" | "ARCHIVED");
    setModalOpen(true);
  };

  const refreshItems = async () => {
    const res = await getNewsArticlesAction();
    if (res.ok) setItems(res.data);
  };

  const handleSave = () => {
    if (!titleTh.trim() || !titleEn.trim() || !contentTh.trim() || !contentEn.trim()) {
      toast.error(locale === "th" ? "กรุณากรอกข้อมูลที่จำเป็นให้ครบถ้วน" : "Please fill in all required fields");
      return;
    }

    startTransition(async () => {
      if (editingItem) {
        const res = await updateNewsArticleAction({
          id: editingItem.id,
          titleTh,
          titleEn,
          category,
          contentTh,
          contentEn,
          coverImageUrl: coverImageUrl.trim() || undefined,
          isPinned,
          status,
        });
        if (res.ok) {
          toast.success(t("news.updateSuccess"));
          setModalOpen(false);
          await refreshItems();
        } else {
          toast.error(t("common.error"));
        }
      } else {
        const res = await createNewsArticleAction({
          titleTh,
          titleEn,
          category,
          contentTh,
          contentEn,
          coverImageUrl: coverImageUrl.trim() || undefined,
          isPinned,
          status,
        });
        if (res.ok) {
          toast.success(t("news.createSuccess"));
          setModalOpen(false);
          await refreshItems();
        } else {
          toast.error(t("common.error"));
        }
      }
    });
  };

  const handleDelete = (item: NewsArticleDto) => {
    startTransition(async () => {
      const res = await deleteNewsArticleAction(item.id);
      if (res.ok) {
        toast.success(t("news.deleteSuccess"));
        setDeleteConfirmItem(null);
        await refreshItems();
      } else {
        toast.error(t("common.error"));
      }
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">{t("news.title")}</h1>
          <p className="text-sm text-muted-foreground">{t("news.subtitle")}</p>
        </div>
        {canManage && (
          <Button onClick={openCreateDialog} className="gap-2 bg-brand text-on-brand hover:bg-brand/90">
            <Plus className="h-4 w-4" />
            <span>{t("news.create")}</span>
          </Button>
        )}
      </div>

      {/* Table */}
      <div className="rounded-2xl border border-border bg-card overflow-hidden shadow-xs">
        {items.length === 0 ? (
          <div className="p-12 text-center text-muted-foreground space-y-2">
            <Newspaper className="w-8 h-8 mx-auto opacity-50" />
            <p className="text-sm">{t("news.empty")}</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-muted/50 border-b border-border text-xs font-semibold text-muted-foreground">
                <tr>
                  <th className="px-6 py-3.5">{t("news.titleTh")}</th>
                  <th className="px-6 py-3.5">{t("news.category")}</th>
                  <th className="px-6 py-3.5">{t("news.status")}</th>
                  <th className="px-6 py-3.5">{locale === "th" ? "วันที่เผยแพร่" : "Published Date"}</th>
                  {canManage && <th className="px-6 py-3.5 text-right">{t("common.actions")}</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {items.map((item) => (
                  <tr key={item.id} className="hover:bg-muted/30 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        {item.isPinned && <Pin className="w-3.5 h-3.5 text-amber-500 shrink-0" />}
                        <div>
                          <div className="font-semibold text-foreground">{item.titleTh}</div>
                          <div className="text-xs text-muted-foreground font-light">{item.titleEn}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-muted text-foreground">
                        {item.category}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                        item.status === "PUBLISHED"
                          ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                          : item.status === "DRAFT"
                          ? "bg-amber-500/10 text-amber-600"
                          : "bg-muted text-muted-foreground"
                      }`}>
                        {item.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-xs text-muted-foreground">
                      {formatDate(new Date(item.createdAt), locale)}
                    </td>
                    {canManage && (
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => openEditDialog(item)}
                            title={t("news.edit")}
                            className="h-8 w-8 text-muted-foreground hover:text-foreground"
                          >
                            <Edit2 className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setDeleteConfirmItem(item)}
                            title={t("news.delete")}
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

      {/* Create / Edit Modal Dialog */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="w-full max-w-2xl bg-card border border-border rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold text-foreground">
              {editingItem ? t("news.edit") : t("news.create")}
            </h2>

            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">{t("news.titleTh")} *</label>
                <input
                  type="text"
                  value={titleTh}
                  onChange={(e) => setTitleTh(e.target.value)}
                  placeholder="เช่น ประกาศรับสมัครคณาจารย์ใหม่..."
                  className="w-full px-3.5 py-2 text-sm rounded-xl border border-border bg-background focus:outline-hidden focus:ring-2 focus:ring-brand"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">{t("news.titleEn")} *</label>
                <input
                  type="text"
                  value={titleEn}
                  onChange={(e) => setTitleEn(e.target.value)}
                  placeholder="e.g. Faculty Recruitment Announcement..."
                  className="w-full px-3.5 py-2 text-sm rounded-xl border border-border bg-background focus:outline-hidden focus:ring-2 focus:ring-brand"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-foreground">{t("news.category")}</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as "ACADEMIC" | "ACTIVITY" | "RESEARCH" | "GENERAL")}
                    className="w-full px-3.5 py-2 text-sm rounded-xl border border-border bg-background"
                  >
                    <option value="GENERAL">{t("news.cat.GENERAL")}</option>
                    <option value="ACADEMIC">{t("news.cat.ACADEMIC")}</option>
                    <option value="ACTIVITY">{t("news.cat.ACTIVITY")}</option>
                    <option value="RESEARCH">{t("news.cat.RESEARCH")}</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-foreground">{t("news.status")}</label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as "DRAFT" | "PUBLISHED" | "ARCHIVED")}
                    className="w-full px-3.5 py-2 text-sm rounded-xl border border-border bg-background"
                  >
                    <option value="PUBLISHED">PUBLISHED (เผยแพร่ทันที)</option>
                    <option value="DRAFT">DRAFT (แบบร่าง)</option>
                    <option value="ARCHIVED">ARCHIVED (เก็บถาวร)</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">{t("news.coverImageUrl")}</label>
                <input
                  type="url"
                  value={coverImageUrl}
                  onChange={(e) => setCoverImageUrl(e.target.value)}
                  placeholder="https://images.unsplash.com/..."
                  className="w-full px-3.5 py-2 text-sm rounded-xl border border-border bg-background focus:outline-hidden focus:ring-2 focus:ring-brand"
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="isPinned"
                  checked={isPinned}
                  onChange={(e) => setIsPinned(e.target.checked)}
                  className="w-4 h-4 rounded text-brand border-border focus:ring-brand"
                />
                <label htmlFor="isPinned" className="text-xs font-medium text-foreground cursor-pointer">
                  {t("news.isPinned")} (แสดงบนส่วนบนสุดของหน้าแรก)
                </label>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">{t("news.contentTh")} *</label>
                <textarea
                  rows={4}
                  value={contentTh}
                  onChange={(e) => setContentTh(e.target.value)}
                  placeholder="เนื้อหาข่าวภาษาไทย..."
                  className="w-full px-3.5 py-2 text-sm rounded-xl border border-border bg-background focus:outline-hidden focus:ring-2 focus:ring-brand"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">{t("news.contentEn")} *</label>
                <textarea
                  rows={4}
                  value={contentEn}
                  onChange={(e) => setContentEn(e.target.value)}
                  placeholder="News content in English..."
                  className="w-full px-3.5 py-2 text-sm rounded-xl border border-border bg-background focus:outline-hidden focus:ring-2 focus:ring-brand"
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

      {/* Delete Confirmation Modal */}
      {deleteConfirmItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="w-full max-w-md bg-card border border-border rounded-3xl p-6 space-y-4 shadow-2xl">
            <div className="flex items-center gap-3 text-destructive">
              <AlertCircle className="w-6 h-6 shrink-0" />
              <h3 className="font-bold text-lg text-foreground">{t("news.delete")}</h3>
            </div>
            <p className="text-sm text-muted-foreground">
              {t("news.deleteConfirm")}: <span className="font-semibold text-foreground">&ldquo;{deleteConfirmItem.titleTh}&rdquo;</span>
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
                {isPending ? "..." : t("news.delete")}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
