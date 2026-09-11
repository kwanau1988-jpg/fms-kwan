"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  BookOpen,
  Sparkles,
  Headphones,
  ShieldCheck,
  Zap,
  Layers,
  GraduationCap,
  QrCode,
  CalendarCheck,
  CheckCircle2,
  TrendingUp,
  Clock,
  Award,
  Users,
  Star,
  Flame,
  ChevronRight,
} from "lucide-react";
import { PortalHero3D } from "./portal-hero-3d";
import { useT, useLocale } from "@/shared/lib/i18n/client";

export type HeroOption = "courses" | "services" | "admissions";

interface PortalHeroProps {
  curriculaCount: number;
  personnelCount: number;
  orgName?: string;
}

export function PortalHero({ orgName, curriculaCount, personnelCount }: PortalHeroProps) {
  const t = useT();
  const locale = useLocale();
  const isTh = locale === "th";
  const [activeOption, setActiveOption] = useState<HeroOption>("courses");

  // Academic & Industry Partners for the infinite marquee
  const partners = [
    { name: "AACSB Alliance", tag: "Global Business Education", abbr: "AACSB" },
    { name: "AUN-QA Network", tag: "ASEAN Quality Assurance", abbr: "AUN-QA" },
    { name: "The Stock Exchange of Thailand", tag: isTh ? "ตลาดหลักทรัพย์แห่งประเทศไทย" : "Capital Markets", abbr: "SET" },
    { name: "Federation of Accounting", tag: isTh ? "สภาวิชาชีพบัญชี ในพระบรมราชูปถัมภ์" : "National Accounting Body", abbr: "FAP" },
    { name: "Thailand Management Association", tag: isTh ? "สมาคมการจัดการธุรกิจแห่งประเทศไทย" : "Management Excellence", abbr: "TMA" },
    { name: "Bank of Thailand", tag: isTh ? "ธนาคารแห่งประเทศไทย" : "Central Banking", abbr: "BOT" },
    { name: "PwC Consulting", tag: "Global Advisory & Assurance", abbr: "PwC" },
    { name: "Deloitte Touche Tohmatsu", tag: "Strategic Financial Advisory", abbr: "Deloitte" },
    { name: "Ernst & Young", tag: "Audit & Tax Advisory", abbr: "EY" },
    { name: "KPMG International", tag: "Business Consulting", abbr: "KPMG" },
  ];

  return (
    <section className="relative overflow-hidden pt-6 pb-14 lg:pt-10 lg:pb-18 border-b border-border/40">
      {/* ── Background Giant Watermark Typography (matching Fiscal & Dribbble Outcrowd style) ── */}
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 select-none pointer-events-none text-[180px] sm:text-[280px] lg:text-[400px] font-black tracking-tighter text-foreground/[0.02] dark:text-white/[0.025] z-0 leading-none"
        aria-hidden="true"
      >
        {activeOption === "courses" ? "ACADEMIC" : activeOption === "services" ? "SMART FMS" : "INTAKE"}
      </div>

      {/* ── Background Atmospheric Ambient Glows ── */}
      <div
        className="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 w-[650px] h-[450px] bg-brand/15 dark:bg-brand/20 rounded-full blur-[130px] pointer-events-none -z-10 animate-glow-pulse"
        aria-hidden="true"
      />
      <div
        className="absolute top-1/2 right-10 -translate-y-1/2 w-[550px] h-[400px] bg-cyan-500/15 dark:bg-cyan-500/20 rounded-full blur-[110px] pointer-events-none -z-10 animate-glow-pulse"
        aria-hidden="true"
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 space-y-8 lg:space-y-10">
        {/* ── Top Multi-Option Segmented Switcher (Fiscal Dribbble 25327658 Signature Pattern) ── */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-1">
          {/* Segmented Control Bar */}
          <div className="p-1.5 rounded-2xl bg-card/80 dark:bg-card/90 border border-border/80 shadow-md backdrop-blur-md inline-flex items-center gap-1.5 w-full sm:w-auto max-w-full overflow-x-auto">
            {/* Option 1: Courses */}
            <button
              type="button"
              onClick={() => setActiveOption("courses")}
              className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all whitespace-nowrap cursor-pointer select-none ${
                activeOption === "courses"
                  ? "bg-brand text-on-brand shadow-md shadow-brand/25 scale-[1.02]"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/70"
              }`}
            >
              <GraduationCap className="w-4 h-4" />
              <span>{t("portal.hero.tab.courses")}</span>
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                  activeOption === "courses"
                    ? "bg-white/20 text-white"
                    : "bg-muted text-muted-foreground"
                }`}
              >
                {curriculaCount > 0 ? curriculaCount : "4+"}
              </span>
            </button>

            {/* Option 2: Smart Services */}
            <button
              type="button"
              onClick={() => setActiveOption("services")}
              className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all whitespace-nowrap cursor-pointer select-none ${
                activeOption === "services"
                  ? "bg-brand text-on-brand shadow-md shadow-brand/25 scale-[1.02]"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/70"
              }`}
            >
              <Zap className="w-4 h-4" />
              <span>{t("portal.hero.tab.services")}</span>
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                  activeOption === "services"
                    ? "bg-white/20 text-white"
                    : "bg-muted text-muted-foreground"
                }`}
              >
                {personnelCount > 0 ? `${personnelCount}` : "LIVE"}
              </span>
            </button>

            {/* Option 3: Admissions */}
            <button
              type="button"
              onClick={() => setActiveOption("admissions")}
              className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all whitespace-nowrap cursor-pointer select-none ${
                activeOption === "admissions"
                  ? "bg-brand text-on-brand shadow-md shadow-brand/25 scale-[1.02]"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/70"
              }`}
            >
              <Flame className="w-4 h-4 text-amber-300" />
              <span>{t("portal.hero.tab.admissions")}</span>
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                  activeOption === "admissions"
                    ? "bg-white/20 text-white"
                    : "bg-amber-500/10 text-amber-600 dark:text-amber-400 font-bold"
                }`}
              >
                2569
              </span>
            </button>
          </div>

          {/* Quick Active Track Status Pill (Right side) */}
          <div className="hidden lg:flex items-center gap-2 text-xs text-muted-foreground font-medium bg-card/60 px-3.5 py-1.5 rounded-full border border-border/60 backdrop-blur-xs">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
            </span>
            <span>
              {isTh
                ? `ระบบกำลังทำงาน: ${activeOption === "courses" ? "โหมดหลักสูตรวิชาการ" : activeOption === "services" ? "โหมดบริการดิจิทัล" : "โหมดรับสมัครออนไลน์"}`
                : `Active Mode: ${activeOption.toUpperCase()}`}
            </span>
          </div>
        </div>

        {/* ── Main 2-Column Hero Grid (Fiscal Multi-Option Split Layout) ── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center min-h-[460px]">
          {/* ══════════════════════════════════════════════════════
              LEFT COLUMN: Contextual Headline, Desc, Feature Chips & CTA
              ══════════════════════════════════════════════════════ */}
          <div className="lg:col-span-6 space-y-6 text-center lg:text-left animate-tab-in" key={`content-${activeOption}`}>
            {/* Eyebrow Pill Badge */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-brand/10 border border-brand/20 text-brand text-xs font-semibold shadow-xs">
              {activeOption === "courses" && <Sparkles className="w-3.5 h-3.5 text-brand animate-pulse" />}
              {activeOption === "services" && <Zap className="w-3.5 h-3.5 text-brand animate-bounce" />}
              {activeOption === "admissions" && <Flame className="w-3.5 h-3.5 text-amber-500 animate-pulse" />}
              <span>
                {activeOption === "courses" && t("portal.hero.courses.badge")}
                {activeOption === "services" && t("portal.hero.services.badge")}
                {activeOption === "admissions" && t("portal.hero.admissions.badge")}
              </span>
            </div>

            {/* Signature Hybrid Serif/Sans Headline (Embedding Tenant Org Name) */}
            <h1 className="text-3xl sm:text-5xl lg:text-[48px] font-extrabold tracking-tight text-foreground leading-[1.12]">
              {activeOption === "courses" && (
                <>
                  <span className="block">
                    <span className="font-serif italic font-normal text-muted-foreground mr-3 sm:mr-4 text-3xl sm:text-5xl lg:text-[46px]">
                      {t("portal.hero.courses.title_italic")}
                    </span>
                    <span className="font-black tracking-tight uppercase text-foreground">
                      {t("portal.hero.courses.title_bold")}
                    </span>
                  </span>
                  <span className="block mt-1 sm:mt-2">
                    <span className="font-black tracking-tight uppercase text-brand">
                      {t("portal.hero.courses.title_line2")}
                    </span>
                  </span>
                  <span className="block mt-1 sm:mt-2 text-xl sm:text-3xl lg:text-[32px] font-bold text-muted-foreground/90 leading-snug">
                    {orgName || t("portal.facultyName")}
                  </span>
                </>
              )}

              {activeOption === "services" && (
                <>
                  <span className="block">
                    <span className="font-serif italic font-normal text-muted-foreground mr-3 sm:mr-4 text-3xl sm:text-5xl lg:text-[46px]">
                      {t("portal.hero.services.title_italic")}
                    </span>
                    <span className="font-black tracking-tight uppercase text-brand">
                      {t("portal.hero.services.title_bold")}
                    </span>
                  </span>
                  <span className="block mt-1 sm:mt-2">
                    <span className="font-black tracking-tight uppercase text-foreground">
                      {t("portal.hero.services.title_line2")}
                    </span>
                  </span>
                  <span className="block mt-1 sm:mt-2 text-xl sm:text-3xl lg:text-[32px] font-bold text-muted-foreground/90 leading-snug">
                    {orgName || t("portal.facultyName")}
                  </span>
                </>
              )}

              {activeOption === "admissions" && (
                <>
                  <span className="block">
                    <span className="font-serif italic font-normal text-muted-foreground mr-3 sm:mr-4 text-3xl sm:text-5xl lg:text-[46px]">
                      {t("portal.hero.admissions.title_italic")}
                    </span>
                    <span className="font-black tracking-tight uppercase text-brand">
                      {t("portal.hero.admissions.title_bold")}
                    </span>
                  </span>
                  <span className="block mt-1 sm:mt-2">
                    <span className="font-black tracking-tight uppercase text-foreground">
                      {t("portal.hero.admissions.title_line2")}
                    </span>
                  </span>
                  <span className="block mt-1 sm:mt-2 text-xl sm:text-3xl lg:text-[32px] font-bold text-muted-foreground/90 leading-snug">
                    {orgName || t("portal.facultyName")}
                  </span>
                </>
              )}
            </h1>

            {/* Contextual Sub-headline Description */}
            <p className="text-base sm:text-lg text-muted-foreground leading-relaxed max-w-xl mx-auto lg:mx-0">
              {activeOption === "courses" && t("portal.hero.courses.desc")}
              {activeOption === "services" && t("portal.hero.services.desc")}
              {activeOption === "admissions" && t("portal.hero.admissions.desc")}
            </p>

            {/* Contextual Feature Pills (3 Micro Badges) */}
            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-2 sm:gap-2.5 pt-1">
              {activeOption === "courses" && (
                <>
                  <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-card/90 border border-border/70 text-xs font-semibold text-foreground shadow-2xs">
                    <CheckCircle2 className="w-3.5 h-3.5 text-brand" />
                    <span>{t("portal.hero.courses.feat1")}</span>
                  </div>
                  <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-card/90 border border-border/70 text-xs font-semibold text-foreground shadow-2xs">
                    <Award className="w-3.5 h-3.5 text-amber-500" />
                    <span>{t("portal.hero.courses.feat2")}</span>
                  </div>
                  <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-card/90 border border-border/70 text-xs font-semibold text-foreground shadow-2xs">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                    <span>{t("portal.hero.courses.feat3")}</span>
                  </div>
                </>
              )}

              {activeOption === "services" && (
                <>
                  <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-card/90 border border-border/70 text-xs font-semibold text-foreground shadow-2xs">
                    <QrCode className="w-3.5 h-3.5 text-brand" />
                    <span>{t("portal.hero.services.feat1")}</span>
                  </div>
                  <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-card/90 border border-border/70 text-xs font-semibold text-foreground shadow-2xs">
                    <CalendarCheck className="w-3.5 h-3.5 text-cyan-500" />
                    <span>{t("portal.hero.services.feat2")}</span>
                  </div>
                  <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-card/90 border border-border/70 text-xs font-semibold text-foreground shadow-2xs">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                    <span>{t("portal.hero.services.feat3")}</span>
                  </div>
                </>
              )}

              {activeOption === "admissions" && (
                <>
                  <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-card/90 border border-border/70 text-xs font-semibold text-foreground shadow-2xs">
                    <Flame className="w-3.5 h-3.5 text-amber-500" />
                    <span>{t("portal.hero.admissions.feat1")}</span>
                  </div>
                  <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-card/90 border border-border/70 text-xs font-semibold text-foreground shadow-2xs">
                    <Award className="w-3.5 h-3.5 text-brand" />
                    <span>{t("portal.hero.admissions.feat2")}</span>
                  </div>
                  <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-card/90 border border-border/70 text-xs font-semibold text-foreground shadow-2xs">
                    <Clock className="w-3.5 h-3.5 text-emerald-500" />
                    <span>{t("portal.hero.admissions.feat3")}</span>
                  </div>
                </>
              )}
            </div>

            {/* Action CTA Buttons */}
            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4 pt-2">
              {activeOption === "courses" && (
                <>
                  <Link
                    href="/portal/curriculum"
                    className="relative group overflow-hidden inline-flex items-center gap-3 px-7 py-3.5 rounded-xl bg-brand text-on-brand font-bold text-sm shadow-lg hover:shadow-brand/25 transition-all hover:scale-[1.02] active:scale-[0.98]"
                  >
                    <div className="absolute inset-0 w-1/2 h-full bg-gradient-to-r from-transparent via-white/25 to-transparent pointer-events-none -translate-x-full group-hover:translate-x-[250%] transition-transform duration-700 ease-in-out" />
                    <BookOpen className="w-4 h-4" />
                    <span>{t("portal.hero.courses.cta_primary")}</span>
                    <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                  </Link>

                  <Link
                    href="/portal/curriculum"
                    className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl border border-border bg-card/80 hover:bg-muted/80 backdrop-blur-xs font-semibold text-sm text-foreground transition-all hover:scale-[1.02] active:scale-[0.98]"
                  >
                    <span>{t("portal.hero.courses.cta_secondary")}</span>
                    <ChevronRight className="w-4 h-4 text-muted-foreground ml-0.5" />
                  </Link>
                </>
              )}

              {activeOption === "services" && (
                <>
                  <Link
                    href="/dashboard"
                    className="relative group overflow-hidden inline-flex items-center gap-3 px-7 py-3.5 rounded-xl bg-brand text-on-brand font-bold text-sm shadow-lg hover:shadow-brand/25 transition-all hover:scale-[1.02] active:scale-[0.98]"
                  >
                    <div className="absolute inset-0 w-1/2 h-full bg-gradient-to-r from-transparent via-white/25 to-transparent pointer-events-none -translate-x-full group-hover:translate-x-[250%] transition-transform duration-700 ease-in-out" />
                    <Zap className="w-4 h-4" />
                    <span>{t("portal.hero.services.cta_primary")}</span>
                    <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                  </Link>

                  <Link
                    href="/portal/attendance/scan"
                    className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl border border-border bg-card/80 hover:bg-muted/80 backdrop-blur-xs font-semibold text-sm text-foreground transition-all hover:scale-[1.02] active:scale-[0.98]"
                  >
                    <QrCode className="w-4 h-4 text-brand" />
                    <span>{t("portal.hero.services.cta_secondary")}</span>
                  </Link>
                </>
              )}

              {activeOption === "admissions" && (
                <>
                  <Link
                    href="/portal/curriculum"
                    className="relative group overflow-hidden inline-flex items-center gap-3 px-7 py-3.5 rounded-xl bg-brand text-on-brand font-bold text-sm shadow-lg hover:shadow-brand/25 transition-all hover:scale-[1.02] active:scale-[0.98]"
                  >
                    <div className="absolute inset-0 w-1/2 h-full bg-gradient-to-r from-transparent via-white/25 to-transparent pointer-events-none -translate-x-full group-hover:translate-x-[250%] transition-transform duration-700 ease-in-out" />
                    <Flame className="w-4 h-4" />
                    <span>{t("portal.hero.admissions.cta_primary")}</span>
                    <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                  </Link>

                  <Link
                    href="/portal/news"
                    className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl border border-border bg-card/80 hover:bg-muted/80 backdrop-blur-xs font-semibold text-sm text-foreground transition-all hover:scale-[1.02] active:scale-[0.98]"
                  >
                    <span>{t("portal.hero.admissions.cta_secondary")}</span>
                    <ChevronRight className="w-4 h-4 text-muted-foreground ml-0.5" />
                  </Link>
                </>
              )}
            </div>
          </div>

          {/* ══════════════════════════════════════════════════════
              RIGHT COLUMN: Dynamic Animated Visual Card Deck (Fiscal Style)
              ══════════════════════════════════════════════════════ */}
          <div className="lg:col-span-6 flex items-center justify-center min-h-[380px]">
            {/* OPTION 1: COURSES CARD DECK */}
            {activeOption === "courses" && (
              <div className="relative w-full max-w-[500px] animate-tab-in">
                {/* Ambient Glow */}
                <div className="absolute -inset-4 bg-gradient-to-r from-brand/20 via-purple-500/20 to-cyan-500/20 rounded-3xl blur-2xl -z-10 opacity-70 animate-glow-pulse" />

                {/* Main Feature Course Card */}
                <div className="rounded-3xl border border-border/80 bg-card/95 shadow-2xl p-6 sm:p-7 backdrop-blur-xl relative overflow-hidden transition-all hover:border-brand/50 hover:shadow-brand/20">
                  {/* Top Edge Highlight */}
                  <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-brand via-purple-500 to-cyan-400" />

                  {/* Header Row */}
                  <div className="flex items-center justify-between pb-4 border-b border-border/60">
                    <div className="flex items-center gap-2">
                      <span className="px-3 py-1 rounded-full text-xs font-extrabold bg-brand/10 text-brand border border-brand/20">
                        {isTh ? "หลักสูตรระดับปริญญาตรี" : "Bachelor's Degree"}
                      </span>
                      <span className="text-xs font-mono font-bold text-muted-foreground">
                        B.B.A. 2026
                      </span>
                    </div>
                    <div className="flex items-center gap-1 text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded-full">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                      <span>{isTh ? "เปิดรับสมัคร" : "Intake Open"}</span>
                    </div>
                  </div>

                  {/* Main Course Info */}
                  <div className="py-5 space-y-2">
                    <h3 className="text-xl sm:text-2xl font-black text-foreground tracking-tight leading-tight">
                      {t("portal.hero.card.degreeBBA")}
                    </h3>
                    <p className="text-sm font-medium text-brand">
                      {t("portal.hero.card.marketingTrack")}
                    </p>
                    <p className="text-xs text-muted-foreground pt-1 line-clamp-2">
                      {isTh
                        ? "เรียนรู้กลยุทธ์การตลาดดิจิทัล นวัตกรรมการเงิน ฟินเทค และการบริหารตราสินค้าในยุค AI"
                        : "Master digital marketing, financial technologies, and data-driven branding in the era of AI."}
                    </p>
                  </div>

                  {/* Course Metrics Grid */}
                  <div className="grid grid-cols-3 gap-3 py-3 px-4 rounded-2xl bg-muted/60 border border-border/50 text-center">
                    <div>
                      <div className="text-base sm:text-lg font-black text-foreground font-mono">132</div>
                      <div className="text-[11px] text-muted-foreground font-medium">{t("portal.curriculum.credits")}</div>
                    </div>
                    <div className="border-x border-border/60">
                      <div className="text-base sm:text-lg font-black text-foreground font-mono">4 {isTh ? "ปี" : "Yrs"}</div>
                      <div className="text-[11px] text-muted-foreground font-medium">{isTh ? "ระยะเวลา" : "Duration"}</div>
                    </div>
                    <div>
                      <div className="text-base sm:text-lg font-black text-emerald-600 dark:text-emerald-400 font-mono">98.6%</div>
                      <div className="text-[11px] text-muted-foreground font-medium">{isTh ? "ได้งานทำ" : "Employed"}</div>
                    </div>
                  </div>

                  {/* Bottom Row: Rating & Student Avatars */}
                  <div className="pt-5 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="flex -space-x-2">
                        <div className="w-8 h-8 rounded-full bg-purple-500/20 border-2 border-card flex items-center justify-center text-xs font-bold text-purple-600">นส</div>
                        <div className="w-8 h-8 rounded-full bg-cyan-500/20 border-2 border-card flex items-center justify-center text-xs font-bold text-cyan-600">ชญ</div>
                        <div className="w-8 h-8 rounded-full bg-amber-500/20 border-2 border-card flex items-center justify-center text-xs font-bold text-amber-600">กม</div>
                      </div>
                      <span className="text-xs font-semibold text-muted-foreground">
                        {t("portal.hero.card.enrolled")}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5 text-xs font-bold text-foreground">
                      <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                      <span>4.9</span>
                      <span className="text-muted-foreground font-normal">(520+)</span>
                    </div>
                  </div>
                </div>

                {/* Floating Micro-Badge (Top Right): AUN-QA Standard */}
                <div className="absolute -top-5 -right-4 sm:-right-6 px-4 py-2 rounded-2xl bg-card/95 border border-border/80 shadow-xl backdrop-blur-md flex items-center gap-2.5 animate-float-badge">
                  <div className="w-7 h-7 rounded-xl bg-brand/10 text-brand flex items-center justify-center">
                    <Award className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-foreground">AUN-QA Certified</div>
                    <div className="text-[10px] text-muted-foreground">มาตรฐานระดับสากล</div>
                  </div>
                </div>

                {/* Floating Micro-Badge (Bottom Left): Live Students */}
                <div className="absolute -bottom-5 -left-4 sm:-left-6 px-4 py-2 rounded-2xl bg-card/95 border border-emerald-500/30 shadow-xl backdrop-blur-md flex items-center gap-2.5 animate-float-slow">
                  <div className="w-7 h-7 rounded-xl bg-emerald-500/15 text-emerald-500 flex items-center justify-center">
                    <TrendingUp className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-foreground">+98.6% Employment</div>
                    <div className="text-[10px] text-muted-foreground">จบแล้วมีงานทำทันที</div>
                  </div>
                </div>
              </div>
            )}

            {/* OPTION 2: SMART DIGITAL PASS DECK */}
            {activeOption === "services" && (
              <div className="w-full flex items-center justify-center animate-tab-in">
                <PortalHero3D />
              </div>
            )}

            {/* OPTION 3: DIRECT ADMISSIONS & SCHOLARSHIPS DECK */}
            {activeOption === "admissions" && (
              <div className="relative w-full max-w-[500px] animate-tab-in">
                {/* Ambient Glow */}
                <div className="absolute -inset-4 bg-gradient-to-r from-amber-500/20 via-brand/20 to-emerald-500/20 rounded-3xl blur-2xl -z-10 opacity-70 animate-glow-pulse" />

                {/* Admissions Passport Card */}
                <div className="rounded-3xl border border-amber-500/30 bg-card/95 shadow-2xl p-6 sm:p-7 backdrop-blur-xl relative overflow-hidden transition-all hover:border-amber-500/60">
                  {/* Top Highlight Banner */}
                  <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-amber-500 via-brand to-emerald-500" />

                  {/* Header Row */}
                  <div className="flex items-center justify-between pb-4 border-b border-border/60">
                    <div className="flex items-center gap-2">
                      <span className="px-3 py-1 rounded-full text-xs font-black bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30">
                        {t("portal.hero.card.admissionsLive")}
                      </span>
                      <span className="text-xs font-mono font-bold text-muted-foreground">
                        INTAKE 2026
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5 text-xs font-bold text-brand bg-brand/10 px-3 py-1 rounded-full">
                      <Clock className="w-3.5 h-3.5" />
                      <span>{isTh ? "เหลือ 14 วันสุดท้าย" : "14 Days Left"}</span>
                    </div>
                  </div>

                  {/* Quota & Seats Details */}
                  <div className="py-5 space-y-4">
                    <div>
                      <div className="flex items-center justify-between text-xs font-semibold text-muted-foreground pb-1.5">
                        <span>{isTh ? "โควตาที่นั่งเปิดรับ (350 ที่นั่ง)" : "Seat Quota Allocation"}</span>
                        <span className="font-mono text-foreground font-bold">{t("portal.hero.card.seatsAvailable")}</span>
                      </div>
                      {/* Animated Progress Bar */}
                      <div className="w-full h-3 rounded-full bg-muted overflow-hidden p-0.5">
                        <div className="h-full rounded-full bg-gradient-to-r from-brand via-amber-500 to-emerald-500 w-[78%] transition-all duration-1000" />
                      </div>
                    </div>

                    {/* Scholarship Feature Box */}
                    <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-start gap-3">
                      <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0 mt-0.5">
                        <Award className="w-5 h-5" />
                      </div>
                      <div className="space-y-0.5 text-left">
                        <h4 className="text-sm font-bold text-foreground">
                          {isTh ? "ทุนการศึกษาพิเศษ 50 ทุน" : "50 Merit Scholarships"}
                        </h4>
                        <p className="text-xs text-muted-foreground leading-relaxed">
                          {isTh
                            ? "สนับสนุนค่าธรรมเนียมการศึกษาตลอดหลักสูตร สำหรับผู้มีผลการเรียนดีและโควตานักกีฬา/คุณธรรม"
                            : "Full and partial tuition waivers for distinguished academic, sports, and leadership excellence."}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Fast Action Footer */}
                  <div className="pt-2 flex items-center justify-between">
                    <div className="flex items-center gap-2 text-xs text-muted-foreground font-medium">
                      <Users className="w-4 h-4 text-brand" />
                      <span>{isTh ? "สมัครผ่านออนไลน์ 100%" : "100% Online Paperless"}</span>
                    </div>

                    <Link
                      href="/portal/curriculum"
                      className="inline-flex items-center gap-1.5 text-xs font-bold text-brand hover:underline"
                    >
                      <span>{isTh ? "ตรวจสอบคุณสมบัติ →" : "Check Eligibility →"}</span>
                    </Link>
                  </div>
                </div>

                {/* Floating Fast Decision Badge (Top-Left) */}
                <div className="absolute -top-5 -left-4 sm:-left-6 px-4 py-2 rounded-2xl bg-card/95 border border-border/80 shadow-xl backdrop-blur-md flex items-center gap-2.5 animate-float-badge">
                  <div className="w-7 h-7 rounded-xl bg-emerald-500/15 text-emerald-500 flex items-center justify-center">
                    <CheckCircle2 className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-foreground">{isTh ? "ประกาศผลไว" : "Fast Track"}</div>
                    <div className="text-[10px] text-muted-foreground">{isTh ? "ทราบผลใน 3 วันทำการ" : "Decided in 3 Days"}</div>
                  </div>
                </div>

                {/* Floating Helpline Badge (Bottom-Right) */}
                <div className="absolute -bottom-5 -right-4 sm:-right-6 px-4 py-2 rounded-2xl bg-card/95 border border-brand/30 shadow-xl backdrop-blur-md flex items-center gap-2.5 animate-float-slow">
                  <div className="w-7 h-7 rounded-xl bg-brand/15 text-brand flex items-center justify-center">
                    <Headphones className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-foreground">{isTh ? "ฝ่ายรับสมัครออนไลน์" : "Admissions Desk"}</div>
                    <div className="text-[10px] text-muted-foreground">{isTh ? "โทร 0-2470-8000" : "+66 2 470 8000"}</div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ── Bottom Feature Bar (Trust Strip matching Dribbble Shot Bottom) ── */}
        <div className="mt-14 lg:mt-16 pt-8 border-t border-border/50">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 lg:gap-8">
            {/* Feature 1: Customer Support */}
            <div className="flex items-center gap-3.5 group">
              <div className="w-10 h-10 rounded-xl bg-brand/10 border border-brand/20 text-brand flex items-center justify-center flex-none transition-transform group-hover:scale-110">
                <Headphones className="w-5 h-5" />
              </div>
              <div className="space-y-0.5">
                <h4 className="text-xs sm:text-sm font-bold text-foreground leading-tight">
                  {t("portal.hero.trust.support")}
                </h4>
                <p className="text-[11px] text-muted-foreground leading-tight">
                  {t("portal.hero.trust.supportSub")}
                </p>
              </div>
            </div>

            {/* Feature 2: Enterprise Security */}
            <div className="flex items-center gap-3.5 group">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center flex-none transition-transform group-hover:scale-110">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div className="space-y-0.5">
                <h4 className="text-xs sm:text-sm font-bold text-foreground leading-tight">
                  {t("portal.hero.trust.security")}
                </h4>
                <p className="text-[11px] text-muted-foreground leading-tight">
                  {t("portal.hero.trust.securitySub")}
                </p>
              </div>
            </div>

            {/* Feature 3: Fast Track Approval */}
            <div className="flex items-center gap-3.5 group">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center flex-none transition-transform group-hover:scale-110">
                <Zap className="w-5 h-5" />
              </div>
              <div className="space-y-0.5">
                <h4 className="text-xs sm:text-sm font-bold text-foreground leading-tight">
                  {t("portal.hero.trust.instant")}
                </h4>
                <p className="text-[11px] text-muted-foreground leading-tight">
                  {t("portal.hero.trust.instantSub")}
                </p>
              </div>
            </div>

            {/* Feature 4: All-in-One Platform */}
            <div className="flex items-center gap-3.5 group">
              <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-600 dark:text-cyan-400 flex items-center justify-center flex-none transition-transform group-hover:scale-110">
                <Layers className="w-5 h-5" />
              </div>
              <div className="space-y-0.5">
                <h4 className="text-xs sm:text-sm font-bold text-foreground leading-tight">
                  {t("portal.hero.trust.integrated")}
                </h4>
                <p className="text-[11px] text-muted-foreground leading-tight">
                  {t("portal.hero.trust.integratedSub")}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* ── Bottom Ribbon: Infinite Partner Marquee ── */}
        <div className="mt-12 pt-6 border-t border-border/40">
          <p className="text-center text-xs font-bold tracking-widest uppercase text-muted-foreground/75 mb-4">
            {t("portal.hero.partnersTitle")}
          </p>

          <div className="relative overflow-hidden before:absolute before:inset-y-0 before:left-0 before:w-20 before:bg-gradient-to-r before:from-background before:to-transparent before:z-10 after:absolute after:inset-y-0 after:right-0 after:w-20 after:bg-gradient-to-l after:from-background after:to-transparent after:z-10">
            <div className="animate-marquee flex items-center gap-6">
              {[...partners, ...partners].map((item, idx) => (
                <div
                  key={`${item.abbr}-${idx}`}
                  className="flex items-center gap-3 px-4 py-2.5 rounded-xl border border-border/70 bg-card/60 backdrop-blur-xs hover:border-brand/40 hover:bg-card transition-all flex-none group cursor-default"
                >
                  <div className="w-7 h-7 rounded-lg bg-muted flex items-center justify-center font-extrabold text-[10px] text-foreground font-mono group-hover:text-brand transition-colors">
                    {item.abbr}
                  </div>
                  <div className="flex flex-col text-left">
                    <span className="text-xs font-semibold text-foreground leading-tight group-hover:text-brand transition-colors">
                      {item.name}
                    </span>
                    <span className="text-[10px] text-muted-foreground leading-tight">
                      {item.tag}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
