"use client";

import { useState, useTransition, useMemo } from "react";
import {
  Plus,
  Calendar,
  Check,
  X,
  Building,
  Car,
  AlertCircle,
  Users,
  Phone,
  Pencil,
  Ban,
  Search,
  Wrench,
  CheckCircle2,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";
import { useT, useLocale } from "@/shared/lib/i18n/client";
import { formatDate, toDateTimeLocalValue } from "@/shared/lib/format";
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
  updateReservationAction,
  cancelReservationAction,
  decideReservationAction,
  getReservationsAction,
  getResourcesAction,
  createResourceAction,
  updateResourceAction,
  deleteResourceAction,
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
  currentUserId,
  canCreate,
  canApprove,
  canManage,
}: Props) {
  const t = useT();
  const locale = useLocale();
  const isTh = locale === "th";

  // Data states
  const [reservations, setReservations] = useState<ReservationDto[]>(initialReservations);
  const [resources, setResources] = useState<ResourceDto[]>(initialResources);
  const [isPending, startTransition] = useTransition();

  // Active view tab: "reservations" | "resources"
  const [activeTab, setActiveTab] = useState<"reservations" | "resources">("reservations");

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [typeFilter, setTypeFilter] = useState<string>("ALL");

  // Dialog states for Reservations
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editingReservation, setEditingReservation] = useState<ReservationDto | null>(null);

  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [rejectingItem, setRejectingItem] = useState<ReservationDto | null>(null);
  const [rejectReason, setRejectReason] = useState("");

  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [cancellingItem, setCancellingItem] = useState<ReservationDto | null>(null);

  // Form states for Reservation Create/Edit
  const [formResourceId, setFormResourceId] = useState(initialResources[0]?.id || "");
  const [formTitle, setFormTitle] = useState("");
  const [formStartTime, setFormStartTime] = useState("");
  const [formEndTime, setFormEndTime] = useState("");
  const [formAttendees, setFormAttendees] = useState(1);
  const [formPhone, setFormPhone] = useState("");

  // Dialog states for Resources (Rooms & Vehicles)
  const [createResourceModalOpen, setCreateResourceModalOpen] = useState(false);
  const [editResourceModalOpen, setEditResourceModalOpen] = useState(false);
  const [editingResource, setEditingResource] = useState<ResourceDto | null>(null);

  // Form states for Resource
  const [resType, setResType] = useState<"ROOM" | "VEHICLE">("ROOM");
  const [resNameTh, setResNameTh] = useState("");
  const [resNameEn, setResNameEn] = useState("");
  const [resLocation, setResLocation] = useState("");
  const [resCapacity, setResCapacity] = useState(20);
  const [resAmenities, setResAmenities] = useState("");
  const [resAvailable, setResAvailable] = useState(true);

  // Refresh data
  const refreshData = async () => {
    const [resBookings, resRooms] = await Promise.all([
      getReservationsAction(),
      getResourcesAction(undefined, true),
    ]);
    if (resBookings.ok) {
      setReservations(resBookings.data);
    }
    if (resRooms.ok) {
      setResources(resRooms.data);
    }
  };

  // ── RESERVATION HANDLERS ──

  const handleOpenCreate = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(9, 0, 0, 0);

    const tomorrowEnd = new Date(tomorrow);
    tomorrowEnd.setHours(12, 0, 0, 0);

    const firstAvailable = resources.find((r) => r.isAvailable)?.id || resources[0]?.id || "";
    setFormResourceId(firstAvailable);
    setFormStartTime(toDateTimeLocalValue(tomorrow));
    setFormEndTime(toDateTimeLocalValue(tomorrowEnd));
    setFormTitle("");
    setFormAttendees(5);
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
        await refreshData();
      } else {
        if (res.error.code === "conflict" || res.error.message.includes("booking.conflict")) {
          toast.error(t("booking.conflict"));
        } else {
          toast.error(res.error.message ? t(res.error.message as Parameters<typeof t>[0]) : t("common.error"));
        }
      }
    });
  };

  const handleOpenEdit = (reservation: ReservationDto) => {
    setEditingReservation(reservation);
    setFormResourceId(reservation.resourceId);
    setFormTitle(reservation.title);
    setFormStartTime(toDateTimeLocalValue(new Date(reservation.startTime)));
    setFormEndTime(toDateTimeLocalValue(new Date(reservation.endTime)));
    setFormAttendees(reservation.attendeesCount);
    setFormPhone(reservation.contactPhone || "");
    setEditModalOpen(true);
  };

  const handleSaveEdit = () => {
    if (!editingReservation || !formResourceId || !formTitle.trim() || !formStartTime || !formEndTime) {
      toast.error(t("error.validation"));
      return;
    }

    startTransition(async () => {
      const res = await updateReservationAction({
        reservationId: editingReservation.id,
        resourceId: formResourceId,
        title: formTitle.trim(),
        startTime: new Date(formStartTime).toISOString(),
        endTime: new Date(formEndTime).toISOString(),
        attendeesCount: Number(formAttendees) || 1,
        contactPhone: formPhone.trim() || undefined,
      });

      if (res.ok) {
        toast.success(t("booking.editSuccess"));
        setEditModalOpen(false);
        setEditingReservation(null);
        await refreshData();
      } else {
        if (res.error.code === "conflict" || res.error.message.includes("booking.conflict")) {
          toast.error(t("booking.conflict"));
        } else {
          toast.error(res.error.message ? t(res.error.message as Parameters<typeof t>[0]) : t("common.error"));
        }
      }
    });
  };

  const handleOpenCancel = (reservation: ReservationDto) => {
    setCancellingItem(reservation);
    setCancelModalOpen(true);
  };

  const handleConfirmCancel = () => {
    if (!cancellingItem) return;

    startTransition(async () => {
      const res = await cancelReservationAction({
        reservationId: cancellingItem.id,
      });

      if (res.ok) {
        toast.success(t("booking.cancelSuccess"));
        setCancelModalOpen(false);
        setCancellingItem(null);
        await refreshData();
      } else {
        toast.error(res.error.message || t("common.error"));
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
        await refreshData();
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
        await refreshData();
      } else {
        toast.error(res.error.message || t("common.error"));
      }
    });
  };

  // ── RESOURCE (ROOM/VEHICLE) HANDLERS ──

  const handleOpenCreateResource = () => {
    setResType("ROOM");
    setResNameTh("");
    setResNameEn("");
    setResLocation("");
    setResCapacity(20);
    setResAmenities("โปรเจกเตอร์ 4K, ระบบประชุมทางไกล Zoom/Teams, ไมโครโฟนไร้สาย, เครื่องปรับอากาศ");
    setResAvailable(true);
    setCreateResourceModalOpen(true);
  };

  const handleCreateResource = () => {
    if (!resNameTh.trim() || !resLocation.trim()) {
      toast.error(t("error.validation"));
      return;
    }

    const amenitiesList = resAmenities
      .split(/[,،\n]/)
      .map((s) => s.trim())
      .filter(Boolean);

    startTransition(async () => {
      const res = await createResourceAction({
        type: resType,
        nameTh: resNameTh.trim(),
        nameEn: resNameEn.trim() || resNameTh.trim(),
        locationOrPlate: resLocation.trim(),
        capacity: Number(resCapacity) || 10,
        amenities: amenitiesList,
        isAvailable: resAvailable,
      });

      if (res.ok) {
        toast.success(t("booking.resource.createSuccess"));
        setCreateResourceModalOpen(false);
        await refreshData();
      } else {
        toast.error(res.error.message || t("common.error"));
      }
    });
  };

  const handleOpenEditResource = (r: ResourceDto) => {
    setEditingResource(r);
    setResType(r.type);
    setResNameTh(r.nameTh);
    setResNameEn(r.nameEn);
    setResLocation(r.locationOrPlate);
    setResCapacity(r.capacity);
    setResAmenities(r.amenities.join(", "));
    setResAvailable(r.isAvailable);
    setEditResourceModalOpen(true);
  };

  const handleSaveEditResource = () => {
    if (!editingResource || !resNameTh.trim() || !resLocation.trim()) {
      toast.error(t("error.validation"));
      return;
    }

    const amenitiesList = resAmenities
      .split(/[,،\n]/)
      .map((s) => s.trim())
      .filter(Boolean);

    startTransition(async () => {
      const res = await updateResourceAction({
        resourceId: editingResource.id,
        type: resType,
        nameTh: resNameTh.trim(),
        nameEn: resNameEn.trim() || resNameTh.trim(),
        locationOrPlate: resLocation.trim(),
        capacity: Number(resCapacity) || 10,
        amenities: amenitiesList,
        isAvailable: resAvailable,
      });

      if (res.ok) {
        toast.success(t("booking.resource.updateSuccess"));
        setEditResourceModalOpen(false);
        setEditingResource(null);
        await refreshData();
      } else {
        toast.error(res.error.message || t("common.error"));
      }
    });
  };

  const handleToggleResourceAvailability = (r: ResourceDto) => {
    startTransition(async () => {
      const res = await updateResourceAction({
        resourceId: r.id,
        isAvailable: !r.isAvailable,
      });

      if (res.ok) {
        toast.success(t("booking.resource.updateSuccess"));
        await refreshData();
      } else {
        toast.error(res.error.message || t("common.error"));
      }
    });
  };

  const handleDeleteResource = (r: ResourceDto) => {
    if (!window.confirm(t("booking.resource.deleteConfirm"))) return;

    startTransition(async () => {
      const res = await deleteResourceAction({ resourceId: r.id });
      if (res.ok) {
        toast.success(t("booking.deleteSuccess"));
        await refreshData();
      } else {
        if (res.error.message?.includes("cannotDeleteInUse")) {
          toast.error(t("booking.resource.cannotDeleteInUse"));
        } else {
          toast.error(res.error.message || t("common.error"));
        }
      }
    });
  };

  // ── FILTERED DATA ──

  const filteredReservations = useMemo(() => {
    return reservations.filter((r) => {
      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchTitle = r.title.toLowerCase().includes(q);
        const matchUser = r.userName.toLowerCase().includes(q) || r.userEmail.toLowerCase().includes(q);
        const matchResource = r.resourceNameTh.toLowerCase().includes(q) || r.resourceNameEn.toLowerCase().includes(q) || r.locationOrPlate.toLowerCase().includes(q);
        if (!matchTitle && !matchUser && !matchResource) return false;
      }

      // Status filter
      if (statusFilter !== "ALL" && r.status !== statusFilter) {
        return false;
      }

      // Type filter
      if (typeFilter !== "ALL" && r.resourceType !== typeFilter) {
        return false;
      }

      return true;
    });
  }, [reservations, searchQuery, statusFilter, typeFilter]);

  const pendingCount = useMemo(() => {
    return reservations.filter((r) => r.status === "PENDING").length;
  }, [reservations]);

  // ── TABLE COLUMNS ──

  const reservationColumns: DataTableColumn<ReservationDto>[] = [
    {
      key: "resource",
      header: t("booking.resource"),
      render: (row) => {
        const isRoom = row.resourceType === "ROOM";
        return (
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-muted/80 flex items-center justify-center text-muted-foreground shrink-0 border border-border/50">
              {isRoom ? <Building className="w-4 h-4 text-brand" /> : <Car className="w-4 h-4 text-cyan-600" />}
            </div>
            <div>
              <p className="font-semibold text-foreground text-sm leading-tight">
                {locale === "th" ? row.resourceNameTh : row.resourceNameEn}
              </p>
              <p className="text-xs text-muted-foreground font-mono mt-0.5">{row.locationOrPlate}</p>
            </div>
          </div>
        );
      },
    },
    {
      key: "title",
      header: t("booking.titleField"),
      render: (row) => (
        <div className="space-y-1">
          <span className="font-semibold text-foreground text-sm block leading-snug">{row.title}</span>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span className="inline-flex items-center gap-1 font-medium bg-muted/60 px-2 py-0.5 rounded-md border border-border/40">
              <Users className="w-3 h-3 text-brand" /> {row.attendeesCount} {t("booking.resource.seats")}
            </span>
            {row.rejectReason && (
              <span className="text-rose-600 dark:text-rose-400 text-xs italic">
                [{t("booking.rejectReason")}: {row.rejectReason}]
              </span>
            )}
          </div>
        </div>
      ),
    },
    {
      key: "booker",
      header: t("booking.booker"),
      render: (row) => (
        <div className="text-xs space-y-0.5">
          <p className="font-semibold text-foreground">{row.userName}</p>
          {row.contactPhone ? (
            <p className="text-muted-foreground inline-flex items-center gap-1 font-mono">
              <Phone className="w-3 h-3 text-brand" /> {row.contactPhone}
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
          <div className="space-y-0.5">
            <p className="font-bold text-foreground">{formatDate(start, locale)}</p>
            <p className="text-muted-foreground font-mono">
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
        const isOwner = row.userId === currentUserId;
        const canEditOrCancel = (isOwner || canManage || canApprove) && row.status !== "CANCELLED";

        return (
          <div className="flex items-center justify-end gap-1.5">
            {/* Approve / Reject buttons for Pending items */}
            {row.status === "PENDING" && canApprove && (
              <>
                <Button
                  size="sm"
                  variant="outline"
                  className="h-8 gap-1 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 text-xs font-semibold"
                  onClick={() => handleApprove(row)}
                  disabled={isPending}
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>{t("booking.approve")}</span>
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="h-8 gap-1 text-rose-600 hover:text-rose-700 hover:bg-rose-50 text-xs font-semibold"
                  onClick={() => handleOpenReject(row)}
                  disabled={isPending}
                >
                  <X className="w-3.5 h-3.5" />
                  <span>{t("booking.reject")}</span>
                </Button>
              </>
            )}

            {/* Edit Button */}
            {canEditOrCancel && (
              <Button
                size="sm"
                variant="outline"
                className="h-8 gap-1 text-foreground hover:bg-muted text-xs font-semibold"
                onClick={() => handleOpenEdit(row)}
                disabled={isPending}
                title={t("booking.edit")}
              >
                <Pencil className="w-3.5 h-3.5 text-brand" />
                <span className="hidden sm:inline">{t("booking.edit")}</span>
              </Button>
            )}

            {/* Cancel Button */}
            {canEditOrCancel && (
              <Button
                size="sm"
                variant="ghost"
                className="h-8 gap-1 text-muted-foreground hover:text-rose-600 hover:bg-rose-50 text-xs"
                onClick={() => handleOpenCancel(row)}
                disabled={isPending}
                title={t("booking.cancel")}
              >
                <Ban className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">{t("booking.cancel")}</span>
              </Button>
            )}
          </div>
        );
      },
    },
  ];

  return (
    <div className="space-y-6">
      {/* ── Page Header & Top Segmented Switcher ── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border/50 pb-5">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
            {t("booking.title")}
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            {t("booking.subtitle")}
          </p>
        </div>

        {/* View Switcher Tabs */}
        <div className="flex items-center gap-2 p-1.5 rounded-2xl bg-muted/70 border border-border/80 self-start md:self-auto">
          <button
            type="button"
            onClick={() => setActiveTab("reservations")}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer select-none ${
              activeTab === "reservations"
                ? "bg-card text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Calendar className="w-4 h-4 text-brand" />
            <span>{t("booking.tab.reservations")}</span>
            <span className="px-1.5 py-0.2 rounded-full text-[10px] font-mono bg-muted text-foreground">
              {reservations.length}
            </span>
            {pendingCount > 0 && (
              <span className="px-1.5 py-0.2 rounded-full text-[10px] font-mono bg-amber-500/15 text-amber-600 dark:text-amber-400 font-bold animate-pulse">
                {pendingCount}
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("resources")}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer select-none ${
              activeTab === "resources"
                ? "bg-card text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Building className="w-4 h-4 text-purple-600" />
            <span>{t("booking.tab.resources")}</span>
            <span className="px-1.5 py-0.2 rounded-full text-[10px] font-mono bg-muted text-foreground">
              {resources.length}
            </span>
          </button>
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════
          VIEW 1: RESERVATIONS LIST & WORKFLOW
          ══════════════════════════════════════════════════════ */}
      {activeTab === "reservations" && (
        <div className="space-y-4">
          {/* Action & Filter Toolbar */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            {/* Search and Filters */}
            <div className="flex flex-wrap items-center gap-2.5 flex-1">
              {/* Search Box */}
              <div className="relative flex-1 min-w-[200px] max-w-md">
                <Search className="w-4 h-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={t("booking.searchPlaceholder")}
                  className="w-full pl-9 pr-3 py-2 rounded-xl border border-border/80 bg-card text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-brand/30"
                />
              </div>

              {/* Status Filter */}
              <div className="flex items-center gap-1">
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  aria-label={t("booking.status")}
                  className="px-3 py-2 rounded-xl border border-border/80 bg-card text-xs sm:text-sm font-medium text-foreground focus:outline-none cursor-pointer"
                >
                  <option value="ALL">{t("booking.filter.allStatuses")}</option>
                  <option value="PENDING">{t("booking.status.PENDING")}</option>
                  <option value="APPROVED">{t("booking.status.APPROVED")}</option>
                  <option value="REJECTED">{t("booking.status.REJECTED")}</option>
                  <option value="CANCELLED">{t("booking.status.CANCELLED")}</option>
                </select>
              </div>

              {/* Resource Type Filter */}
              <div className="flex items-center gap-1">
                <select
                  value={typeFilter}
                  onChange={(e) => setTypeFilter(e.target.value)}
                  aria-label={t("booking.resource")}
                  className="px-3 py-2 rounded-xl border border-border/80 bg-card text-xs sm:text-sm font-medium text-foreground focus:outline-none cursor-pointer"
                >
                  <option value="ALL">{t("booking.filter.allTypes")}</option>
                  <option value="ROOM">{t("booking.filter.onlyRooms")}</option>
                  <option value="VEHICLE">{t("booking.filter.onlyVehicles")}</option>
                </select>
              </div>
            </div>

            {/* Create Reservation Action Button */}
            {canCreate && (
              <Button onClick={handleOpenCreate} className="gap-2 shrink-0 rounded-xl shadow-sm">
                <Plus className="h-4 w-4" />
                <span>{t("booking.create")}</span>
              </Button>
            )}
          </div>

          {/* DataTable Card */}
          <LiyonCard>
            <DataTable<ReservationDto>
              headHeading={<span>{t("booking.tab.reservations")} ({filteredReservations.length})</span>}
              state={filteredReservations.length === 0 ? "empty" : "data"}
              rows={filteredReservations}
              columns={reservationColumns}
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
        </div>
      )}

      {/* ══════════════════════════════════════════════════════
          VIEW 2: RESOURCE MANAGEMENT (ROOMS & VEHICLES)
          ══════════════════════════════════════════════════════ */}
      {activeTab === "resources" && (
        <div className="space-y-6">
          {/* Resource Top Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl border border-border/70 bg-card/80 backdrop-blur-xs">
            <div>
              <h2 className="text-lg font-bold text-foreground">
                {t("booking.resource.manageTitle")}
              </h2>
              <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
                {t("booking.resource.manageSubtitle")}
              </p>
            </div>

            {canManage && (
              <Button onClick={handleOpenCreateResource} className="gap-2 shrink-0 rounded-xl shadow-sm">
                <Plus className="h-4 w-4" />
                <span>{t("booking.resource.add")}</span>
              </Button>
            )}
          </div>

          {/* Resource Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {resources.map((r) => (
              <div
                key={r.id}
                className={`p-6 rounded-2xl border transition-all relative overflow-hidden bg-card ${
                  r.isAvailable
                    ? "border-border/80 shadow-xs hover:border-brand/40"
                    : "border-amber-500/40 bg-amber-500/[0.02]"
                }`}
              >
                {/* Top Header Row */}
                <div className="flex items-center justify-between pb-3 border-b border-border/50">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-muted text-foreground">
                    {r.type === "ROOM" ? <Building className="w-3.5 h-3.5 text-brand" /> : <Car className="w-3.5 h-3.5 text-cyan-600" />}
                    <span>{r.type === "ROOM" ? t("booking.room") : t("booking.vehicle")}</span>
                  </span>

                  {/* Availability Badge */}
                  <span
                    className={`inline-flex items-center gap-1 text-xs font-bold px-2.5 py-0.5 rounded-full ${
                      r.isAvailable
                        ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                        : "bg-amber-500/15 text-amber-600 dark:text-amber-400"
                    }`}
                  >
                    {r.isAvailable ? <CheckCircle2 className="w-3 h-3" /> : <Wrench className="w-3 h-3" />}
                    <span>{r.isAvailable ? t("booking.resource.available") : t("booking.resource.maintenance")}</span>
                  </span>
                </div>

                {/* Name & Location */}
                <div className="py-4 space-y-1">
                  <h3 className="text-base font-bold text-foreground leading-tight">
                    {isTh ? r.nameTh : r.nameEn}
                  </h3>
                  <p className="text-xs text-muted-foreground font-mono">
                    {r.locationOrPlate}
                  </p>
                </div>

                {/* Capacity & Amenities */}
                <div className="space-y-2.5 pb-4">
                  <div className="flex items-center gap-1.5 text-xs text-foreground font-semibold">
                    <Users className="w-4 h-4 text-brand" />
                    <span>{t("booking.resource.capacity")}: {r.capacity} {t("booking.resource.seats")}</span>
                  </div>

                  {/* Amenities Chips */}
                  {r.amenities && r.amenities.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {r.amenities.map((item, idx) => (
                        <span
                          key={`${r.id}-amenity-${idx}`}
                          className="px-2 py-0.5 rounded-md text-[11px] font-medium bg-muted/60 text-muted-foreground border border-border/40"
                        >
                          {item}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Action Footer */}
                {canManage && (
                  <div className="pt-3 border-t border-border/50 flex items-center justify-between">
                    <button
                      type="button"
                      onClick={() => handleToggleResourceAvailability(r)}
                      disabled={isPending}
                      className="text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                    >
                      {r.isAvailable ? `➔ ${t("booking.resource.maintenance")}` : `➔ ${t("booking.resource.available")}`}
                    </button>

                    <div className="flex items-center gap-1.5">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleOpenEditResource(r)}
                        disabled={isPending}
                        className="h-8 text-xs gap-1 font-semibold"
                      >
                        <Pencil className="w-3.5 h-3.5 text-brand" />
                        <span>{t("sample.edit")}</span>
                      </Button>

                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleDeleteResource(r)}
                        disabled={isPending}
                        className="h-8 text-xs text-muted-foreground hover:text-rose-600"
                        title={t("sample.delete")}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════
          MODAL 1: CREATE RESERVATION
          ══════════════════════════════════════════════════════ */}
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
                {resources
                  .filter((r) => r.isAvailable)
                  .map((r) => (
                    <option key={r.id} value={r.id}>
                      [{r.type === "ROOM" ? t("booking.room") : t("booking.vehicle")}] {locale === "th" ? r.nameTh : r.nameEn} ({r.locationOrPlate} - {r.capacity} {t("booking.resource.seats")})
                    </option>
                  ))}
              </LiyonSelect>
            </LiyonField>

            <LiyonField label={t("booking.titleField")}>
              <input
                className="w-full rounded-xl border border-border/80 bg-card px-3.5 py-2 text-sm text-foreground focus:ring-2 focus:ring-brand/30 focus:outline-none"
                value={formTitle}
                onChange={(e) => setFormTitle(e.target.value)}
                placeholder="เช่น การประชุมคณะกรรมการประจำคณะ วาระพิเศษ"
              />
            </LiyonField>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <LiyonField label={t("booking.startTime")}>
                <input
                  type="datetime-local"
                  className="w-full rounded-xl border border-border/80 bg-card px-3.5 py-2 text-sm text-foreground focus:ring-2 focus:ring-brand/30 focus:outline-none"
                  value={formStartTime}
                  onChange={(e) => setFormStartTime(e.target.value)}
                />
              </LiyonField>
              <LiyonField label={t("booking.endTime")}>
                <input
                  type="datetime-local"
                  className="w-full rounded-xl border border-border/80 bg-card px-3.5 py-2 text-sm text-foreground focus:ring-2 focus:ring-brand/30 focus:outline-none"
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
                  className="w-full rounded-xl border border-border/80 bg-card px-3.5 py-2 text-sm text-foreground focus:ring-2 focus:ring-brand/30 focus:outline-none"
                  value={formAttendees}
                  onChange={(e) => setFormAttendees(parseInt(e.target.value) || 1)}
                />
              </LiyonField>
              <LiyonField label={t("booking.phone")}>
                <input
                  type="tel"
                  className="w-full rounded-xl border border-border/80 bg-card px-3.5 py-2 text-sm text-foreground focus:ring-2 focus:ring-brand/30 focus:outline-none"
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

      {/* ══════════════════════════════════════════════════════
          MODAL 2: EDIT RESERVATION
          ══════════════════════════════════════════════════════ */}
      <LiyonDialog open={editModalOpen} onOpenChange={setEditModalOpen} wide>
        <LiyonDialogHeader
          title={t("booking.edit")}
          description={t("booking.editSubtitle")}
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
                    [{r.type === "ROOM" ? t("booking.room") : t("booking.vehicle")}] {locale === "th" ? r.nameTh : r.nameEn} ({r.locationOrPlate})
                  </option>
                ))}
              </LiyonSelect>
            </LiyonField>

            <LiyonField label={t("booking.titleField")}>
              <input
                className="w-full rounded-xl border border-border/80 bg-card px-3.5 py-2 text-sm text-foreground focus:ring-2 focus:ring-brand/30 focus:outline-none"
                value={formTitle}
                onChange={(e) => setFormTitle(e.target.value)}
              />
            </LiyonField>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <LiyonField label={t("booking.startTime")}>
                <input
                  type="datetime-local"
                  className="w-full rounded-xl border border-border/80 bg-card px-3.5 py-2 text-sm text-foreground focus:ring-2 focus:ring-brand/30 focus:outline-none"
                  value={formStartTime}
                  onChange={(e) => setFormStartTime(e.target.value)}
                />
              </LiyonField>
              <LiyonField label={t("booking.endTime")}>
                <input
                  type="datetime-local"
                  className="w-full rounded-xl border border-border/80 bg-card px-3.5 py-2 text-sm text-foreground focus:ring-2 focus:ring-brand/30 focus:outline-none"
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
                  className="w-full rounded-xl border border-border/80 bg-card px-3.5 py-2 text-sm text-foreground focus:ring-2 focus:ring-brand/30 focus:outline-none"
                  value={formAttendees}
                  onChange={(e) => setFormAttendees(parseInt(e.target.value) || 1)}
                />
              </LiyonField>
              <LiyonField label={t("booking.phone")}>
                <input
                  type="tel"
                  className="w-full rounded-xl border border-border/80 bg-card px-3.5 py-2 text-sm text-foreground focus:ring-2 focus:ring-brand/30 focus:outline-none"
                  value={formPhone}
                  onChange={(e) => setFormPhone(e.target.value)}
                />
              </LiyonField>
            </div>
          </div>
        </LiyonDialogBody>
        <LiyonDialogFooter>
          <Button
            variant="outline"
            onClick={() => setEditModalOpen(false)}
            disabled={isPending}
          >
            {t("sample.cancel")}
          </Button>
          <Button onClick={handleSaveEdit} disabled={isPending}>
            {t("sample.save")}
          </Button>
        </LiyonDialogFooter>
      </LiyonDialog>

      {/* ══════════════════════════════════════════════════════
          MODAL 3: CANCEL RESERVATION
          ══════════════════════════════════════════════════════ */}
      <LiyonDialog
        open={cancelModalOpen}
        onOpenChange={(open) => !open && setCancelModalOpen(false)}
        danger
      >
        <LiyonDialogHeader
          title={t("booking.cancel")}
          description={cancellingItem?.title}
        />
        <LiyonDialogBody>
          <p className="text-sm text-muted-foreground">
            {t("booking.cancelConfirm")}
          </p>
        </LiyonDialogBody>
        <LiyonDialogFooter>
          <Button
            variant="outline"
            onClick={() => setCancelModalOpen(false)}
            disabled={isPending}
          >
            {t("sample.cancel")}
          </Button>
          <Button
            variant="destructive"
            onClick={handleConfirmCancel}
            disabled={isPending}
          >
            {t("booking.cancel")}
          </Button>
        </LiyonDialogFooter>
      </LiyonDialog>

      {/* ══════════════════════════════════════════════════════
          MODAL 4: REJECT RESERVATION
          ══════════════════════════════════════════════════════ */}
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
                className="w-full rounded-xl border border-border/80 bg-card px-3.5 py-2 text-sm text-foreground focus:ring-2 focus:ring-brand/30 focus:outline-none"
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

      {/* ══════════════════════════════════════════════════════
          MODAL 5: CREATE RESOURCE (ROOM/VEHICLE)
          ══════════════════════════════════════════════════════ */}
      <LiyonDialog open={createResourceModalOpen} onOpenChange={setCreateResourceModalOpen} wide>
        <LiyonDialogHeader
          title={t("booking.resource.add")}
          description={t("booking.resource.manageSubtitle")}
        />
        <LiyonDialogBody>
          <div className="space-y-4 py-2">
            <LiyonField label={t("booking.resource.type")}>
              <LiyonSelect
                value={resType}
                onChange={(e) => setResType(e.target.value as "ROOM" | "VEHICLE")}
              >
                <option value="ROOM">{t("booking.room")}</option>
                <option value="VEHICLE">{t("booking.vehicle")}</option>
              </LiyonSelect>
            </LiyonField>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <LiyonField label={t("booking.resource.nameTh")}>
                <input
                  className="w-full rounded-xl border border-border/80 bg-card px-3.5 py-2 text-sm text-foreground focus:ring-2 focus:ring-brand/30 focus:outline-none"
                  value={resNameTh}
                  onChange={(e) => setResNameTh(e.target.value)}
                  placeholder="เช่น ห้องประชุมทองกวาว (Smart Meeting Room 1)"
                />
              </LiyonField>
              <LiyonField label={t("booking.resource.nameEn")}>
                <input
                  className="w-full rounded-xl border border-border/80 bg-card px-3.5 py-2 text-sm text-foreground focus:ring-2 focus:ring-brand/30 focus:outline-none"
                  value={resNameEn}
                  onChange={(e) => setResNameEn(e.target.value)}
                  placeholder="e.g. Thong-Kao Smart Meeting Room 1"
                />
              </LiyonField>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <LiyonField label={t("booking.resource.locationOrPlate")}>
                <input
                  className="w-full rounded-xl border border-border/80 bg-card px-3.5 py-2 text-sm text-foreground focus:ring-2 focus:ring-brand/30 focus:outline-none"
                  value={resLocation}
                  onChange={(e) => setResLocation(e.target.value)}
                  placeholder="เช่น อาคาร 4 ชั้น 4 หรือ ทะเบียน 1กข-5678"
                />
              </LiyonField>
              <LiyonField label={t("booking.resource.capacity")}>
                <input
                  type="number"
                  min="1"
                  className="w-full rounded-xl border border-border/80 bg-card px-3.5 py-2 text-sm text-foreground focus:ring-2 focus:ring-brand/30 focus:outline-none"
                  value={resCapacity}
                  onChange={(e) => setResCapacity(parseInt(e.target.value) || 1)}
                />
              </LiyonField>
            </div>

            <LiyonField label={t("booking.resource.amenities")}>
              <textarea
                rows={2}
                className="w-full rounded-xl border border-border/80 bg-card px-3.5 py-2 text-sm text-foreground focus:ring-2 focus:ring-brand/30 focus:outline-none"
                value={resAmenities}
                onChange={(e) => setResAmenities(e.target.value)}
                placeholder={t("booking.resource.amenitiesPlaceholder")}
              />
            </LiyonField>

            <div className="flex items-center gap-2 pt-1">
              <input
                type="checkbox"
                id="resAvailableCheckbox"
                checked={resAvailable}
                onChange={(e) => setResAvailable(e.target.checked)}
                className="w-4 h-4 rounded text-brand border-border focus:ring-brand"
              />
              <label htmlFor="resAvailableCheckbox" className="text-sm font-semibold text-foreground cursor-pointer">
                {t("booking.resource.isAvailable")} ({t("booking.resource.available")})
              </label>
            </div>
          </div>
        </LiyonDialogBody>
        <LiyonDialogFooter>
          <Button
            variant="outline"
            onClick={() => setCreateResourceModalOpen(false)}
            disabled={isPending}
          >
            {t("sample.cancel")}
          </Button>
          <Button onClick={handleCreateResource} disabled={isPending}>
            {t("sample.save")}
          </Button>
        </LiyonDialogFooter>
      </LiyonDialog>

      {/* ══════════════════════════════════════════════════════
          MODAL 6: EDIT RESOURCE (ROOM/VEHICLE)
          ══════════════════════════════════════════════════════ */}
      <LiyonDialog open={editResourceModalOpen} onOpenChange={setEditResourceModalOpen} wide>
        <LiyonDialogHeader
          title={t("booking.resource.edit")}
          description={editingResource?.nameTh}
        />
        <LiyonDialogBody>
          <div className="space-y-4 py-2">
            <LiyonField label={t("booking.resource.type")}>
              <LiyonSelect
                value={resType}
                onChange={(e) => setResType(e.target.value as "ROOM" | "VEHICLE")}
              >
                <option value="ROOM">{t("booking.room")}</option>
                <option value="VEHICLE">{t("booking.vehicle")}</option>
              </LiyonSelect>
            </LiyonField>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <LiyonField label={t("booking.resource.nameTh")}>
                <input
                  className="w-full rounded-xl border border-border/80 bg-card px-3.5 py-2 text-sm text-foreground focus:ring-2 focus:ring-brand/30 focus:outline-none"
                  value={resNameTh}
                  onChange={(e) => setResNameTh(e.target.value)}
                />
              </LiyonField>
              <LiyonField label={t("booking.resource.nameEn")}>
                <input
                  className="w-full rounded-xl border border-border/80 bg-card px-3.5 py-2 text-sm text-foreground focus:ring-2 focus:ring-brand/30 focus:outline-none"
                  value={resNameEn}
                  onChange={(e) => setResNameEn(e.target.value)}
                />
              </LiyonField>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <LiyonField label={t("booking.resource.locationOrPlate")}>
                <input
                  className="w-full rounded-xl border border-border/80 bg-card px-3.5 py-2 text-sm text-foreground focus:ring-2 focus:ring-brand/30 focus:outline-none"
                  value={resLocation}
                  onChange={(e) => setResLocation(e.target.value)}
                />
              </LiyonField>
              <LiyonField label={t("booking.resource.capacity")}>
                <input
                  type="number"
                  min="1"
                  className="w-full rounded-xl border border-border/80 bg-card px-3.5 py-2 text-sm text-foreground focus:ring-2 focus:ring-brand/30 focus:outline-none"
                  value={resCapacity}
                  onChange={(e) => setResCapacity(parseInt(e.target.value) || 1)}
                />
              </LiyonField>
            </div>

            <LiyonField label={t("booking.resource.amenities")}>
              <textarea
                rows={2}
                className="w-full rounded-xl border border-border/80 bg-card px-3.5 py-2 text-sm text-foreground focus:ring-2 focus:ring-brand/30 focus:outline-none"
                value={resAmenities}
                onChange={(e) => setResAmenities(e.target.value)}
              />
            </LiyonField>

            <div className="flex items-center gap-2 pt-1">
              <input
                type="checkbox"
                id="editResAvailableCheckbox"
                checked={resAvailable}
                onChange={(e) => setResAvailable(e.target.checked)}
                className="w-4 h-4 rounded text-brand border-border focus:ring-brand"
              />
              <label htmlFor="editResAvailableCheckbox" className="text-sm font-semibold text-foreground cursor-pointer">
                {t("booking.resource.isAvailable")} ({t("booking.resource.available")})
              </label>
            </div>
          </div>
        </LiyonDialogBody>
        <LiyonDialogFooter>
          <Button
            variant="outline"
            onClick={() => setEditResourceModalOpen(false)}
            disabled={isPending}
          >
            {t("sample.cancel")}
          </Button>
          <Button onClick={handleSaveEditResource} disabled={isPending}>
            {t("sample.save")}
          </Button>
        </LiyonDialogFooter>
      </LiyonDialog>
    </div>
  );
}
