"use client";

import { useState, useTransition } from "react";
import {
  Plus,
  QrCode,
  Users,
  RefreshCw,
  Clock,
  AlertTriangle,
  Building,
  Calendar,
} from "lucide-react";
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
import type { ClassroomSessionDto } from "@/features/attendance";
import {
  createSessionAction,
  rotateSessionQrAction,
  getSessionsAction,
  getSessionDetailAction,
  updateAttendanceStatusAction,
} from "@/features/attendance/actions";

interface Props {
  initialSessions: ClassroomSessionDto[];
  courses: Array<{ id: string; code: string; titleTh: string; titleEn: string }>;
  currentUserId: string;
  canManage: boolean;
}

export function AttendanceClient({
  initialSessions,
  courses,
  currentUserId: _currentUserId,
  canManage: _canManage,
}: Props) {
  const t = useT();
  const locale = useLocale();
  const [sessions, setSessions] = useState<ClassroomSessionDto[]>(initialSessions);
  const [isPending, startTransition] = useTransition();

  // Dialog states
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [qrModalOpen, setQrModalOpen] = useState(false);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [activeSession, setActiveSession] = useState<ClassroomSessionDto | null>(null);

  // Form states
  const [formCourseId, setFormCourseId] = useState(courses[0]?.id || "");
  const [formRoom, setFormRoom] = useState("ห้อง 401");
  const [formDate, setFormDate] = useState(() => new Date().toISOString().split("T")[0]);
  const [formStartTime, setFormStartTime] = useState("09:00");
  const [formEndTime, setFormEndTime] = useState("12:00");

  const refreshSessions = async () => {
    const res = await getSessionsAction();
    if (res.ok) {
      setSessions(res.data);
      if (activeSession) {
        const found = res.data.find((s) => s.id === activeSession.id);
        if (found) setActiveSession(found);
      }
    }
  };

  const handleOpenCreate = () => {
    setFormCourseId(courses[0]?.id || "");
    setFormDate(new Date().toISOString().split("T")[0]);
    setFormStartTime("09:00");
    setFormEndTime("12:00");
    setCreateModalOpen(true);
  };

  const handleCreate = () => {
    if (!formCourseId || !formDate || !formStartTime || !formEndTime) {
      toast.error(t("error.validation"));
      return;
    }

    startTransition(async () => {
      const res = await createSessionAction({
        courseId: formCourseId,
        roomNumber: formRoom.trim() || undefined,
        sessionDate: formDate,
        startTime: formStartTime,
        endTime: formEndTime,
      });

      if (res.ok) {
        toast.success(t("common.saveSuccess"));
        setCreateModalOpen(false);
        await refreshSessions();
      } else {
        toast.error(res.error.message || t("common.error"));
      }
    });
  };

  const handleOpenQr = (session: ClassroomSessionDto) => {
    setActiveSession(session);
    setQrModalOpen(true);
  };

  const handleRotateQr = () => {
    if (!activeSession) return;

    startTransition(async () => {
      const res = await rotateSessionQrAction(activeSession.id);
      if (res.ok) {
        setActiveSession(res.data);
        toast.success("เปลี่ยนรหัส QR เรียบร้อยแล้ว");
        await refreshSessions();
      } else {
        toast.error(res.error.message || t("common.error"));
      }
    });
  };

  const handleOpenDetail = async (session: ClassroomSessionDto) => {
    setActiveSession(session);
    const res = await getSessionDetailAction(session.id);
    if (res.ok && res.data) {
      setActiveSession(res.data);
    }
    setDetailModalOpen(true);
  };

  const handleUpdateRecordStatus = (recordId: string, status: "PRESENT" | "LATE" | "ABSENT" | "EXCUSED") => {
    startTransition(async () => {
      const res = await updateAttendanceStatusAction({
        recordId,
        status,
      });

      if (res.ok && activeSession) {
        toast.success(t("common.saveSuccess"));
        const updated = await getSessionDetailAction(activeSession.id);
        if (updated.ok && updated.data) {
          setActiveSession(updated.data);
        }
        await refreshSessions();
      }
    });
  };

  const columns: DataTableColumn<ClassroomSessionDto>[] = [
    {
      key: "course",
      header: t("attendance.course"),
      render: (row) => (
        <div>
          <span className="font-mono text-xs font-semibold text-primary block">
            {row.courseCode}
          </span>
          <span className="font-medium text-foreground text-sm">
            {locale === "th" ? row.courseTitleTh : row.courseTitleEn}
          </span>
        </div>
      ),
    },
    {
      key: "schedule",
      header: t("attendance.time"),
      render: (row) => (
        <div className="text-xs">
          <p className="font-medium text-foreground">{row.sessionDate}</p>
          <p className="text-muted-foreground inline-flex items-center gap-1">
            <Clock className="w-3 h-3" /> {row.startTime} - {row.endTime}
          </p>
        </div>
      ),
    },
    {
      key: "room",
      header: t("attendance.room"),
      render: (row) => (
        <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
          <Building className="w-3 h-3" /> {row.roomNumber || "—"}
        </span>
      ),
    },
    {
      key: "stats",
      header: t("attendance.presentCount"),
      render: (row) => (
        <div className="flex items-center gap-2">
          <StatusPill tone={row.presentCount > 0 ? "ok" : "warn"}>
            {row.presentCount} คน
          </StatusPill>
        </div>
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
            variant="default"
            className="h-8 gap-1 text-xs bg-indigo-600 hover:bg-indigo-700 text-white"
            onClick={() => handleOpenQr(row)}
          >
            <QrCode className="w-3.5 h-3.5" />
            {t("attendance.qrDisplay")}
          </Button>
          <Button
            size="sm"
            variant="outline"
            className="h-8 gap-1 text-xs"
            onClick={() => handleOpenDetail(row)}
          >
            <Users className="w-3.5 h-3.5" />
            {t("attendance.totalStudents")}
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{t("attendance.title")}</h1>
          <p className="text-sm text-muted-foreground">{t("attendance.subtitle")}</p>
        </div>
        <Button onClick={handleOpenCreate} className="gap-2">
          <Plus className="h-4 w-4" />
          {t("attendance.createSession")}
        </Button>
      </div>

      <LiyonCard>
        <DataTable<ClassroomSessionDto>
          headHeading={<span>{t("attendance.sessionList")}</span>}
          state={sessions.length === 0 ? "empty" : "data"}
          rows={sessions}
          columns={columns}
          getRowId={(row) => row.id}
          empty={{
            icon: <Calendar className="h-10 w-10 text-muted-foreground/50" />,
            title: t("attendance.empty"),
            description: t("attendance.subtitle"),
          }}
          error={{
            icon: <AlertTriangle className="h-10 w-10 text-destructive" />,
            title: t("common.error"),
          }}
        />
      </LiyonCard>

      {/* Modal เปิดคาบเรียนใหม่ */}
      <LiyonDialog open={createModalOpen} onOpenChange={setCreateModalOpen}>
        <LiyonDialogHeader
          title={t("attendance.createSession")}
          description={t("attendance.subtitle")}
        />
        <LiyonDialogBody>
          <div className="space-y-4 py-2">
            <LiyonField label={t("attendance.course")}>
              <LiyonSelect
                value={formCourseId}
                onChange={(e) => setFormCourseId(e.target.value)}
              >
                {courses.map((c) => (
                  <option key={c.id} value={c.id}>
                    [{c.code}] {locale === "th" ? c.titleTh : c.titleEn}
                  </option>
                ))}
              </LiyonSelect>
            </LiyonField>

            <LiyonField label={t("attendance.room")}>
              <input
                className="w-full rounded border px-3 py-2 text-sm"
                value={formRoom}
                onChange={(e) => setFormRoom(e.target.value)}
                placeholder="เช่น ห้อง 401 หรือ Lab 2"
              />
            </LiyonField>

            <LiyonField label={t("attendance.date")}>
              <input
                type="date"
                className="w-full rounded border px-3 py-2 text-sm"
                value={formDate}
                onChange={(e) => setFormDate(e.target.value)}
              />
            </LiyonField>

            <div className="grid grid-cols-2 gap-3">
              <LiyonField label="เวลาเริ่มต้น">
                <input
                  type="time"
                  className="w-full rounded border px-3 py-2 text-sm"
                  value={formStartTime}
                  onChange={(e) => setFormStartTime(e.target.value)}
                />
              </LiyonField>
              <LiyonField label="เวลาสิ้นสุด">
                <input
                  type="time"
                  className="w-full rounded border px-3 py-2 text-sm"
                  value={formEndTime}
                  onChange={(e) => setFormEndTime(e.target.value)}
                />
              </LiyonField>
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
            {t("sample.save")}
          </Button>
        </LiyonDialogFooter>
      </LiyonDialog>

      {/* Modal จอฉาย QR Code สำหรับโปรเจกเตอร์ */}
      <LiyonDialog
        open={qrModalOpen}
        onOpenChange={(open) => !open && setQrModalOpen(false)}
        wide
      >
        <LiyonDialogHeader
          title={`[${activeSession?.courseCode}] ${locale === "th" ? activeSession?.courseTitleTh : activeSession?.courseTitleEn}`}
          description={`${activeSession?.sessionDate} (${activeSession?.startTime} - ${activeSession?.endTime}) ห้อง ${activeSession?.roomNumber || "—"}`}
        />
        <LiyonDialogBody>
          {activeSession && (
            <div className="py-4 flex flex-col items-center justify-center text-center space-y-6">
              {/* Box แสดง QR และ Token */}
              <div className="p-8 bg-white dark:bg-slate-900 border-2 border-primary/40 rounded-2xl shadow-xl flex flex-col items-center max-w-sm w-full">
                <div className="w-52 h-52 bg-slate-100 dark:bg-slate-800 rounded-xl border flex flex-col items-center justify-center p-4 relative overflow-hidden">
                  <QrCode className="w-40 h-40 text-slate-800 dark:text-slate-100" />
                  <div className="absolute inset-x-0 bottom-1 bg-primary/90 text-white text-[10px] font-mono py-0.5 tracking-wider">
                    DYNAMIC ANTI-SPOOF
                  </div>
                </div>

                <div className="mt-4 text-center">
                  <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">
                    {t("attendance.tokenField")}
                  </p>
                  <p className="text-3xl font-black font-mono tracking-widest text-primary mt-1 select-all bg-primary/10 px-4 py-1.5 rounded-lg border border-primary/20">
                    {activeSession.qrToken || "EXPIRED"}
                  </p>
                  <p className="text-[11px] text-muted-foreground mt-2">
                    นักศึกษาสแกนหรือเข้าลิงก์: <span className="font-semibold text-foreground">/portal/attendance/scan</span>
                  </p>
                </div>
              </div>

              {/* Progress and status */}
              <div className="flex items-center gap-6">
                <div className="text-center">
                  <span className="text-xs text-muted-foreground block">{t("attendance.presentCount")}</span>
                  <span className="text-2xl font-bold text-emerald-600">
                    {activeSession.presentCount} คน
                  </span>
                </div>
                <div className="h-8 w-px bg-border" />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleRotateQr}
                  disabled={isPending}
                  className="gap-2"
                >
                  <RefreshCw className={`w-4 h-4 ${isPending ? "animate-spin" : ""}`} />
                  หมุนเวียน QR Code ใหม่
                </Button>
              </div>

              <p className="text-xs text-muted-foreground max-w-md">
                {t("attendance.qrRotateNotice")}
              </p>
            </div>
          )}
        </LiyonDialogBody>
        <LiyonDialogFooter>
          <Button variant="outline" onClick={() => setQrModalOpen(false)}>
            {t("common.close")}
          </Button>
        </LiyonDialogFooter>
      </LiyonDialog>

      {/* Modal ดูและปรับสถานะการเข้าเรียนรายบุคคล */}
      <LiyonDialog
        open={detailModalOpen}
        onOpenChange={(open) => !open && setDetailModalOpen(false)}
        wide
      >
        <LiyonDialogHeader
          title={`รายชื่อนักศึกษา — ${activeSession?.courseCode}`}
          description={`วันที่ ${activeSession?.sessionDate} (${activeSession?.startTime} - ${activeSession?.endTime})`}
        />
        <LiyonDialogBody>
          {activeSession && (
            <div className="space-y-4 py-2">
              <div className="flex items-center justify-between text-sm bg-muted/30 p-3 rounded border">
                <span>ยอดผู้เข้าเรียนทั้งหมด: <strong>{activeSession.records?.length || 0} คน</strong></span>
                <span className="text-emerald-600 font-semibold">มาเรียนแล้ว: {activeSession.presentCount} คน</span>
              </div>

              <div className="max-h-[350px] overflow-y-auto border rounded divide-y">
                {(!activeSession.records || activeSession.records.length === 0) ? (
                  <div className="p-6 text-center text-muted-foreground text-sm">
                    {t("attendance.empty")} (ยังไม่มีนักศึกษาเช็คชื่อ)
                  </div>
                ) : (
                  activeSession.records.map((r) => (
                    <div key={r.id} className="p-3 flex items-center justify-between gap-3 hover:bg-muted/10">
                      <div>
                        <p className="font-medium text-sm text-foreground">{r.studentName}</p>
                        <p className="text-xs text-muted-foreground">
                          {r.studentEmail} • เวลาเช็ค: {formatDate(new Date(r.checkedAt), locale)}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <StatusPill tone={r.status === "PRESENT" ? "ok" : r.status === "LATE" ? "warn" : "bad"}>
                          {t(`attendance.status.${r.status}` as never) || r.status}
                        </StatusPill>

                        {/* Quick switch */}
                        <select
                          className="text-xs border rounded px-2 py-1 bg-background"
                          value={r.status}
                          onChange={(e) =>
                            handleUpdateRecordStatus(
                              r.id,
                              e.target.value as "PRESENT" | "LATE" | "ABSENT" | "EXCUSED",
                            )
                          }
                        >
                          <option value="PRESENT">{t("attendance.status.PRESENT")}</option>
                          <option value="LATE">{t("attendance.status.LATE")}</option>
                          <option value="ABSENT">{t("attendance.status.ABSENT")}</option>
                          <option value="EXCUSED">{t("attendance.status.EXCUSED")}</option>
                        </select>
                      </div>
                    </div>
                  ))
                )}
              </div>
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
