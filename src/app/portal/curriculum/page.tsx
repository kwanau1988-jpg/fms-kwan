import Link from "next/link";
import { getLocale } from "@/shared/lib/i18n/server";
import { listActiveCurricula, listActiveDepartments } from "@/features/curriculum/server";
import { ArrowLeft, Building2 } from "lucide-react";
import { CurriculumPortalView } from "./_components/curriculum-portal-view";

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

      {/* Curricula Cards with TQF 2 Modal */}
      <CurriculumPortalView curricula={curricula} isTh={isTh} />
    </div>
  );
}
