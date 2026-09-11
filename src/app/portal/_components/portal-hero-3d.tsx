"use client";

import { useState, useRef, useCallback } from "react";
import { CheckCircle2, ShieldCheck } from "lucide-react";
import { useT, useLocale } from "@/shared/lib/i18n/client";

/** Realistic Gold EMV Microchip Component */
function EmvChip({ className = "w-11 h-9" }: { className?: string }) {
  return (
    <div
      className={`relative rounded-md overflow-hidden bg-gradient-to-br from-amber-200 via-amber-400 to-amber-600 p-[1px] shadow-sm select-none ${className}`}
    >
      <div className="w-full h-full rounded-[5px] bg-gradient-to-br from-amber-300 via-amber-400 to-amber-500 relative flex items-center justify-center overflow-hidden">
        {/* Etched circuit grooves */}
        <div className="absolute inset-0 border border-amber-700/30 rounded-[5px]" />
        <div className="absolute top-1/2 left-0 right-0 h-[1px] bg-amber-800/40" />
        <div className="absolute top-0 bottom-0 left-[34%] w-[1px] bg-amber-800/40" />
        <div className="absolute top-0 bottom-0 right-[34%] w-[1px] bg-amber-800/40" />
        <div className="w-3 h-3.5 border border-amber-800/40 rounded-xs bg-amber-300/80 z-10 flex items-center justify-center">
          <div className="w-1.5 h-2 border-r border-amber-800/40" />
        </div>
      </div>
    </div>
  );
}

/** Contactless NFC Wave Icon */
function NfcWave({ className = "w-5 h-5 text-white/70" }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      aria-hidden="true"
    >
      <path d="M8.5 16.5a5 5 0 0 1 0-9" />
      <path d="M12 19a8.5 8.5 0 0 1 0-14" />
      <path d="M15.5 21.5a12 12 0 0 1 0-19" />
    </svg>
  );
}

export function PortalHero3D() {
  const t = useT();
  const locale = useLocale();
  const isTh = locale === "th";

  const containerRef = useRef<HTMLDivElement>(null);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });

  // Smooth mouse parallax handler
  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;

    // Constrain tilt to max +/- 8 degrees for natural elegance
    const tiltX = -(y / (rect.height / 2)) * 7;
    const tiltY = (x / (rect.width / 2)) * 8;
    setTilt({ x: tiltX, y: tiltY });
  }, []);

  const handleMouseLeave = useCallback(() => {
    setTilt({ x: 0, y: 0 });
  }, []);

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="relative w-full max-w-[560px] h-[380px] sm:h-[420px] lg:h-[460px] flex items-center justify-center select-none perspective-1200 cursor-pointer group"
    >
      {/* ── Background Atmospheric Glow behind Cards ── */}
      <div
        className="absolute w-[360px] h-[360px] rounded-full bg-cyan-500/20 dark:bg-cyan-500/25 blur-3xl pointer-events-none -z-10 animate-glow-pulse"
        aria-hidden="true"
      />
      <div
        className="absolute w-[300px] h-[300px] rounded-full bg-purple-600/20 dark:bg-purple-600/30 blur-3xl pointer-events-none -z-10 translate-x-12 translate-y-8 animate-glow-pulse"
        aria-hidden="true"
      />

      {/* ── 3D Card Deck Perspective Wrapper with Mouse Tilt ── */}
      <div
        className="relative w-[320px] sm:w-[380px] h-[200px] sm:h-[235px] preserve-3d transition-transform duration-500 ease-out"
        style={{
          transform: `rotateX(${tilt.x}deg) rotateY(${tilt.y}deg)`,
        }}
      >
        {/* ══════════════════════════════════════════════════════
            CARD 4 (Back / Rose Gold Bronze Metallic)
            ══════════════════════════════════════════════════════ */}
        <div
          className="absolute inset-0 rounded-2xl p-5 shadow-2xl transition-all duration-500 preserve-3d animate-card-4 overflow-hidden border border-amber-700/40"
          style={{
            background: "linear-gradient(135deg, #e39a74 0%, #ba6d4c 45%, #7a3e27 100%)",
            boxShadow: "0 25px 40px -15px rgba(122, 62, 39, 0.45)",
          }}
        >
          {/* Subtle diagonal brushed metal texture */}
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,rgba(255,255,255,0.25),transparent_70%)] pointer-events-none" />

          {/* Top Bar: Faculty Brand & NFC */}
          <div className="flex items-center justify-between relative z-10">
            <span className="font-extrabold tracking-widest text-[11px] uppercase text-amber-100/90 font-mono">
              FMS OPERATIONS
            </span>
            <NfcWave className="w-4 h-4 text-amber-100/70" />
          </div>

          {/* Middle: Gold Chip */}
          <div className="mt-5 relative z-10 flex justify-end">
            <EmvChip className="w-10 h-8 opacity-80" />
          </div>

          {/* Bottom Info */}
          <div className="absolute bottom-4 left-5 right-5 z-10 flex items-end justify-between text-amber-100">
            <div>
              <div className="text-[11px] font-bold tracking-wide">
                {t("portal.hero.card4.title")}
              </div>
              <div className="text-[9px] text-amber-200/80 font-mono">
                {t("portal.hero.card4.holder")}
              </div>
            </div>
            <div className="text-[9px] font-mono text-amber-200/70">
              EXP 2029
            </div>
          </div>
        </div>

        {/* ══════════════════════════════════════════════════════
            CARD 3 (Third / Vibrant Neon Emerald Green Metallic)
            ══════════════════════════════════════════════════════ */}
        <div
          className="absolute inset-0 rounded-2xl p-5 shadow-2xl transition-all duration-500 preserve-3d animate-card-3 overflow-hidden border border-emerald-500/40"
          style={{
            background: "linear-gradient(135deg, #7edb34 0%, #52ab1c 45%, #235c0a 100%)",
            boxShadow: "0 25px 45px -15px rgba(35, 92, 10, 0.5)",
          }}
        >
          {/* Brushed Sheen Reflection */}
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,rgba(255,255,255,0.3),transparent_70%)] pointer-events-none" />

          {/* Top Bar */}
          <div className="flex items-center justify-between relative z-10">
            <span className="font-extrabold tracking-widest text-[11px] uppercase text-emerald-100 font-mono">
              SMART PAYROLL
            </span>
            <NfcWave className="w-4 h-4 text-emerald-100/80" />
          </div>

          {/* Middle: Gold Chip */}
          <div className="mt-5 relative z-10 flex justify-end">
            <EmvChip className="w-10 h-8 opacity-90" />
          </div>

          {/* Bottom Info */}
          <div className="absolute bottom-4 left-5 right-5 z-10 flex items-end justify-between text-emerald-50">
            <div>
              <div className="text-[11px] font-bold tracking-wide">
                {t("portal.hero.card3.title")}
              </div>
              <div className="text-[9px] text-emerald-200/80 font-mono">
                {t("portal.hero.card3.holder")}
              </div>
            </div>
            <div className="text-[9px] font-mono text-emerald-200/70">
              FAST-PAY
            </div>
          </div>
        </div>

        {/* ══════════════════════════════════════════════════════
            CARD 2 (Second / Brushed Titanium & Platinum Metallic)
            ══════════════════════════════════════════════════════ */}
        <div
          className="absolute inset-0 rounded-2xl p-5 shadow-2xl transition-all duration-500 preserve-3d animate-card-2 overflow-hidden border border-slate-500/40"
          style={{
            background: "linear-gradient(135deg, #7e8090 0%, #4b4c59 45%, #25262f 100%)",
            boxShadow: "0 25px 45px -15px rgba(0, 0, 0, 0.65)",
          }}
        >
          {/* Subtle Brushed Metal Lines Overlay */}
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,rgba(255,255,255,0.25),transparent_70%)] pointer-events-none" />

          {/* Top Bar */}
          <div className="flex items-center justify-between relative z-10">
            <span className="font-extrabold tracking-widest text-[11px] uppercase text-slate-200 font-mono">
              ACADEMIC RESEARCH
            </span>
            <NfcWave className="w-4 h-4 text-slate-300" />
          </div>

          {/* Middle: Gold Chip */}
          <div className="mt-5 relative z-10 flex justify-end">
            <EmvChip className="w-10 h-8 opacity-95" />
          </div>

          {/* Bottom Info */}
          <div className="absolute bottom-4 left-5 right-5 z-10 flex items-end justify-between text-slate-100">
            <div>
              <div className="text-[11px] font-bold tracking-wide">
                {t("portal.hero.card2.title")}
              </div>
              <div className="text-[9px] text-slate-300/80 font-mono">
                {t("portal.hero.card2.holder")}
              </div>
            </div>
            <div className="text-[9px] font-mono text-slate-400">
              AUN-QA CERT
            </div>
          </div>
        </div>

        {/* ══════════════════════════════════════════════════════
            CARD 1 (Front / Electric Cyan Metallic - Hero Centerpiece)
            ══════════════════════════════════════════════════════ */}
        <div
          className="absolute inset-0 rounded-2xl p-5 sm:p-6 shadow-2xl transition-all duration-500 preserve-3d animate-card-1 overflow-hidden border border-cyan-300/60 z-30 group-hover:scale-[1.02]"
          style={{
            background: "linear-gradient(135deg, #38d9f5 0%, #1c9ac3 45%, #0e5b7b 100%)",
            boxShadow: "0 30px 60px -15px rgba(42, 171, 217, 0.55), 0 0 25px rgba(42, 171, 217, 0.25)",
          }}
        >
          {/* Sweeping Metallic Sheen Animation */}
          <div
            className="absolute inset-0 w-1/2 h-full bg-gradient-to-r from-transparent via-white/35 to-transparent pointer-events-none animate-sheen z-20"
            aria-hidden="true"
          />

          {/* Top Bar: Brand, Badge & Contactless Wave */}
          <div className="flex items-center justify-between relative z-10">
            <div className="flex items-center gap-2">
              <span className="font-extrabold tracking-widest text-xs uppercase text-cyan-950 font-mono bg-cyan-200/90 px-2 py-0.5 rounded shadow-xs">
                FMS PASS
              </span>
              <span className="text-[10px] text-cyan-950/80 font-semibold hidden sm:inline">
                DIGITAL FACULTY ID
              </span>
            </div>
            <NfcWave className="w-5 h-5 text-cyan-950/80" />
          </div>

          {/* Middle: Signature Gold EMV Chip (Positioned on the Right like the Shot) */}
          <div className="mt-4 sm:mt-5 relative z-10 flex justify-end pr-2">
            <EmvChip className="w-12 h-9 shadow-md" />
          </div>

          {/* Bottom: Embossed Gold Foil Cardholder Name & Role (Matching Shot) */}
          <div className="absolute bottom-4 sm:bottom-5 left-5 sm:left-6 right-5 sm:right-6 z-10 flex items-end justify-between">
            <div>
              <div
                className="text-base sm:text-lg font-extrabold tracking-wide text-cyan-950 drop-shadow-[0_1px_1px_rgba(255,255,255,0.4)] leading-tight"
                style={{
                  fontFamily: "system-ui, -apple-system, sans-serif",
                }}
              >
                {t("portal.hero.card1.holder")}
              </div>
              <div className="text-[10px] sm:text-[11px] font-semibold tracking-wider text-cyan-950/75 uppercase mt-0.5 font-mono">
                {t("portal.hero.card1.sub")}
              </div>
            </div>
            <div className="text-right">
              <div className="text-[10px] font-mono font-bold text-cyan-950/70 tracking-widest">
                ID: 2026-8809
              </div>
              <div className="text-[8px] font-mono text-cyan-950/60 uppercase">
                VALID THRU 12/28
              </div>
            </div>
          </div>
        </div>

        {/* ══════════════════════════════════════════════════════
            FLOATING MICRO-WIDGETS & ORBITAL BADGES
            ══════════════════════════════════════════════════════ */}
        {/* Floating Approval Stamp Pill (Top-Left) */}
        <div
          className="absolute -top-6 -left-6 sm:-left-10 px-3.5 py-2 rounded-xl bg-card/90 dark:bg-card/95 border border-border/80 shadow-xl backdrop-blur-md flex items-center gap-2.5 z-40 animate-float-badge"
          style={{ transform: "translateZ(80px)" }}
        >
          <div className="w-6 h-6 rounded-lg bg-emerald-500/15 text-emerald-500 flex items-center justify-center flex-none">
            <CheckCircle2 className="w-3.5 h-3.5" />
          </div>
          <div className="text-left">
            <div className="text-xs font-bold text-foreground leading-none">
              {t("portal.hero.card.approval")}
            </div>
            <div className="text-[9px] text-muted-foreground mt-0.5">
              {isTh ? "อนุมัติเรียบร้อย 100%" : "Fast Verification"}
            </div>
          </div>
        </div>

        {/* Floating SSO Active Pill (Bottom-Center) */}
        <div
          className="absolute -bottom-7 sm:-bottom-8 left-1/4 px-3.5 py-1.5 rounded-full bg-card/90 dark:bg-card/95 border border-cyan-500/30 shadow-xl backdrop-blur-md flex items-center gap-2 z-40"
          style={{ transform: "translateZ(70px)" }}
        >
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500" />
          </span>
          <span className="text-[10px] font-bold text-foreground">
            {t("portal.hero.card.activeSSO")}
          </span>
        </div>

        {/* Floating Security Badge (Right) */}
        <div
          className="absolute top-1/2 -right-4 sm:-right-8 px-3 py-1.5 rounded-xl bg-card/90 dark:bg-card/95 border border-border/80 shadow-lg backdrop-blur-md flex items-center gap-2 z-40 hidden sm:flex"
          style={{ transform: "translateZ(60px)" }}
        >
          <ShieldCheck className="w-3.5 h-3.5 text-brand" />
          <span className="text-[10px] font-semibold text-muted-foreground">
            {t("portal.hero.card.statusSecured")}
          </span>
        </div>
      </div>
    </div>
  );
}
