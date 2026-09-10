"use client";

import { useState, useTransition } from "react";
import { QrCode, CheckCircle2, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { useT } from "@/shared/lib/i18n/client";
import { Button } from "@/components/ui/button";
import { LiyonCard } from "@/shared/components/liyon";
import { checkInAttendanceAction } from "@/features/attendance/actions";

export function ScanClient() {
  const t = useT();
  const [token, setToken] = useState("");
  const [sessionId, setSessionId] = useState("");
  const [isPending, startTransition] = useTransition();
  const [success, setSuccess] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!token.trim() || !sessionId.trim()) {
      toast.error(t("error.validation"));
      return;
    }

    startTransition(async () => {
      const res = await checkInAttendanceAction({
        sessionId: sessionId.trim(),
        qrToken: token.trim().toUpperCase(),
      });

      if (res.ok) {
        toast.success(t("attendance.checkInSuccess"));
        setSuccess(true);
      } else {
        if (res.error.message.includes("attendance.tokenExpired")) {
          toast.error(t("attendance.tokenExpired"));
        } else if (res.error.message.includes("attendance.alreadyChecked")) {
          toast.error(t("attendance.alreadyChecked"));
        } else {
          toast.error(res.error.message || t("common.error"));
        }
      }
    });
  };

  return (
    <LiyonCard className="p-6 md:p-8 shadow-lg border-2 border-primary/20">
      <div className="text-center mb-6">
        <div className="w-14 h-14 bg-primary/10 text-primary rounded-2xl flex items-center justify-center mx-auto mb-3">
          <QrCode className="w-7 h-7" />
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          {t("attendance.scanTitle")}
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          กรอกรหัส Dynamic Token จากหน้าจอโปรเจกเตอร์ของผู้สอนเพื่อเช็คชื่อ
        </p>
      </div>

      {success ? (
        <div className="p-6 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-center space-y-3">
          <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto" />
          <h3 className="text-lg font-bold text-emerald-800 dark:text-emerald-300">
            {t("attendance.checkInSuccess")}
          </h3>
          <p className="text-xs text-muted-foreground">
            ระบบได้บันทึกเวลาเข้าเรียนและ IP Address ของคุณเรียบร้อยแล้ว
          </p>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setSuccess(false);
              setToken("");
            }}
          >
            เช็คชื่อคาบอื่น
          </Button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-muted-foreground mb-1 uppercase tracking-wider">
              รหัสคาบเรียน (Session UUID)
            </label>
            <input
              type="text"
              required
              placeholder="ระบุ Session ID จากหน้าจอผู้สอน"
              value={sessionId}
              onChange={(e) => setSessionId(e.target.value)}
              className="w-full rounded-lg border px-3 py-2 text-sm bg-background focus:ring-2 focus:ring-primary outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-muted-foreground mb-1 uppercase tracking-wider">
              {t("attendance.tokenField")}
            </label>
            <input
              type="text"
              required
              maxLength={12}
              placeholder="เช่น A1B2C3D4"
              value={token}
              onChange={(e) => setToken(e.target.value)}
              className="w-full rounded-lg border-2 border-primary/30 px-4 py-3 text-center text-2xl font-mono font-bold tracking-widest uppercase bg-background focus:border-primary outline-none"
            />
          </div>

          <Button
            type="submit"
            className="w-full gap-2 py-6 text-base font-semibold"
            disabled={isPending}
          >
            <ShieldCheck className="w-5 h-5" />
            {t("attendance.checkInBtn")}
          </Button>
        </form>
      )}
    </LiyonCard>
  );
}
