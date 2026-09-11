"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  BookOpen,
  Headphones,
  ShieldCheck,
  Zap,
  Layers,
  ChevronRight,
  Flame,
} from "lucide-react";
import { PortalHeroCrystal, type CrystalMode } from "./portal-hero-crystal";
import { useT, useLocale } from "@/shared/lib/i18n/client";

interface PortalHeroProps {
  curriculaCount: number;
  personnelCount: number;
  orgName?: string;
}

export function PortalHero({ orgName, curriculaCount, personnelCount }: PortalHeroProps) {
  const t = useT();
  const locale = useLocale();
  const isTh = locale === "th";
  const [activeMode, setActiveMode] = useState<CrystalMode>("academic");

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
    <section className="relative overflow-hidden pt-6 pb-14 lg:pt-10 lg:pb-18 border-b border-border/40 bg-background">
      {/* ── Background Giant Watermark Typography (GenAuxi NFT Aesthetic) ── */}
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 select-none pointer-events-none text-[180px] sm:text-[280px] lg:text-[380px] font-black tracking-tighter text-foreground/[0.02] dark:text-white/[0.025] z-0 leading-none"
        aria-hidden="true"
      >
        GENAUXI
      </div>

      {/* ── Background Atmospheric Ambient Glows ── */}
      <div
        className="absolute top-1/3 left-1/4 -translate-x-1/2 -translate-y-1/2 w-[650px] h-[450px] bg-purple-600/10 dark:bg-purple-600/20 rounded-full blur-[140px] pointer-events-none -z-10 animate-glow-pulse"
        aria-hidden="true"
      />
      <div
        className="absolute top-1/2 right-10 -translate-y-1/2 w-[550px] h-[400px] bg-cyan-500/10 dark:bg-cyan-500/20 rounded-full blur-[130px] pointer-events-none -z-10 animate-glow-pulse"
        aria-hidden="true"
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 space-y-10 lg:space-y-12">
        {/* ── Top Status & Mode Indicator Bar ── */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-1">
          {/* Eyebrow Pill Badge (GenAuxi Smart Architecture) */}
          <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-card/85 dark:bg-card/90 border border-border/80 shadow-xs backdrop-blur-md">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
            </span>
            <span className="text-xs font-bold text-foreground font-mono tracking-wide">
              {t("portal.hero.genauxi.badge")}
            </span>
          </div>

          {/* Quick Active Pillar Status Indicator */}
          <div className="flex items-center gap-3 text-xs text-muted-foreground font-medium bg-card/60 px-4 py-1.5 rounded-full border border-border/60 backdrop-blur-xs">
            <span className="font-semibold text-foreground">
              {t("portal.hero.genauxi.status_operational")}
            </span>
            <span className="text-border">|</span>
            <span className="text-amber-500 dark:text-amber-400 font-bold flex items-center gap-1">
              <Flame className="w-3.5 h-3.5" />
              {t("portal.hero.genauxi.intake_badge")}
            </span>
          </div>
        </div>

        {/* ── Main 2-Column Hero Grid (GenAuxi Split Composition) ── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-8 items-center min-h-[500px]">
          
          {/* ══════════════════════════════════════════════════════
              LEFT COLUMN: 3D Animated Faceted Crystal Monolith
              ══════════════════════════════════════════════════════ */}
          <div className="lg:col-span-6 flex items-center justify-center relative">
            <PortalHeroCrystal
              activeMode={activeMode}
              onModeChange={(m) => setActiveMode(m)}
            />
          </div>

          {/* ── Subtle Vertical Hairline Divider (Matching GenAuxi Shot) ── */}
          <div className="hidden lg:block lg:col-span-1 h-[420px] w-[1px] bg-gradient-to-b from-transparent via-border/70 to-transparent mx-auto" />

          {/* ══════════════════════════════════════════════════════
              RIGHT COLUMN: GenAuxi Typography, Quote & CTAs
              ══════════════════════════════════════════════════════ */}
          <div className="lg:col-span-5 space-y-6 text-center lg:text-left">
            
            {/* GenAuxi Contextual Sub-Title / Category Indicator */}
            <div className="flex items-center justify-center lg:justify-start gap-4 text-xs font-mono font-bold tracking-wider text-muted-foreground uppercase">
              <span className={activeMode === "academic" ? "text-purple-500 font-extrabold" : ""}>
                {t("portal.hero.crystal.mode_academic")}
              </span>
              <span>/</span>
              <span className={activeMode === "smart" ? "text-cyan-500 font-extrabold" : ""}>
                {t("portal.hero.crystal.mode_smart")}
              </span>
              <span>/</span>
              <span className={activeMode === "admissions" ? "text-amber-500 font-extrabold" : ""}>
                {t("portal.hero.crystal.mode_admissions")}
              </span>
            </div>

            {/* GenAuxi Signature Headline: "Create the Future – Don't Just Watch It" */}
            <div className="space-y-2">
              <h1 className="text-3xl sm:text-4xl lg:text-[46px] font-black tracking-tight text-foreground leading-[1.12]">
                <span className="block text-foreground">
                  {t("portal.hero.genauxi.title_line1")}
                </span>
                <span className="block text-brand dark:text-white mt-1">
                  {t("portal.hero.genauxi.title_line2")}
                </span>
              </h1>

              {/* Dynamic Organization Name Sub-Headline */}
              <div className="pt-2">
                <h2 className="text-lg sm:text-xl lg:text-[22px] font-bold text-muted-foreground/90 leading-snug">
                  {orgName || t("portal.facultyName")}
                </h2>
              </div>
            </div>

            {/* GenAuxi Quote Description */}
            <p className="text-sm sm:text-base text-muted-foreground leading-relaxed italic border-l-2 border-brand/40 pl-4 py-0.5 max-w-xl mx-auto lg:mx-0">
              &ldquo;{t("portal.hero.genauxi.quote")}&rdquo;
            </p>

            {/* GenAuxi Style Action Buttons */}
            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4 pt-2">
              {/* Primary Pill Button (High Contrast Crisp White / Dark Pill) */}
              <Link
                href="/portal/curriculum"
                className="relative group overflow-hidden inline-flex items-center gap-3 px-8 py-3.5 rounded-full bg-foreground text-background font-black text-sm shadow-xl hover:shadow-brand/25 transition-all hover:scale-[1.03] active:scale-[0.98] select-none"
              >
                {/* Light Sweep Reflection */}
                <div className="absolute inset-0 w-1/2 h-full bg-gradient-to-r from-transparent via-white/30 to-transparent pointer-events-none -translate-x-full group-hover:translate-x-[250%] transition-transform duration-700 ease-in-out" />
                <BookOpen className="w-4 h-4" />
                <span>{t("portal.hero.genauxi.cta_primary")}</span>
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </Link>

              {/* Secondary Pill Button */}
              <Link
                href="/dashboard"
                className="inline-flex items-center gap-2 px-6 py-3.5 rounded-full border border-border bg-card/80 hover:bg-muted/80 backdrop-blur-xs font-bold text-sm text-foreground transition-all hover:scale-[1.02] active:scale-[0.98]"
              >
                <Zap className="w-4 h-4 text-brand" />
                <span>{t("portal.hero.genauxi.cta_secondary")}</span>
                <ChevronRight className="w-4 h-4 text-muted-foreground ml-0.5" />
              </Link>
            </div>

            {/* Key Metrics Grid (GenAuxi Minimalist Strip) */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-6 border-t border-border/60">
              <div className="text-center lg:text-left space-y-0.5">
                <div className="text-xl sm:text-2xl font-black text-foreground font-mono">
                  {curriculaCount > 0 ? curriculaCount : "4+"}
                </div>
                <div className="text-[11px] text-muted-foreground font-medium">
                  {t("portal.hero.genauxi.metric_programs")}
                </div>
              </div>

              <div className="text-center lg:text-left space-y-0.5 border-l sm:border-x border-border/60 pl-3 sm:px-3">
                <div className="text-xl sm:text-2xl font-black text-purple-600 dark:text-purple-400 font-mono">
                  {personnelCount > 0 ? `${personnelCount}+` : "40+"}
                </div>
                <div className="text-[11px] text-muted-foreground font-medium">
                  {t("portal.stats.faculty")}
                </div>
              </div>

              <div className="text-center lg:text-left space-y-0.5 border-t sm:border-t-0 pt-2 sm:pt-0 sm:border-r border-border/60 sm:pr-3">
                <div className="text-xl sm:text-2xl font-black text-emerald-600 dark:text-emerald-400 font-mono">
                  98.6%
                </div>
                <div className="text-[11px] text-muted-foreground font-medium">
                  {t("portal.hero.genauxi.metric_employment")}
                </div>
              </div>

              <div className="text-center lg:text-left space-y-0.5 border-t sm:border-t-0 pt-2 sm:pt-0 pl-3">
                <div className="text-xl sm:text-2xl font-black text-brand font-mono">
                  100%
                </div>
                <div className="text-[11px] text-muted-foreground font-medium">
                  {t("portal.hero.genauxi.metric_paperless")}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ── Bottom Feature Bar (Trust Strip matching Institutional Rigor) ── */}
        <div className="mt-14 lg:mt-16 pt-8 border-t border-border/50">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 lg:gap-8">
            {/* Feature 1: Customer Support */}
            <div className="flex items-center gap-3.5 group">
              <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-600 dark:text-purple-400 flex items-center justify-center flex-none transition-transform group-hover:scale-110">
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
