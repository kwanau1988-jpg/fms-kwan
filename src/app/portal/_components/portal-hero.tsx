import Link from "next/link";
import {
  ArrowRight,
  BookOpen,
  Sparkles,
  Headphones,
  ShieldCheck,
  Zap,
  Layers,
} from "lucide-react";
import { PortalHero3D } from "./portal-hero-3d";

interface PortalHeroProps {
  t: (key: string) => string;
  isTh: boolean;
  curriculaCount: number;
  personnelCount: number;
}

export function PortalHero({ t, isTh }: PortalHeroProps) {
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
    <section className="relative overflow-hidden pt-8 pb-14 lg:pt-14 lg:pb-18 border-b border-border/40">
      {/* ── Background Giant Watermark Typography (matching Dribbble shot "36") ── */}
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 select-none pointer-events-none text-[200px] sm:text-[300px] lg:text-[420px] font-black tracking-tighter text-foreground/[0.02] dark:text-white/[0.025] z-0 leading-none"
        aria-hidden="true"
      >
        FMS
      </div>

      {/* ── Background Atmospheric Ambient Glows ── */}
      <div
        className="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 w-[650px] h-[450px] bg-purple-600/15 dark:bg-purple-600/20 rounded-full blur-[120px] pointer-events-none -z-10 animate-glow-pulse"
        aria-hidden="true"
      />
      <div
        className="absolute top-1/2 right-10 -translate-y-1/2 w-[550px] h-[400px] bg-cyan-500/15 dark:bg-cyan-500/20 rounded-full blur-[100px] pointer-events-none -z-10 animate-glow-pulse"
        aria-hidden="true"
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* ── Main 2-Column Hero Grid (Dribbble 25401411 Style) ── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          {/* Left Column: Hybrid Typography & CTAs (span 6 or 7) */}
          <div className="lg:col-span-6 space-y-7 text-center lg:text-left">
            {/* Eyebrow Pill Badge with live radar pulse */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-brand/10 border border-brand/20 text-brand text-xs font-semibold shadow-xs">
              <Sparkles className="w-3.5 h-3.5 text-brand animate-pulse" />
              <span>{t("portal.hero.badge")}</span>
            </div>

            {/* Signature Hybrid Serif/Sans Headline (Dribbble 25401411 Concept) */}
            <h1 className="text-3xl sm:text-5xl lg:text-[52px] font-extrabold tracking-tight text-foreground leading-[1.12]">
              <span className="block">
                <span className="font-serif italic font-normal text-muted-foreground mr-3 sm:mr-4 text-3xl sm:text-5xl lg:text-[50px]">
                  {t("portal.hero.hybrid.line1_italic")}
                </span>
                <span className="font-black tracking-tight uppercase text-foreground">
                  {t("portal.hero.hybrid.line1_bold")}
                </span>
              </span>

              <span className="block mt-1 sm:mt-2">
                <span className="font-serif italic font-normal text-muted-foreground mr-3 sm:mr-4 text-3xl sm:text-5xl lg:text-[50px]">
                  {t("portal.hero.hybrid.line2_italic")}
                </span>
                <span className="font-black tracking-tight uppercase text-brand">
                  {t("portal.hero.hybrid.line2_bold")}
                </span>
              </span>

              <span className="block mt-1 sm:mt-2">
                <span className="font-black tracking-tight uppercase text-foreground">
                  {t("portal.hero.hybrid.line3_bold")}
                </span>{" "}
                <span className="font-serif italic font-normal text-muted-foreground mx-2 sm:mx-3 text-2xl sm:text-4xl lg:text-[44px]">
                  {t("portal.hero.hybrid.line3_italic")}
                </span>{" "}
                <span className="font-black tracking-tight uppercase text-brand">
                  {t("portal.hero.hybrid.line3_bold2")}
                </span>
              </span>

              <span className="block mt-1 sm:mt-2">
                <Link
                  href="/portal/curriculum"
                  className="inline-flex items-center gap-3 sm:gap-4 font-black tracking-tight uppercase text-foreground group hover:text-brand transition-colors"
                >
                  <span>{t("portal.hero.hybrid.line4_bold")}</span>
                  <span className="inline-flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-brand/10 border border-brand/30 text-brand text-xl sm:text-2xl group-hover:bg-brand group-hover:text-on-brand group-hover:translate-x-2 transition-all shadow-sm">
                    →
                  </span>
                </Link>
              </span>
            </h1>

            {/* Sub-headline Description */}
            <p className="text-base sm:text-lg text-muted-foreground leading-relaxed max-w-xl mx-auto lg:mx-0">
              {t("portal.hero.desc")}
            </p>

            {/* Action CTA Buttons */}
            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4 pt-1">
              <Link
                href="/portal/curriculum"
                className="relative group overflow-hidden inline-flex items-center gap-3 px-7 py-3.5 rounded-xl bg-brand text-on-brand font-bold text-sm shadow-lg hover:shadow-brand/25 transition-all hover:scale-[1.02] active:scale-[0.98]"
              >
                {/* Shimmer Light Reflection */}
                <div className="absolute inset-0 w-1/2 h-full bg-gradient-to-r from-transparent via-white/25 to-transparent pointer-events-none -translate-x-full group-hover:translate-x-[250%] transition-transform duration-700 ease-in-out" />
                <BookOpen className="w-4 h-4" />
                <span>{t("portal.hero.explore")}</span>
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </Link>

              <Link
                href="/login"
                className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl border border-border bg-card/80 hover:bg-muted/80 backdrop-blur-xs font-semibold text-sm text-foreground transition-all hover:scale-[1.02] active:scale-[0.98]"
              >
                <span>{t("portal.nav.signIn")}</span>
                <ArrowRight className="w-4 h-4 text-muted-foreground ml-0.5" />
              </Link>
            </div>
          </div>

          {/* Right Column: 3D Cascading Cards Animation Component (span 6) */}
          <div className="lg:col-span-6 flex items-center justify-center">
            <PortalHero3D />
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
