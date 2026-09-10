import Link from "next/link";
import { getLocale } from "@/shared/lib/i18n/server";
import { prisma } from "@/shared/lib/infra/prisma";
import { ArrowLeft, Calendar, Building, Car, Users, CheckCircle2 } from "lucide-react";

export default async function PortalFacilitiesPage() {
  const locale = await getLocale();
  const isTh = locale === "th";

  // Fetch active rooms & vehicles
  const resources = await prisma.resource.findMany({
    where: { isAvailable: true },
    orderBy: [{ type: "asc" }, { nameTh: "asc" }],
  }).catch(() => []);

  // Fetch upcoming approved reservations
  const upcomingBookings = await prisma.reservation.findMany({
    where: {
      status: "APPROVED",
      startTime: { gte: new Date() },
    },
    include: { resource: true },
    orderBy: { startTime: "asc" },
    take: 10,
  }).catch(() => []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
      {/* Title */}
      <div className="space-y-2">
        <Link
          href="/portal"
          className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>{isTh ? "กลับหน้าแรก" : "Back to Home"}</span>
        </Link>
        <h1 className="text-3xl font-extrabold text-foreground">
          {isTh ? "ปฏิทินและสถานะห้องประชุม - ยานพาหนะ" : "Facilities & Vehicles Schedule"}
        </h1>
        <p className="text-sm text-muted-foreground">
          {isTh ? "ตรวจสอบตารางการใช้งานห้องประชุมส่วนกลางและยานพาหนะคณะ" : "Check availability and public reservation schedules for faculty rooms and vehicles"}
        </p>
      </div>

      {/* Resource Cards */}
      <section className="space-y-4">
        <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
          <Building className="w-5 h-5 text-brand" />
          <span>{isTh ? "รายการห้องประชุมและยานพาหนะ" : "Available Resources"}</span>
        </h2>

        {resources.length === 0 ? (
          <div className="p-12 text-center rounded-2xl border border-dashed border-border text-muted-foreground">
            <p className="text-sm">{isTh ? "ยังไม่มีข้อมูลห้องหรือยานพาหนะในระบบ" : "No resources configured yet"}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {resources.map((res) => (
              <div
                key={res.id}
                className="p-6 rounded-2xl border border-border/60 bg-card space-y-4"
              >
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-brand/10 text-brand flex items-center gap-1">
                    {res.type === "ROOM" ? <Building className="w-3.5 h-3.5" /> : <Car className="w-3.5 h-3.5" />}
                    <span>{res.type === "ROOM" ? (isTh ? "ห้องประชุม" : "Room") : (isTh ? "ยานพาหนะ" : "Vehicle")}</span>
                  </span>
                  <span className="text-xs text-emerald-600 font-medium flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>{isTh ? "พร้อมใช้งาน" : "Available"}</span>
                  </span>
                </div>

                <div>
                  <h3 className="font-bold text-base text-foreground">{isTh ? res.nameTh : res.nameEn}</h3>
                  <p className="text-xs text-muted-foreground">{res.locationOrPlate}</p>
                </div>

                <div className="pt-2 border-t border-border/40 flex items-center justify-between text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Users className="w-3.5 h-3.5 text-brand" />
                    <span>{isTh ? "ความจุ" : "Capacity"}: {res.capacity} {isTh ? "คน" : "Seats"}</span>
                  </span>
                  <Link
                    href="/login"
                    className="font-semibold text-brand hover:underline"
                  >
                    {isTh ? "จองใช้งาน →" : "Book now →"}
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Upcoming Schedule Table */}
      <section className="space-y-4">
        <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
          <Calendar className="w-5 h-5 text-brand" />
          <span>{isTh ? "ตารางการใช้งานที่ได้รับอนุมัติเร็วๆ นี้" : "Upcoming Approved Reservations"}</span>
        </h2>

        {upcomingBookings.length === 0 ? (
          <div className="p-8 text-center rounded-2xl border border-border/60 bg-muted/20 text-muted-foreground text-sm">
            {isTh ? "ไม่มีรายการจองที่รอใช้งานในระยะนี้" : "No upcoming reservations scheduled"}
          </div>
        ) : (
          <div className="rounded-2xl border border-border/60 overflow-hidden bg-card">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-muted/50 border-b border-border/40 text-xs font-semibold text-muted-foreground">
                  <tr>
                    <th className="px-6 py-3.5">{isTh ? "ทรัพยากร" : "Resource"}</th>
                    <th className="px-6 py-3.5">{isTh ? "หัวข้อการใช้งาน" : "Topic"}</th>
                    <th className="px-6 py-3.5">{isTh ? "วัน-เวลาเริ่มต้น" : "Start Time"}</th>
                    <th className="px-6 py-3.5">{isTh ? "วัน-เวลาสิ้นสุด" : "End Time"}</th>
                    <th className="px-6 py-3.5">{isTh ? "สถานะ" : "Status"}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/40">
                  {upcomingBookings.map((b) => (
                    <tr key={b.id} className="hover:bg-muted/20 transition-colors">
                      <td className="px-6 py-4 font-semibold text-foreground">
                        {isTh ? b.resource.nameTh : b.resource.nameEn}
                      </td>
                      <td className="px-6 py-4 text-foreground/90">{b.title}</td>
                      <td className="px-6 py-4 text-xs text-muted-foreground">
                        {new Date(b.startTime).toLocaleString(isTh ? "th-TH" : "en-US")}
                      </td>
                      <td className="px-6 py-4 text-xs text-muted-foreground">
                        {new Date(b.endTime).toLocaleString(isTh ? "th-TH" : "en-US")}
                      </td>
                      <td className="px-6 py-4">
                        <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-600">
                          {isTh ? "อนุมัติแล้ว" : "Approved"}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
