"use client";

import { useState, useTransition } from "react";
import { Plus, Calendar, Check, X, Building, Car, AlertCircle, Users, Phone } from "lucide-react";
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
import type { ReservationDto, ResourceDto } from "@/features/booking";
import {
  createReservationAction,
  decideReservationAction,
  getReservationsAction,
} from "@/features/booking/actions";

interface Props {
  initialReservations: ReservationDto[];
  initialResources: ResourceDto[];
  currentUserId: string;
  canCreate: boolean;
  canApprove: boolean;
  canManage: boolean;
}

export function BookingClient({
  initialReservations,
  initialResources,
  currentUserId: _currentUserId,
  canCreate,
  canApprove,
  canManage: _canManage,
}: Props) {
  const t = useT();
  const locale = useLocale();
  const [reservations, setReservations] = useState<ReservationDto[]>(initialReservations);
  const [resources] = useState<ResourceDto[]>(initialResources);
  const [isPending, startTransition] = useTransition();

  // Dialog states
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [rejectingItem, setRejectingItem] = useState<ReservationDto | null>(null);
  const [rejectReason, setRejectReason] = useState("");

  // Create form state
  const [formResourceId, setFormResourceId] = useState(initialResources[0]?.id || "");
  const [formTitle, setFormTitle] = useState("");
  const [formStartTime, setFormStartTime] = useState("");
  const [formEndTime, setFormEndTime] = useState("");
  const [formAttendees, setFormAttendees] = useState(1);
  const [formPhone, setFormPhone] = useState("");

  const refreshReservations = async () => {
    const res = await getReservationsAction();
    if (res.ok) {
      setReservations(res.data);
    }
  };

  const handleOpenCreate = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(9, 0, 0, 0);

    const tomorrowEnd = new Date(tomorrow);
    tomorrowEnd.setHours(12, 0, 0, 0);

    const pad = (n: number) => String(n).padStart(2, "0");
    const toInputString = (d: Date) =>
      `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;

    setFormStartTime(toInputString(tomorrow));
    setFormEndTime(toInputString(tomorrowEnd));
    setFormTitle("");
    setFormAttendees(1);
    setFormPhone("");
    setCreateModalOpen(true);
  };

  const handleCreate = () => {
    if (!formResourceId || !formTitle.trim() || !formStartTime || !formEndTime) {
      toast.error(t("error.validation"));
      return;
    }

    startTransition(async () => {
      const res = await createReservationAction({
        resourceId: formResourceId,
        title: formTitle.trim(),
        startTime: new Date(formStartTime).toISOString(),
        endTime: new Date(formEndTime).toISOString(),
        attendeesCount: Number(formAttendees) || 1,
        contactPhone: formPhone.trim() || undefined,
      });

      if (res.ok) {
        toast.success(t("booking.createSuccess"));
        setCreateModalOpen(false);
        await refreshReservations();
      } else {
        if (res.error.message.includes("booking.conflict")) {
          toast.error(t("booking.conflict"));
        } else {
          toast.error(res.error.message || t("common.error"));
        }
      }
    });
  };

  const handleApprove = (reservation: ReservationDto) => {
    startTransition(async () => {
      const res = await decideReservationAction({
        reservationId: reservation.id,
        decision: "APPROVED",
      });

      if (res.ok) {
        toast.success(t("booking.approveSuccess"));
        await refreshReservations();
      } else {
        toast.error(res.error.message || t("common.error"));
      }
    });
  };

  const handleOpenReject = (reservation: ReservationDto) => {
    setRejectingItem(reservation);
    setRejectReason("");
    setRejectModalOpen(true);
  };

  const handleConfirmReject = () => {
    if (!rejectingItem) return;

    startTransition(async () => {
      const res = await decideReservationAction({
        reservationId: rejectingItem.id,
        decision: "REJECTED",
        rejectReason: rejectReason.trim() || undefined,
      });

      if (res.ok) {
        toast.success(t("booking.rejectSuccess"));
        setRejectModalOpen(false);
        setRejectingItem(null);
        await refreshReservations();
      } else {
        toast.error(res.error.message || t("common.error"));
      }
    });
  };

  const columns: DataTableColumn<ReservationDto>[] = [
    {
      key: "resource",
      header: t("booking.resource"),
      render: (row) => {
        const isRoom = row.resourceType === "ROOM";
        return (
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-md bg-muted flex items-center justify-center text-muted-foreground shrink-0">
              {isRoom ? <Building className="w-4 h-4" /> : <Car className="w-4 h-4" />}
            </div>
            <div>
              <p className="font-semibold text-foreground text-sm">
                {locale === "th" ? row.resourceNameTh : row.resourceNameEn}
              </p>
              <p className="text-xs text-muted-foreground">{row.locationOrPlate}</p>
            </div>
          </div>
        );
      },
    },
    {
      key: "title",
      header: t("booking.titleField"),
      render: (row) => (
        <div>
          <span className="font-medium text-foreground block">{row.title}</span>
          <span className="text-xs text-muted-foreground inline-flex items-center gap-1">
            <Users className="w-3 h-3" /> {row.attendeesCount} คน
          </span>
        </div>
      ),
    },
    {
      key: "booker",
      header: t("booking.booker"),
      render: (row) => (
        <div className="text-xs">
          <p className="font-medium">{row.userName}</p>
          {row.contactPhone ? (
            <p className="text-muted-foreground inline-flex items-center gap-1">
              <Phone className="w-3 h-3" /> {row.contactPhone}
            </p>
          ) : (
            <p className="text-muted-foreground">{row.userEmail}</p>
          )}
        </div>
      ),
    },
    {
      key: "schedule",
      header: `${t("booking.startTime")} - ${t("booking.endTime")}`,
      className: "nowrap text-xs",
      render: (row) => {
        const start = new Date(row.startTime);
        const end = new Date(row.endTime);
        return (
          <div>
            <p className="font-medium">{formatDate(start, locale)}</p>
            <p className="text-muted-foreground">
              {start.toLocaleTimeString(locale === "th" ? "th-TH" : "en-US", {
                hour: "2-digit",
                minute: "2-digit",
              })}{" "}
              -{" "}
              {end.toLocaleTimeString(locale === "th" ? "th-TH" : "en-US", {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </p>
          </div>
        );
      },
    },
    {
      key: "status",
      header: t("booking.status"),
      render: (row) => {
        const toneMap: Record<string, "warn" | "ok" | "bad" | "off"> = {
          PENDING: "warn",
          APPROVED: "ok",
          REJECTED: "bad",
          CANCELLED: "off",
        };
        return (
          <StatusPill tone={toneMap[row.status] || "off"}>
            {t(`booking.status.${row.status}` as never) || row.status}
          </StatusPill>
        );
      },
    },
    {
      key: "actions",
      header: t("common.actions"),
      className: "nowrap text-right",
      render: (row) => {
        if (row.status === "PENDING" && canApprove) {
          return (
            <div className="flex items-center justify-end gap-1.5">
              <Button
                size="sm"
                variant="outline"
                className="h-8 gap-1 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 text-xs"
                onClick={() => handleApprove(row)}
                disabled={isPending}
              >
                <Check className="w-3.5 h-3.5" />
                {t("booking.approve")}
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="h-8 gap-1 text-rose-600 hover:text-rose-700 hover:bg-rose-50 text-xs"
                onClick={() => handleOpenReject(row)}
                disabled={isPending}
              >
                <X className="w-3.5 h-3.5" />
                {t("booking.reject")}
              </Button>
            </div>
          );
        }
        return <span className="text-muted-foreground text-xs">—</span>;
      },
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{t("booking.title")}</h1>
          <p className="text-sm text-muted-foreground">{t("booking.subtitle")}</p>
        </div>
        {canCreate && (
          <Button onClick={handleOpenCreate} className="gap-2">
            <Plus className="h-4 w-4" />
            {t("booking.create")}
          </Button>
        )}
      </div>

      <LiyonCard>
        <DataTable<ReservationDto>
          headHeading={<span>{t("booking.title")}</span>}
          state={reservations.length === 0 ? "empty" : "data"}
          rows={reservations}
          columns={columns}
          getRowId={(row) => row.id}
          empty={{
            icon: <Calendar className="h-10 w-10 text-muted-foreground/50" />,
            title: t("booking.empty"),
            description: t("booking.subtitle"),
          }}
          error={{
            icon: <AlertCircle className="h-10 w-10 text-destructive" />,
            title: t("common.error"),
          }}
        />
      </LiyonCard>

      {/* Modal จองห้อง/ยานพาหนะ */}
      <LiyonDialog open={createModalOpen} onOpenChange={setCreateModalOpen} wide>
        <LiyonDialogHeader
          title={t("booking.create")}
          description={t("booking.subtitle")}
        />
        <LiyonDialogBody>
          <div className="space-y-4 py-2">
            <LiyonField label={t("booking.resource")}>
              <LiyonSelect
                value={formResourceId}
                onChange={(e) => setFormResourceId(e.target.value)}
              >
                {resources.map((r) => (
                  <option key={r.id} value={r.id}>
                    [{r.type === "ROOM" ? t("booking.room") : t("booking.vehicle")}] {locale === "th" ? r.nameTh : r.nameEn} ({r.locationOrPlate} - จุ {r.capacity} คน)
                  </option>
                ))}
              </LiyonSelect>
            </LiyonField>

            <LiyonField label={t("booking.titleField")}>
              <input
                className="w-full rounded border px-3 py-2 text-sm"
                value={formTitle}
                onChange={(e) => setFormTitle(e.target.value)}
                placeholder="เช่น การประชุมคณะกรรมการประจำคณะ วาระพิเศษ"
              />
            </LiyonField>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <LiyonField label={t("booking.startTime")}>
                <input
                  type="datetime-local"
                  className="w-full rounded border px-3 py-2 text-sm"
                  value={formStartTime}
                  onChange={(e) => setFormStartTime(e.target.value)}
                />
              </LiyonField>
              <LiyonField label={t("booking.endTime")}>
                <input
                  type="datetime-local"
                  className="w-full rounded border px-3 py-2 text-sm"
                  value={formEndTime}
                  onChange={(e) => setFormEndTime(e.target.value)}
                />
              </LiyonField>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <LiyonField label={t("booking.attendees")}>
                <input
                  type="number"
                  min="1"
                  className="w-full rounded border px-3 py-2 text-sm"
                  value={formAttendees}
                  onChange={(e) => setFormAttendees(parseInt(e.target.value) || 1)}
                />
              </LiyonField>
              <LiyonField label={t("booking.phone")}>
                <input
                  type="tel"
                  className="w-full rounded border px-3 py-2 text-sm"
                  value={formPhone}
                  onChange={(e) => setFormPhone(e.target.value)}
                  placeholder="เช่น 081-234-5678"
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
            {t("booking.create")}
          </Button>
        </LiyonDialogFooter>
      </LiyonDialog>

      {/* Modal ปฏิเสธการจอง */}
      <LiyonDialog
        open={rejectModalOpen}
        onOpenChange={(open) => !open && setRejectModalOpen(false)}
        danger
      >
        <LiyonDialogHeader
          title={t("booking.reject")}
          description={rejectingItem?.title}
        />
        <LiyonDialogBody>
          <div className="space-y-3 py-2">
            <LiyonField label={t("booking.rejectReason")}>
              <textarea
                rows={3}
                className="w-full rounded border px-3 py-2 text-sm"
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder="ระบุสาเหตุที่ไม่อนุมัติ เช่น ห้องปิดซ่อมบำรุง หรือจัดกิจกรรมด่วนของคณะ..."
              />
            </LiyonField>
          </div>
        </LiyonDialogBody>
        <LiyonDialogFooter>
          <Button
            variant="outline"
            onClick={() => setRejectModalOpen(false)}
            disabled={isPending}
          >
            {t("sample.cancel")}
          </Button>
          <Button
            variant="destructive"
            onClick={handleConfirmReject}
            disabled={isPending}
          >
            {t("booking.reject")}
          </Button>
        </LiyonDialogFooter>
      </LiyonDialog>
    </div>
  );
}
