import Link from "next/link";
import { getLocale } from "@/shared/lib/i18n/server";
import { listActiveCurricula, listActiveDepartments } from "@/features/curriculum/server";
import { ArrowLeft, CheckCircle2, Download, Building2 } from "lucide-react";

export default async function PortalCurriculumPage({
  searchParams,
}: {
  searchParams: Promise<{ level?: string; dept?: string }>;
}) {
  const { level, dept } = await searchParams;
  const locale = await getLocale();
  const isTh = locale === "th";

  const activeLevel = level || "ALL";
  const activeDept = dept || "ALL";

  const [curricula, departments] = await Promise.all([
    listActiveCurricula(
      activeLevel === "ALL" ? undefined : activeLevel,
      activeDept === "ALL" ? undefined : activeDept
    ),
    listActiveDepartments(),
  ]);

  const levels = [
    { key: "ALL", labelTh: "ทุกระดับการศึกษา", labelEn: "All Programs" },
    { key: "BACHELOR", labelTh: "ปริญญาตรี", labelEn: "Bachelor's" },
    { key: "MASTER", labelTh: "ปริญญาโท", labelEn: "Master's" },
    { key: "DOCTORAL", labelTh: "ปริญญาเอก", labelEn: "Doctoral" },
    { key: "SHORT_COURSE", labelTh: "หลักสูตรระยะสั้น/ประกาศนียบัตร", labelEn: "Short Courses" },
  ];

  const buildFilterUrl = (newLevel?: string, newDept?: string) => {
    const l = newLevel !== undefined ? newLevel : activeLevel;
    const d = newDept !== undefined ? newDept : activeDept;
    const params = new URLSearchParams();
    if (l && l !== "ALL") params.set("level", l);
    if (d && d !== "ALL") params.set("dept", d);
    const qs = params.toString();
    return qs ? `/portal/curriculum?${qs}` : "/portal/curriculum";
  };

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
          {isTh ? "หลักสูตรการศึกษาและภาควิชา" : "Academic Programs & Curricula"}
        </h1>
        <p className="text-sm text-muted-foreground">
          {isTh
            ? "โครงสร้างหลักสูตร แผนการศึกษา และการจัดกลุ่มตามภาควิชาหรือส่วนงาน"
            : "Degree outlines, study plans, and programs organized by academic department"}
        </p>
      </div>

      {/* Filters */}
      <div className="space-y-3 border-b border-border/40 pb-5">
        {/* Level Tabs */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-semibold text-muted-foreground mr-1">
            {isTh ? "ระดับการศึกษา:" : "Degree Level:"}
          </span>
          {levels.map((l) => {
            const isActive = activeLevel === l.key;
            return (
              <Link
                key={l.key}
                href={buildFilterUrl(l.key, undefined)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                  isActive
                    ? "bg-brand text-on-brand shadow-xs"
                    : "bg-muted text-foreground/80 hover:bg-muted/80"
                }`}
              >
                {isTh ? l.labelTh : l.labelEn}
              </Link>
            );
          })}
        </div>

        {/* Department Filter Pills */}
        {departments.length > 0 && (
          <div className="flex flex-wrap items-center gap-2 pt-1">
            <span className="text-xs font-semibold text-muted-foreground mr-1">
              {isTh ? "ภาควิชา/ส่วนงาน:" : "Department:"}
            </span>
            <Link
              href={buildFilterUrl(undefined, "ALL")}
              className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${
                activeDept === "ALL"
                  ? "bg-foreground text-background font-semibold"
                  : "bg-muted/60 text-muted-foreground hover:text-foreground hover:bg-muted"
              }`}
            >
              {isTh ? "ทุกภาควิชา" : "All Departments"}
            </Link>
            {departments.map((d) => {
              const isActive = activeDept === d.id;
              return (
                <Link
                  key={d.id}
                  href={buildFilterUrl(undefined, d.id)}
                  className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-medium transition-all ${
                    isActive
                      ? "bg-foreground text-background font-semibold"
                      : "bg-muted/60 text-muted-foreground hover:text-foreground hover:bg-muted"
                  }`}
                >
                  <Building2 className="w-3 h-3" />
                  <span>{isTh ? d.nameTh : d.nameEn}</span>
                </Link>
              );
            })}
          </div>
        )}
      </div>

      {/* Curricula Cards */}
      {curricula.length === 0 ? (
        <div className="p-16 text-center rounded-2xl border border-dashed border-border text-muted-foreground">
          <p className="text-base font-medium">
            {isTh ? "ไม่พบหลักสูตรในเงื่อนไขที่เลือก" : "No programs found matching the selected criteria"}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {curricula.map((item) => (
            <div
              key={item.id}
              className="rounded-3xl border border-border/60 bg-card p-6 sm:p-8 space-y-6 flex flex-col justify-between hover:border-brand/50 transition-all shadow-xs"
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="px-3 py-1 rounded-lg text-xs font-bold bg-brand/10 text-brand">
                      {item.degreeLevel}
                    </span>
                    {item.departmentNameTh && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium bg-muted text-foreground/80 border border-border/60">
                        <Building2 className="w-3 h-3 text-brand" />
                        <span>{isTh ? item.departmentNameTh : item.departmentNameEn}</span>
                      </span>
                    )}
                  </div>
                  <span className="text-xs font-mono text-muted-foreground">{item.code}</span>
                </div>

                <div>
                  <h3 className="text-xl font-bold text-foreground leading-tight">
                    {isTh ? item.nameTh : item.nameEn}
                  </h3>
                  <p className="text-sm text-brand font-medium mt-1">
                    {isTh ? item.degreeTh : item.degreeEn}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4 py-3 border-y border-border/40 text-xs">
                  <div>
                    <span className="text-muted-foreground block">{isTh ? "จำนวนหน่วยกิตรวม" : "Total Credits"}</span>
                    <span className="font-bold text-foreground text-sm">{item.totalCredits} {isTh ? "หน่วยกิต" : "Credits"}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground block">{isTh ? "สถานะการเปิดรับ" : "Admission Status"}</span>
                    <span className="inline-flex items-center gap-1 font-bold text-emerald-600 dark:text-emerald-400 text-sm">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>{item.status}</span>
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between pt-2">
                {item.brochurePdfUrl ? (
                  <a
                    href={item.brochurePdfUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-brand hover:underline"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>{isTh ? "ดาวน์โหลดเล่มหลักสูตร (PDF)" : "Download Brochure"}</span>
                  </a>
                ) : (
                  <span className="text-xs text-muted-foreground">{isTh ? "ระยะเวลาเรียนตามแผน 4 ปี" : "4-Year Standard Track"}</span>
                )}

                <Link
                  href="/login"
                  className="px-4 py-2 rounded-xl bg-brand text-on-brand text-xs font-semibold hover:bg-brand/90 transition-colors"
                >
                  {isTh ? "สมัครเข้าศึกษา" : "Apply Now"}
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
