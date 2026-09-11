import Link from "next/link";
import type { Metadata } from "next";
import { getLocale, getT } from "@/i18n/server";
import { formatDate } from "@/shared/lib/format";
import { listPublishedNews } from "@/features/news/server";
import { listActivePersonnel } from "@/features/personnel/server";
import { listActiveCurricula } from "@/features/curriculum/server";
import {
  ArrowRight,
  BookOpen,
  Users,
  Calendar,
  ChevronRight,
  Clock,
  Pin,
  FileCheck2,
} from "lucide-react";
import { PortalHero } from "./_components/portal-hero";
import { prisma } from "@/shared/lib/infra/prisma";

export async function generateMetadata(): Promise<Metadata> {
  const [tenant, locale] = await Promise.all([
    prisma.tenant.findFirst({ orderBy: { createdAt: "asc" }, select: { nameTh: true, nameEn: true } }).catch(() => null),
    getLocale(),
  ]);
  const isTh = locale === "th";
  const name = (isTh ? tenant?.nameTh : tenant?.nameEn) || tenant?.nameTh || "คณะวิทยาการจัดการ";
  const nameAlt = (isTh ? tenant?.nameEn : tenant?.nameTh) || "Faculty of Management Science";
  return {
    title: `${name} | ${nameAlt}`,
    description: `${name} Web Platform - ศูนย์กลางการเรียนรู้และการบริหารจัดการ`,
  };
}

export default async function PortalHomePage() {
  const [t, locale, tenant] = await Promise.all([
    getT(),
    getLocale(),
    prisma.tenant.findFirst({ orderBy: { createdAt: "asc" }, select: { nameTh: true, nameEn: true } }).catch(() => null),
  ]);
  const isTh = locale === "th";
  const orgName = (locale === "en" ? (tenant?.nameEn || tenant?.nameTh) : (tenant?.nameTh || tenant?.nameEn)) || (isTh ? "คณะวิทยาการจัดการ" : "Faculty of Management Science");

  // Fetch real data from database
  const [latestNews, keyPersonnel, programs] = await Promise.all([
    listPublishedNews(undefined, 6).catch(() => []),
    listActivePersonnel().catch(() => []),
    listActiveCurricula().catch(() => []),
  ]);

  return (
    <div className="space-y-16 pb-20">
      {/* ─── Hero Section (Fiscal Multi-Option Style) ─── */}
      <PortalHero
        orgName={orgName}
        curriculaCount={programs.length}
        personnelCount={keyPersonnel.length}
      />

      {/* ─── Latest News Section ─── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-border/40 pb-4">
          <div>
            <h2 className="text-2xl font-bold text-foreground">
              {t("portal.news.title")}
            </h2>
            <p className="text-sm text-muted-foreground mt-1">
              {t("news.subtitle")}
            </p>
          </div>
          <Link
            href="/portal/news"
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-brand hover:underline"
          >
            <span>{t("portal.news.viewAll")}</span>
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        {latestNews.length === 0 ? (
          <div className="p-12 text-center rounded-2xl border border-dashed border-border text-muted-foreground">
            <Clock className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">{t("news.empty")}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {latestNews.slice(0, 3).map((item) => (
              <Link
                key={item.id}
                href={`/portal/news/${item.slug}`}
                className="group flex flex-col rounded-2xl border border-border/60 bg-card overflow-hidden hover:shadow-lg transition-all hover:-translate-y-1"
              >
                <div className="aspect-video bg-muted relative flex items-center justify-center overflow-hidden">
                  {item.coverImageUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={item.coverImageUrl}
                      alt={isTh ? item.titleTh : item.titleEn}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="flex flex-col items-center gap-1 text-muted-foreground">
                      <BookOpen className="w-8 h-8 opacity-40" />
                      <span className="text-xs uppercase font-medium tracking-wider">{item.category}</span>
                    </div>
                  )}

                  {item.isPinned && (
                    <div className="absolute top-3 left-3 px-2 py-1 rounded-md bg-brand text-on-brand text-xs font-semibold flex items-center gap-1 shadow-sm">
                      <Pin className="w-3 h-3" />
                      <span>{isTh ? "ข่าวเด่น" : "Pinned"}</span>
                    </div>
                  )}
                </div>

                <div className="p-5 flex-1 flex flex-col justify-between space-y-3">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <span className="px-2 py-0.5 rounded-full bg-muted font-medium">
                        {item.category}
                      </span>
                      <span>•</span>
                      <span>{item.publishedAt ? formatDate(item.publishedAt, locale) : ""}</span>
                    </div>
                    <h3 className="font-bold text-foreground text-base line-clamp-2 group-hover:text-brand transition-colors">
                      {isTh ? item.titleTh : item.titleEn}
                    </h3>
                    <p className="text-xs text-muted-foreground line-clamp-2">
                      {isTh ? item.summaryTh || item.contentTh : item.summaryEn || item.contentEn}
                    </p>
                  </div>

                  <div className="pt-2 flex items-center gap-1 text-xs font-semibold text-brand">
                    <span>{isTh ? "อ่านรายละเอียด" : "Read more"}</span>
                    <ArrowRight className="w-3 h-3" />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* ─── Academic Programs Preview ─── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-border/40 pb-4">
          <div>
            <h2 className="text-2xl font-bold text-foreground">
              {t("portal.curriculum.title")}
            </h2>
            <p className="text-sm text-muted-foreground mt-1">
              {t("curriculum.subtitle")}
            </p>
          </div>
          <Link
            href="/portal/curriculum"
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-brand hover:underline"
          >
            <span>{t("portal.curriculum.viewAll")}</span>
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {programs.slice(0, 3).map((prog) => (
            <div
              key={prog.id}
              className="p-6 rounded-2xl border border-border/60 bg-card hover:border-brand/40 transition-all space-y-4 flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-brand/10 text-brand">
                    {prog.degreeLevel}
                  </span>
                  <span className="text-xs text-muted-foreground font-mono">{prog.code}</span>
                </div>
                <h3 className="font-bold text-lg text-foreground">
                  {isTh ? prog.nameTh : prog.nameEn}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {isTh ? prog.degreeTh : prog.degreeEn}
                </p>
              </div>

              <div className="pt-4 border-t border-border/40 flex items-center justify-between text-xs">
                <span className="text-muted-foreground">{prog.totalCredits} {t("portal.curriculum.credits")}</span>
                <Link
                  href="/portal/curriculum"
                  className="font-semibold text-brand hover:underline"
                >
                  {isTh ? "รายละเอียดหลักสูตร →" : "Learn more →"}
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ─── Online Services Hub ─── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="rounded-3xl border border-brand/20 bg-gradient-to-r from-brand/10 via-brand/5 to-transparent p-8 sm:p-12">
          <div className="max-w-3xl space-y-6">
            <h2 className="text-2xl sm:text-3xl font-bold text-foreground">
              {isTh ? "ศูนย์บริการสารสนเทศออนไลน์" : "Faculty Smart Online Services"}
            </h2>
            <p className="text-sm sm:text-base text-muted-foreground">
              {isTh
                ? "เข้าถึงระบบบริการออนไลน์สำหรับอาจารย์ บุคลากร และนักศึกษา อาทิ ระบบเช็คชื่อเข้าเรียน ระบบจองห้องประชุม และระบบสลิปเงินเดือน"
                : "Access smart academic & operational services including classroom attendance check-in, room booking, and e-payroll."}
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
              <Link
                href="/portal/facilities"
                className="p-4 rounded-xl bg-background border border-border/60 hover:border-brand shadow-xs hover:shadow-md transition-all flex items-center gap-3"
              >
                <div className="w-10 h-10 rounded-lg bg-brand/10 text-brand flex items-center justify-center shrink-0">
                  <Calendar className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-sm text-foreground">{t("portal.nav.facilities")}</h4>
                  <p className="text-xs text-muted-foreground">{t("booking.subtitle")}</p>
                </div>
              </Link>

              <Link
                href="/portal/attendance/scan"
                className="p-4 rounded-xl bg-background border border-border/60 hover:border-brand shadow-xs hover:shadow-md transition-all flex items-center gap-3"
              >
                <div className="w-10 h-10 rounded-lg bg-brand/10 text-brand flex items-center justify-center shrink-0">
                  <FileCheck2 className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-sm text-foreground">{t("roles.module.attendance")}</h4>
                  <p className="text-xs text-muted-foreground">{t("attendance.scanTitle")}</p>
                </div>
              </Link>

              <Link
                href="/login"
                className="p-4 rounded-xl bg-background border border-border/60 hover:border-brand shadow-xs hover:shadow-md transition-all flex items-center gap-3"
              >
                <div className="w-10 h-10 rounded-lg bg-brand/10 text-brand flex items-center justify-center shrink-0">
                  <Users className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-sm text-foreground">{t("roles.module.payroll")}</h4>
                  <p className="text-xs text-muted-foreground">{t("payroll.mySlips")}</p>
                </div>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
