import Link from "next/link";
import {
  ArrowRight,
  BookOpen,
  Sparkles,
  Star,
  CheckCircle2,
  QrCode,
  Calendar,
  TrendingUp,
  ShieldCheck,
  Newspaper,
} from "lucide-react";

interface PortalHeroProps {
  t: (key: string) => string;
  isTh: boolean;
  curriculaCount: number;
  personnelCount: number;
}

export function PortalHero({ t, isTh, curriculaCount, personnelCount }: PortalHeroProps) {
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
    <section className="relative overflow-hidden pt-8 pb-12 lg:pt-14 lg:pb-16 border-b border-border/40">
      {/* Background Ambient Glows */}
      <div
        className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-brand/10 rounded-full blur-3xl pointer-events-none -z-10"
        aria-hidden="true"
      />
      <div
        className="absolute top-10 right-10 w-[300px] h-[250px] bg-brand/5 rounded-full blur-2xl pointer-events-none -z-10"
        aria-hidden="true"
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Main 2-Column Hero Grid (Monotree Style) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          {/* Left Column: Copy, Rating & Metric Counters (span 7) */}
          <div className="lg:col-span-7 space-y-7 text-center lg:text-left">
            {/* Eyebrow Badge */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-brand/10 border border-brand/20 text-brand text-xs font-semibold shadow-xs">
              <Sparkles className="w-3.5 h-3.5 text-brand animate-pulse" />
              <span>{t("portal.hero.badge")}</span>
            </div>

            {/* Main Headline with Hand-Drawn Curve Underline */}
            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-foreground leading-[1.16]">
              {t("portal.hero.title1")}{" "}
              <span className="relative inline-block text-brand whitespace-nowrap">
                {t("portal.hero.accent")}
                {/* Hand-drawn underline SVG flourish matching Monotree */}
                <svg
                  className="absolute -bottom-2 sm:-bottom-3 left-0 w-full h-3 sm:h-4 text-brand pointer-events-none"
                  viewBox="0 0 188 10"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  preserveAspectRatio="none"
                  aria-hidden="true"
                >
                  <path
                    d="M3 6.5C48 2.5 142 1.5 185 6.5M118 5C138 3.5 168 3.5 184 6.5M80 5.2C48 6 22 7.5 4 8.5"
                    stroke="currentColor"
                    strokeWidth="2.2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </span>
              <br className="hidden sm:inline" />
              {" "}{t("portal.hero.title2")}
            </h1>

            {/* Sub-headline Description */}
            <p className="text-base sm:text-lg text-muted-foreground leading-relaxed max-w-2xl mx-auto lg:mx-0">
              {t("portal.hero.desc")}
            </p>

            {/* CTA Action Buttons */}
            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-3.5 pt-1">
              <Link
                href="/portal/curriculum"
                className="inline-flex items-center gap-2.5 px-6 py-3.5 rounded-xl bg-brand text-on-brand font-semibold text-sm shadow-md hover:bg-brand/90 transition-all hover:scale-[1.02] active:scale-[0.98]"
              >
                <BookOpen className="w-4 h-4" />
                <span>{t("portal.hero.explore")}</span>
                <ArrowRight className="w-4 h-4 ml-0.5" />
              </Link>

              <Link
                href="/portal/news"
                className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl border border-border bg-card/80 hover:bg-muted/80 backdrop-blur-xs font-medium text-sm transition-all hover:scale-[1.02] active:scale-[0.98]"
              >
                <Newspaper className="w-4 h-4 text-muted-foreground" />
                <span>{t("portal.hero.latestNews")}</span>
              </Link>
            </div>

            {/* Monotree Signature Social Proof Rating Figure */}
            <figure className="pt-2 flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3">
              <div className="flex items-center gap-1">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className="w-4 h-4 fill-amber-400 text-amber-400"
                    aria-hidden="true"
                  />
                ))}
              </div>
              <div className="flex items-center gap-2 text-xs">
                <span className="font-bold text-foreground text-sm">
                  {t("portal.hero.ratingScore")} / 5.0
                </span>
                <span className="text-muted-foreground">·</span>
                <span className="text-muted-foreground">
                  {t("portal.hero.ratingLabel")}
                </span>
                <span className="hidden sm:inline text-muted-foreground/60">({t("portal.hero.ratingSub")})</span>
              </div>
            </figure>

            {/* Monotree Metric Strip (<dl>) with Vertical Border Dividers */}
            <dl className="pt-6 border-t border-border/60 grid grid-cols-3 gap-4 sm:gap-6 text-left">
              <div className="space-y-1">
                <dt className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight">
                  {t("portal.hero.metric1.val")}
                </dt>
                <dd className="text-xs text-muted-foreground leading-snug">
                  {t("portal.hero.metric1.label")}
                </dd>
              </div>

              <div className="space-y-1 border-l border-border/80 pl-4 sm:pl-6">
                <dt className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight">
                  {curriculaCount > 0 ? `${curriculaCount}+` : t("portal.hero.metric2.val")}
                </dt>
                <dd className="text-xs text-muted-foreground leading-snug">
                  {t("portal.hero.metric2.label")}
                </dd>
              </div>

              <div className="space-y-1 border-l border-border/80 pl-4 sm:pl-6">
                <dt className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight">
                  {personnelCount > 0 ? `${personnelCount}+` : t("portal.hero.metric3.val")}
                </dt>
                <dd className="text-xs text-muted-foreground leading-snug">
                  {isTh ? "คณาจารย์และผู้เชี่ยวชาญ" : "Faculty & Specialists"}
                </dd>
              </div>
            </dl>
          </div>

          {/* Right Column: Signature Isometric 3D Showcase (span 5) */}
          <div className="lg:col-span-5 relative flex items-center justify-center">
            {/* Perspective Canvas Container */}
            <div className="relative w-full max-w-[460px] aspect-[4/4] select-none">
              {/* Isometric Background Grid Lines */}
              <svg
                className="absolute inset-0 w-full h-full text-border/40 pointer-events-none"
                viewBox="0 0 460 460"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path d="M60 230L230 130L400 230L230 330L60 230Z" stroke="currentColor" strokeWidth="1" strokeDasharray="4 4" />
                <path d="M230 50V410" stroke="currentColor" strokeWidth="1" strokeDasharray="3 3" opacity="0.4" />
                <path d="M60 230H400" stroke="currentColor" strokeWidth="1" strokeDasharray="3 3" opacity="0.4" />
              </svg>

              {/* ── CARD 1: Smart QR Attendance Tablet (Center Showcase) ── */}
              <div className="absolute top-[18%] left-[8%] right-[8%] p-5 rounded-2xl border border-border bg-card/95 shadow-xl backdrop-blur-md transition-all hover:scale-[1.02] duration-300 z-20">
                <div className="flex items-center justify-between pb-3 border-b border-border/50">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-brand/10 text-brand flex items-center justify-center flex-none">
                      <QrCode className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-foreground">
                        {t("portal.hero.card.qrScan")}
                      </h4>
                      <p className="text-[10px] text-muted-foreground">
                        Anti-Spoof Dynamic Token
                      </p>
                    </div>
                  </div>
                  <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
                    {t("portal.hero.card.statusLive")}
                  </span>
                </div>

                <div className="pt-3 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl border border-border bg-muted/30 p-1 flex items-center justify-center relative overflow-hidden">
                      {/* Stylized QR Vector */}
                      <svg className="w-full h-full text-foreground/80" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M2 2h7v7H2V2zm2 2v3h3V4H4zm11-2h7v7h-7V2zm2 2v3h3V4h-3zM2 15h7v7H2v-7zm2 2v3h3v-3H4zm9 2h2v3h-2v-3zm4-2h3v2h-3v-2zm-2-2h2v2h-2v-2zm4 4h3v3h-3v-3zm-6-2h2v2h-2v-2zm2-2h2v2h-2v-2zm4-2h3v2h-3v-2z" />
                      </svg>
                      {/* Scanning Line Animation */}
                      <div className="absolute inset-x-0 h-0.5 bg-brand/80 shadow-xs animate-bounce" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-foreground">
                        {t("portal.hero.card.attendanceRate")}
                      </div>
                      <div className="text-[10px] text-muted-foreground">
                        {isTh ? "หมุนเวียนรหัสป้องกันทุจริต 15 นาที" : "15-min Anti-spoof Rotation"}
                      </div>
                    </div>
                  </div>

                  <div className="text-right flex-none">
                    <div className="text-base font-extrabold text-brand">48/50</div>
                    <div className="text-[9px] text-muted-foreground uppercase tracking-wider">Students In</div>
                  </div>
                </div>
              </div>

              {/* ── CARD 2: E-Document Approval Stamp (Floating Bottom-Left) ── */}
              <div className="absolute -bottom-2 sm:bottom-4 left-0 p-3.5 rounded-xl border border-border bg-card/95 shadow-lg backdrop-blur-md transition-all hover:scale-[1.03] duration-300 z-30 flex items-center gap-3 max-w-[240px]">
                <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center flex-none">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
                <div className="space-y-0.5">
                  <div className="text-xs font-bold text-foreground leading-tight">
                    {t("portal.hero.card.approval")}
                  </div>
                  <div className="text-[10px] text-muted-foreground">
                    {isTh ? "สารบรรณดิจิทัล 3 ระดับ" : "Multi-Step Workflow"}
                  </div>
                </div>
              </div>

              {/* ── CARD 3: Academic Analytics & Performance (Floating Right) ── */}
              <div className="absolute -top-2 sm:top-2 right-0 p-3.5 rounded-xl border border-border bg-card/95 shadow-lg backdrop-blur-md transition-all hover:scale-[1.03] duration-300 z-30 max-w-[210px] space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[11px] font-bold text-foreground flex items-center gap-1.5">
                    <TrendingUp className="w-3.5 h-3.5 text-brand" />
                    {t("portal.hero.card.analytics")}
                  </span>
                  <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-brand/10 text-brand">
                    +24.8%
                  </span>
                </div>
                {/* Micro Bar Chart */}
                <div className="flex items-end gap-1.5 h-8 pt-1">
                  <div className="w-3 bg-brand/30 rounded-t h-[40%]" />
                  <div className="w-3 bg-brand/45 rounded-t h-[60%]" />
                  <div className="w-3 bg-brand/60 rounded-t h-[50%]" />
                  <div className="w-3 bg-brand/80 rounded-t h-[80%]" />
                  <div className="w-3 bg-brand rounded-t h-[100%]" />
                </div>
              </div>

              {/* ── CARD 4: Facility & Booking Pill (Floating Bottom-Right) ── */}
              <div className="absolute bottom-6 right-2 sm:right-6 px-3 py-2 rounded-xl border border-border bg-card/90 shadow-md backdrop-blur-md transition-all hover:scale-[1.03] duration-300 z-10 flex items-center gap-2 text-xs">
                <Calendar className="w-3.5 h-3.5 text-brand flex-none" />
                <span className="text-muted-foreground text-[11px]">
                  {t("portal.hero.card.booking")}
                </span>
                <span className="w-2 h-2 rounded-full bg-emerald-500 flex-none" />
              </div>

              {/* Decorative Micro Badges */}
              <div className="absolute top-[48%] -left-3 px-2.5 py-1 rounded-full border border-border/80 bg-background/80 backdrop-blur-xs text-[10px] font-semibold text-muted-foreground shadow-xs flex items-center gap-1.5 z-30">
                <ShieldCheck className="w-3 h-3 text-brand" />
                <span>{t("portal.hero.card.statusSecured")}</span>
              </div>
            </div>
          </div>
        </div>

        {/* ── BOTTOM RIBBON: Infinite Partner Marquee (Monotree Style) ── */}
        <div className="mt-14 pt-8 border-t border-border/50">
          <p className="text-center text-xs font-bold tracking-widest uppercase text-muted-foreground/80 mb-5">
            {t("portal.hero.partnersTitle")}
          </p>

          <div className="relative overflow-hidden before:absolute before:inset-y-0 before:left-0 before:w-20 before:bg-gradient-to-r before:from-background before:to-transparent before:z-10 after:absolute after:inset-y-0 after:right-0 after:w-20 after:bg-gradient-to-l after:from-background after:to-transparent after:z-10">
            <div className="animate-marquee flex items-center gap-6">
              {/* Partner Badges (Repeated twice for seamless loop) */}
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
