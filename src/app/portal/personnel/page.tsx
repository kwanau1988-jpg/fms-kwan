import Link from "next/link";
import { getLocale } from "@/shared/lib/i18n/server";
import { listActivePersonnel } from "@/features/personnel/server";
import { ArrowLeft, Mail, Phone, MapPin, User } from "lucide-react";

export default async function PortalPersonnelPage({
  searchParams,
}: {
  searchParams: Promise<{ dept?: string }>;
}) {
  const { dept } = await searchParams;
  const locale = await getLocale();
  const isTh = locale === "th";

  const activeDept = dept || "ALL";
  const personnel = await listActivePersonnel(activeDept === "ALL" ? undefined : activeDept);

  const departments = [
    { key: "ALL", labelTh: "ทั้งหมด", labelEn: "All Departments" },
    { key: "บริหารธุรกิจ", labelTh: "ภาควิชาบริหารธุรกิจ", labelEn: "Business Administration" },
    { key: "การบัญชี", labelTh: "ภาควิชาการบัญชี", labelEn: "Accounting" },
    { key: "เศรษฐศาสตร์", labelTh: "ภาควิชาเศรษฐศาสตร์", labelEn: "Economics" },
    { key: "สำนักงานคณบดี", labelTh: "สำนักงานคณบดี / สายสนับสนุน", labelEn: "Dean Office & Staff" },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
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
          {isTh ? "ทำเนียบคณาจารย์และบุคลากร" : "Faculty & Staff Directory"}
        </h1>
        <p className="text-sm text-muted-foreground">
          {isTh ? "รายชื่อคณาจารย์ประจำภาควิชา และบุคลากรสายสนับสนุนประจำคณะ" : "Meet our dedicated faculty members and administrative personnel"}
        </p>
      </div>

      {/* Department Filter Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-border/40 pb-4">
        {departments.map((d) => {
          const isActive = activeDept === d.key;
          return (
            <Link
              key={d.key}
              href={d.key === "ALL" ? "/portal/personnel" : `/portal/personnel?dept=${encodeURIComponent(d.key)}`}
              className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
                isActive
                  ? "bg-brand text-on-brand shadow-xs"
                  : "bg-muted text-foreground/80 hover:bg-muted/80"
              }`}
            >
              {isTh ? d.labelTh : d.labelEn}
            </Link>
          );
        })}
      </div>

      {/* Personnel Grid */}
      {personnel.length === 0 ? (
        <div className="p-16 text-center rounded-2xl border border-dashed border-border text-muted-foreground">
          <p className="text-base font-medium">{isTh ? "ไม่พบบุคลากรในกลุ่มงานนี้" : "No personnel found in this department"}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {personnel.map((item) => {
            const fullName = isTh
              ? `${item.academicTitle ? item.academicTitle + " " : ""}${item.firstNameTh} ${item.lastNameTh}`
              : `${item.academicTitle ? item.academicTitle + " " : ""}${item.firstNameEn} ${item.lastNameEn}`;

            return (
              <div
                key={item.id}
                className="rounded-2xl border border-border/60 bg-card overflow-hidden hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div className="p-6 text-center space-y-4">
                  {/* Avatar */}
                  <div className="w-24 h-24 mx-auto rounded-full bg-muted border-2 border-brand/20 overflow-hidden flex items-center justify-center">
                    {item.avatarUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={item.avatarUrl} alt={fullName} className="w-full h-full object-cover" />
                    ) : (
                      <User className="w-10 h-10 text-muted-foreground opacity-50" />
                    )}
                  </div>

                  {/* Names & Position */}
                  <div className="space-y-1">
                    <h3 className="font-bold text-base text-foreground leading-tight">{fullName}</h3>
                    <p className="text-xs font-medium text-brand">{isTh ? item.positionTh : item.positionEn}</p>
                    <p className="text-xs text-muted-foreground">{isTh ? item.departmentTh : item.departmentEn}</p>
                  </div>
                </div>

                {/* Contact Info Footer */}
                <div className="p-4 bg-muted/30 border-t border-border/40 text-xs text-muted-foreground space-y-1.5">
                  <div className="flex items-center gap-2 truncate">
                    <Mail className="w-3.5 h-3.5 shrink-0 text-brand" />
                    <span className="truncate">{item.email}</span>
                  </div>
                  {item.phoneExt && (
                    <div className="flex items-center gap-2">
                      <Phone className="w-3.5 h-3.5 shrink-0 text-brand" />
                      <span>{isTh ? "ต่อ" : "Ext."} {item.phoneExt}</span>
                    </div>
                  )}
                  {item.roomNumber && (
                    <div className="flex items-center gap-2">
                      <MapPin className="w-3.5 h-3.5 shrink-0 text-brand" />
                      <span>{isTh ? "ห้อง" : "Room"} {item.roomNumber}</span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
