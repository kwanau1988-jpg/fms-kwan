"use client";

import { useState, useTransition, useEffect } from "react";
import { Plus, FileText, CheckCircle2, XCircle, Clock, Eye, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { useT, useLocale } from "@/shared/lib/i18n/client";
import { formatDate } from "@/shared/lib/format";
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
import type { DocumentRequestDto } from "@/features/e-document";
import {
  createDocumentRequestAction,
  decideDocumentApprovalAction,
  getDocumentRequestsAction,
  getEligibleApproversAction,
} from "@/features/e-document/actions";

interface Props {
  initialItems: DocumentRequestDto[];
  currentUserId: string;
  canCreate: boolean;
  canApprove: boolean;
  canManage: boolean;
}

export function DocumentClient({
  initialItems,
  currentUserId,
  canCreate,
  canApprove,
  canManage,
}: Props) {
  const t = useT();
  const locale = useLocale();
  const [items, setItems] = useState<DocumentRequestDto[]>(initialItems);
  const [isPending, startTransition] = useTransition();

  // Dialog states
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [selectedDoc, setSelectedDoc] = useState<DocumentRequestDto | null>(null);

  // Create form states
  const [formTitle, setFormTitle] = useState("");
  const [formDocType, setFormDocType] = useState("PROJECT");
  const [eligibleApprovers, setEligibleApprovers] = useState<Array<{ id: string; name: string; email: string }>>([]);
  const [selectedApprover1, setSelectedApprover1] = useState("");
  const [selectedApprover2, setSelectedApprover2] = useState("");

  // Approval decision states
  const [decisionComment, setDecisionComment] = useState("");

  useEffect(() => {
    getEligibleApproversAction().then((res) => {
      if (res.ok) {
        setEligibleApprovers(res.data);
        if (res.data.length > 0) {
          setSelectedApprover1(res.data[0].id);
          if (res.data.length > 1) {
            setSelectedApprover2(res.data[1].id);
          }
        }
      }
    });
  }, []);

  const refreshItems = async () => {
    const res = await getDocumentRequestsAction();
    if (res.ok) {
      setItems(res.data);
    }
  };

  const handleOpenCreate = () => {
    setFormTitle("");
    setFormDocType("PROJECT");
    setCreateModalOpen(true);
  };

  const handleCreate = () => {
    if (!formTitle.trim()) {
      toast.error(t("error.validation"));
      return;
    }

    const approvers = [selectedApprover1, selectedApprover2].filter(Boolean);
    if (approvers.length === 0) {
      toast.error(t("document.approvers"));
      return;
    }

    startTransition(async () => {
      const res = await createDocumentRequestAction({
        title: formTitle.trim(),
        docType: formDocType,
        approverIds: approvers,
      });

      if (res.ok) {
        toast.success(t("document.createSuccess"));
        setCreateModalOpen(false);
        await refreshItems();
      } else {
        toast.error(res.error.message || t("common.error"));
      }
    });
  };

  const handleDecision = (decision: "APPROVED" | "REJECTED") => {
    if (!selectedDoc) return;

    startTransition(async () => {
      const res = await decideDocumentApprovalAction({
        requestId: selectedDoc.id,
        decision,
        comment: decisionComment.trim() || undefined,
      });

      if (res.ok) {
        toast.success(
          decision === "APPROVED"
            ? t("document.approveSuccess")
            : t("document.rejectSuccess"),
        );
        setDetailModalOpen(false);
        setSelectedDoc(null);
        setDecisionComment("");
        await refreshItems();
      } else {
        toast.error(res.error.message || t("common.error"));
      }
    });
  };

  const openDetail = (doc: DocumentRequestDto) => {
    setSelectedDoc(doc);
    setDecisionComment("");
    setDetailModalOpen(true);
  };

  const canUserApproveCurrentStep = (doc: DocumentRequestDto) => {
    if (!canApprove) return false;
    if (doc.status !== "PENDING") return false;
    const currentApproval = doc.approvals.find((a) => a.stepOrder === doc.currentStep);
    if (!currentApproval) return false;
    return canManage || currentApproval.approverId === currentUserId;
  };

  const columns: DataTableColumn<DocumentRequestDto>[] = [
    {
      key: "docNumber",
      header: t("document.docNumber"),
      className: "font-mono text-xs font-semibold text-primary",
      render: (row) => <span>{row.docNumber}</span>,
    },
    {
      key: "title",
      header: t("document.titleField"),
      render: (row) => (
        <div>
          <span className="font-medium text-foreground block">{row.title}</span>
          <span className="text-xs text-muted-foreground">
            {t(`document.type.${row.docType}` as never) || row.docType}
          </span>
        </div>
      ),
    },
    {
      key: "requester",
      header: t("document.requester"),
      render: (row) => (
        <div className="text-xs">
          <p className="font-medium">{row.requesterName}</p>
          <p className="text-muted-foreground">{row.requesterEmail}</p>
        </div>
      ),
    },
    {
      key: "approvalChain",
      header: t("document.approvalFlow"),
      render: (row) => (
        <div className="flex items-center gap-1.5 flex-wrap">
          {row.approvals.map((a) => {
            const isDone = a.decision === "APPROVED";
            const isReject = a.decision === "REJECTED";
            const isCurrent = row.status === "PENDING" && a.stepOrder === row.currentStep;

            return (
              <span
                key={a.id}
                className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs border ${
                  isDone
                    ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-700 dark:text-emerald-400"
                    : isReject
                    ? "bg-rose-500/10 border-rose-500/30 text-rose-700 dark:text-rose-400"
                    : isCurrent
                    ? "bg-amber-500/15 border-amber-500/40 text-amber-800 dark:text-amber-300 font-semibold ring-1 ring-amber-500/30"
                    : "bg-muted/40 border-border text-muted-foreground"
                }`}
                title={`${a.approverName} (${a.decision})`}
              >
                {isDone ? (
                  <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                ) : isReject ? (
                  <XCircle className="w-3 h-3 text-rose-600" />
                ) : (
                  <Clock className="w-3 h-3 text-amber-600" />
                )}
                {a.approverName.split(" ")[0]}
              </span>
            );
          })}
        </div>
      ),
    },
    {
      key: "status",
      header: t("document.statusField"),
      render: (row) => {
        const toneMap: Record<string, "warn" | "ok" | "bad" | "off"> = {
          PENDING: "warn",
          APPROVED: "ok",
          REJECTED: "bad",
          CANCELLED: "off",
        };
        return (
          <StatusPill tone={toneMap[row.status] || "off"}>
            {t(`document.status.${row.status}` as never) || row.status}
          </StatusPill>
        );
      },
    },
    {
      key: "createdAt",
      header: t("document.date"),
      className: "nowrap text-muted-foreground text-xs",
      render: (row) => <span>{formatDate(new Date(row.createdAt), locale)}</span>,
    },
    {
      key: "actions",
      header: t("common.actions"),
      className: "nowrap text-right",
      render: (row) => (
        <div className="flex items-center justify-end gap-2">
          {canUserApproveCurrentStep(row) && (
            <Button
              size="sm"
              variant="default"
              className="h-8 gap-1 bg-amber-600 hover:bg-amber-700 text-white text-xs"
              onClick={() => openDetail(row)}
            >
              <Clock className="w-3.5 h-3.5" />
              {t("document.waitingYourApproval")}
            </Button>
          )}
          <Button
            size="sm"
            variant="outline"
            className="h-8 gap-1 text-xs"
            onClick={() => openDetail(row)}
          >
            <Eye className="w-3.5 h-3.5" />
            {t("common.view")}
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{t("document.title")}</h1>
          <p className="text-sm text-muted-foreground">{t("document.subtitle")}</p>
        </div>
        {canCreate && (
          <Button onClick={handleOpenCreate} className="gap-2">
            <Plus className="h-4 w-4" />
            {t("document.create")}
          </Button>
        )}
      </div>

      <LiyonCard>
        <DataTable<DocumentRequestDto>
          headHeading={<span>{t("document.title")}</span>}
          state={items.length === 0 ? "empty" : "data"}
          rows={items}
          columns={columns}
          getRowId={(row) => row.id}
          empty={{
            icon: <FileText className="h-10 w-10 text-muted-foreground/50" />,
            title: t("document.empty"),
            description: t("document.subtitle"),
          }}
          error={{
            icon: <AlertCircle className="h-10 w-10 text-destructive" />,
            title: t("common.error"),
          }}
        />
      </LiyonCard>

      {/* Modal ยื่นคำขอเอกสารใหม่ */}
      <LiyonDialog open={createModalOpen} onOpenChange={setCreateModalOpen} wide>
        <LiyonDialogHeader
          title={t("document.create")}
          description={t("document.subtitle")}
        />
        <LiyonDialogBody>
          <div className="space-y-4 py-2">
            <LiyonField label={t("document.titleField")}>
              <input
                className="w-full rounded border px-3 py-2 text-sm"
                value={formTitle}
                onChange={(e) => setFormTitle(e.target.value)}
                placeholder="เช่น ขออนุมัติจัดโครงการสัมมนาเชิงวิชาการประจำปี"
              />
            </LiyonField>

            <LiyonField label={t("document.typeField")}>
              <LiyonSelect
                value={formDocType}
                onChange={(e) => setFormDocType(e.target.value)}
              >
                <option value="PROJECT">{t("document.type.PROJECT")}</option>
                <option value="OFFICIAL_TRAVEL">{t("document.type.OFFICIAL_TRAVEL")}</option>
                <option value="LEAVE">{t("document.type.LEAVE")}</option>
                <option value="PROCUREMENT">{t("document.type.PROCUREMENT")}</option>
                <option value="GENERAL">{t("document.type.GENERAL")}</option>
              </LiyonSelect>
            </LiyonField>

            <div className="space-y-2 pt-2 border-t">
              <label className="text-sm font-medium">{t("document.approvers")}</label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <LiyonField label={`${t("document.step")} 1 (หัวหน้างาน / รองคณบดี)`}>
                  <LiyonSelect
                    value={selectedApprover1}
                    onChange={(e) => setSelectedApprover1(e.target.value)}
                  >
                    {eligibleApprovers.map((u) => (
                      <option key={u.id} value={u.id}>
                        {u.name} ({u.email})
                      </option>
                    ))}
                  </LiyonSelect>
                </LiyonField>

                <LiyonField label={`${t("document.step")} 2 (คณบดี)`}>
                  <LiyonSelect
                    value={selectedApprover2}
                    onChange={(e) => setSelectedApprover2(e.target.value)}
                  >
                    <option value="">-- ไม่ระบุลำดับที่ 2 --</option>
                    {eligibleApprovers.map((u) => (
                      <option key={u.id} value={u.id}>
                        {u.name} ({u.email})
                      </option>
                    ))}
                  </LiyonSelect>
                </LiyonField>
              </div>
            </div>
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
            {t("document.create")}
          </Button>
        </LiyonDialogFooter>
      </LiyonDialog>

      {/* Modal ดูรายละเอียดและพิจารณาอนุมัติ */}
      <LiyonDialog
        open={detailModalOpen}
        onOpenChange={(open) => !open && setDetailModalOpen(false)}
        wide
      >
        <LiyonDialogHeader
          title={selectedDoc?.title || t("document.title")}
          description={`${t("document.docNumber")}: ${selectedDoc?.docNumber}`}
        />
        <LiyonDialogBody>
          {selectedDoc && (
            <div className="space-y-6 py-2">
              <div className="grid grid-cols-2 gap-4 text-sm bg-muted/30 p-3 rounded border">
                <div>
                  <span className="text-muted-foreground">{t("document.typeField")}: </span>
                  <span className="font-medium">
                    {t(`document.type.${selectedDoc.docType}` as never) || selectedDoc.docType}
                  </span>
                </div>
                <div>
                  <span className="text-muted-foreground">{t("document.requester")}: </span>
                  <span className="font-medium">
                    {selectedDoc.requesterName} ({selectedDoc.requesterEmail})
                  </span>
                </div>
                <div>
                  <span className="text-muted-foreground">{t("document.date")}: </span>
                  <span>{formatDate(new Date(selectedDoc.createdAt), locale)}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">{t("document.statusField")}: </span>
                  <span className="font-medium">
                    {t(`document.status.${selectedDoc.status}` as never) || selectedDoc.status}
                  </span>
                </div>
              </div>

              {/* Timeline Steps */}
              <div>
                <h4 className="text-sm font-semibold mb-3">{t("document.approvalFlow")}</h4>
                <div className="space-y-3">
                  {selectedDoc.approvals.map((a) => {
                    const isDone = a.decision === "APPROVED";
                    const isReject = a.decision === "REJECTED";
                    const isCurrent =
                      selectedDoc.status === "PENDING" && a.stepOrder === selectedDoc.currentStep;

                    return (
                      <div
                        key={a.id}
                        className={`flex items-start gap-3 p-3 rounded-lg border ${
                          isDone
                            ? "bg-emerald-500/5 border-emerald-500/20"
                            : isReject
                            ? "bg-rose-500/5 border-rose-500/20"
                            : isCurrent
                            ? "bg-amber-500/10 border-amber-500/30 ring-1 ring-amber-500/20"
                            : "bg-muted/20 border-border"
                        }`}
                      >
                        <div className="mt-0.5">
                          {isDone ? (
                            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                          ) : isReject ? (
                            <XCircle className="w-5 h-5 text-rose-600" />
                          ) : (
                            <Clock className="w-5 h-5 text-amber-600" />
                          )}
                        </div>
                        <div className="flex-1 text-sm">
                          <div className="flex items-center justify-between">
                            <p className="font-semibold text-foreground">
                              {t("document.step")} {a.stepOrder}: {a.approverName}
                            </p>
                            <span className="text-xs text-muted-foreground">
                              {a.actionAt ? formatDate(new Date(a.actionAt), locale) : "—"}
                            </span>
                          </div>
                          <p className="text-xs text-muted-foreground">{a.approverEmail}</p>
                          {a.comment && (
                            <p className="mt-1 text-xs italic bg-background/80 p-1.5 rounded border border-border/50">
                              &ldquo;{a.comment}&rdquo;
                            </p>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Decision Section if current step approver */}
              {canUserApproveCurrentStep(selectedDoc) && (
                <div className="p-4 rounded-lg border border-amber-500/30 bg-amber-500/5 space-y-3">
                  <h4 className="text-sm font-semibold text-amber-800 dark:text-amber-300">
                    {t("document.decisionConfirm")}
                  </h4>
                  <LiyonField label={t("document.comment")}>
                    <textarea
                      rows={2}
                      className="w-full rounded border px-3 py-2 text-sm bg-background"
                      value={decisionComment}
                      onChange={(e) => setDecisionComment(e.target.value)}
                      placeholder="ระบุความเห็นหรือข้อเสนอแนะเพิ่มเติม..."
                    />
                  </LiyonField>
                  <div className="flex items-center justify-end gap-2 pt-2">
                    <Button
                      variant="destructive"
                      onClick={() => handleDecision("REJECTED")}
                      disabled={isPending}
                    >
                      <XCircle className="w-4 h-4 mr-1.5" />
                      {t("document.reject")}
                    </Button>
                    <Button
                      className="bg-emerald-600 hover:bg-emerald-700 text-white"
                      onClick={() => handleDecision("APPROVED")}
                      disabled={isPending}
                    >
                      <CheckCircle2 className="w-4 h-4 mr-1.5" />
                      {t("document.approve")}
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}
        </LiyonDialogBody>
        <LiyonDialogFooter>
          <Button variant="outline" onClick={() => setDetailModalOpen(false)}>
            {t("common.close")}
          </Button>
        </LiyonDialogFooter>
      </LiyonDialog>
    </div>
  );
}
