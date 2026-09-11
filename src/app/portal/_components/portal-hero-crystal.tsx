"use client";

import { useState, useRef, useCallback } from "react";
import { Award, TrendingUp, Sparkles, Zap, GraduationCap } from "lucide-react";
import { useT, useLocale } from "@/shared/lib/i18n/client";

export type CrystalMode = "academic" | "smart" | "admissions";

interface PortalHeroCrystalProps {
  onModeChange?: (mode: CrystalMode) => void;
  activeMode?: CrystalMode;
}

export function PortalHeroCrystal({ onModeChange, activeMode = "academic" }: PortalHeroCrystalProps) {
  const t = useT();
  const locale = useLocale();
  const isTh = locale === "th";

  const containerRef = useRef<HTMLDivElement>(null);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);
  const [internalMode, setInternalMode] = useState<CrystalMode>(activeMode);

  // Controlled or uncontrolled mode
  const mode = activeMode ?? internalMode;

  const handleSelectMode = (newMode: CrystalMode) => {
    setInternalMode(newMode);
    if (onModeChange) {
      onModeChange(newMode);
    }
  };

  // Smooth mouse parallax handler
  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;

    // Constrain tilt angle for realistic monolithic weight
    const tiltX = -(y / (rect.height / 2)) * 8;
    const tiltY = (x / (rect.width / 2)) * 10;
    setTilt({ x: tiltX, y: tiltY });
  }, []);

  const handleMouseLeave = useCallback(() => {
    setTilt({ x: 0, y: 0 });
    setIsHovered(false);
  }, []);

  const handleMouseEnter = useCallback(() => {
    setIsHovered(true);
  }, []);

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className="relative w-full max-w-[500px] h-[460px] sm:h-[540px] flex items-center justify-center select-none perspective-1500 cursor-pointer group"
      aria-label="3D Interactive Crystal Monolith"
    >
      {/* ── Atmospheric Nebula Aura behind Crystal ── */}
      <div
        className={`absolute w-[360px] sm:w-[440px] h-[360px] sm:h-[440px] rounded-full blur-[100px] pointer-events-none -z-10 transition-all duration-700 ${
          mode === "academic"
            ? "bg-purple-600/25 dark:bg-purple-600/35"
            : mode === "smart"
              ? "bg-cyan-500/25 dark:bg-cyan-500/35"
              : "bg-amber-500/25 dark:bg-amber-500/35"
        } animate-crystal-glow-pulse`}
        aria-hidden="true"
      />
      <div
        className={`absolute bottom-8 w-[280px] h-[180px] rounded-full blur-[80px] pointer-events-none -z-10 transition-all duration-700 ${
          mode === "academic"
            ? "bg-amber-500/35 dark:bg-amber-500/45"
            : mode === "smart"
              ? "bg-emerald-500/35 dark:bg-emerald-500/45"
              : "bg-rose-500/35 dark:bg-rose-500/45"
        } animate-magma-pulse`}
        aria-hidden="true"
      />

      {/* ── 3D Crystal Monolith Perspective Container ── */}
      <div
        className="relative w-[300px] sm:w-[350px] h-[400px] sm:h-[460px] preserve-3d transition-transform duration-500 ease-out"
        style={{
          transform: `rotateX(${tilt.x}deg) rotateY(${tilt.y}deg)`,
        }}
      >
        {/* Floating Animation Layer */}
        <div className="relative w-full h-full preserve-3d animate-crystal-float">
          
          {/* ══════════════════════════════════════════════════════
              STARDUST & COSMIC SPARK PARTICLES
              ══════════════════════════════════════════════════════ */}
          <div className="absolute inset-0 pointer-events-none z-30" aria-hidden="true">
            {/* Particle 1 */}
            <div
              className="absolute top-1/4 left-6 w-1.5 h-1.5 rounded-full bg-cyan-300 shadow-[0_0_8px_#38bdf8] animate-pulse"
              style={{ animationDuration: "2.5s" }}
            />
            {/* Particle 2 */}
            <div
              className="absolute top-1/3 right-8 w-2 h-2 rounded-full bg-purple-300 shadow-[0_0_10px_#c084fc] animate-pulse"
              style={{ animationDuration: "3.2s", animationDelay: "0.5s" }}
            />
            {/* Particle 3 */}
            <div
              className="absolute top-1/2 left-2 w-1 h-1 rounded-full bg-amber-300 shadow-[0_0_6px_#fde047] animate-ping"
              style={{ animationDuration: "4s" }}
            />
            {/* Particle 4 */}
            <div
              className="absolute bottom-1/3 right-4 w-1.5 h-1.5 rounded-full bg-amber-400 shadow-[0_0_8px_#f59e0b] animate-pulse"
              style={{ animationDuration: "2.8s", animationDelay: "1s" }}
            />
            {/* Particle 5 (Golden Ember near base) */}
            <div
              className="absolute bottom-16 left-12 w-2 h-2 rounded-full bg-yellow-300 shadow-[0_0_12px_#fbbf24] animate-bounce"
              style={{ animationDuration: "3.5s" }}
            />
            {/* Particle 6 */}
            <div
              className="absolute top-12 right-1/3 w-1 h-1 rounded-full bg-white shadow-[0_0_6px_#ffffff] animate-ping"
              style={{ animationDuration: "5s" }}
            />
          </div>

          {/* ══════════════════════════════════════════════════════
              THE FACETED CRYSTAL MONOLITH (SVG GEOMETRY + GRADIENTS)
              ══════════════════════════════════════════════════════ */}
          <div className="relative w-full h-full flex items-center justify-center filter drop-shadow-[0_20px_40px_rgba(0,0,0,0.6)]">
            <svg
              viewBox="0 0 340 450"
              className="w-full h-full overflow-visible"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <defs>
                {/* Internal Cosmic Nebula Gradient */}
                <radialGradient id="nebulaCore" cx="50%" cy="45%" r="45%">
                  <stop offset="0%" stopColor="#ffffff" stopOpacity="0.95" />
                  <stop offset="25%" stopColor="#c084fc" stopOpacity="0.85" />
                  <stop offset="55%" stopColor="#6366f1" stopOpacity="0.7" />
                  <stop offset="85%" stopColor="#1e1b4b" stopOpacity="0.4" />
                  <stop offset="100%" stopColor="#09090b" stopOpacity="0.0" />
                </radialGradient>

                {/* Smart Campus Cyan Nebula */}
                <radialGradient id="nebulaCyan" cx="50%" cy="45%" r="45%">
                  <stop offset="0%" stopColor="#ffffff" stopOpacity="0.95" />
                  <stop offset="25%" stopColor="#67e8f9" stopOpacity="0.85" />
                  <stop offset="55%" stopColor="#0ea5e9" stopOpacity="0.7" />
                  <stop offset="85%" stopColor="#083344" stopOpacity="0.4" />
                  <stop offset="100%" stopColor="#09090b" stopOpacity="0.0" />
                </radialGradient>

                {/* Admissions Amber Nebula */}
                <radialGradient id="nebulaAmber" cx="50%" cy="45%" r="45%">
                  <stop offset="0%" stopColor="#ffffff" stopOpacity="0.95" />
                  <stop offset="25%" stopColor="#fde047" stopOpacity="0.85" />
                  <stop offset="55%" stopColor="#f59e0b" stopOpacity="0.7" />
                  <stop offset="85%" stopColor="#78350f" stopOpacity="0.4" />
                  <stop offset="100%" stopColor="#09090b" stopOpacity="0.0" />
                </radialGradient>

                {/* Bottom Magma Flame Radiant Facet */}
                <linearGradient id="magmaGlow" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#fffbeb" />
                  <stop offset="20%" stopColor="#fde047" />
                  <stop offset="50%" stopColor="#f59e0b" />
                  <stop offset="85%" stopColor="#ea580c" />
                  <stop offset="100%" stopColor="#9a3412" />
                </linearGradient>

                {/* Dark Obsidian Glass Facets */}
                <linearGradient id="obsidianTop" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#3f3f46" stopOpacity="0.8" />
                  <stop offset="50%" stopColor="#18181b" stopOpacity="0.9" />
                  <stop offset="100%" stopColor="#09090b" stopOpacity="0.95" />
                </linearGradient>

                <linearGradient id="obsidianLeft" x1="0%" y1="50%" x2="100%" y2="50%">
                  <stop offset="0%" stopColor="#52525b" stopOpacity="0.6" />
                  <stop offset="40%" stopColor="#27272a" stopOpacity="0.85" />
                  <stop offset="100%" stopColor="#09090b" stopOpacity="0.95" />
                </linearGradient>

                <linearGradient id="obsidianCenter" x1="30%" y1="0%" x2="70%" y2="100%">
                  <stop offset="0%" stopColor="#27272a" stopOpacity="0.4" />
                  <stop offset="50%" stopColor="#18181b" stopOpacity="0.25" />
                  <stop offset="100%" stopColor="#09090b" stopOpacity="0.8" />
                </linearGradient>

                <linearGradient id="obsidianRight" x1="100%" y1="50%" x2="0%" y2="50%">
                  <stop offset="0%" stopColor="#3f3f46" stopOpacity="0.75" />
                  <stop offset="60%" stopColor="#18181b" stopOpacity="0.9" />
                  <stop offset="100%" stopColor="#09090b" stopOpacity="0.98" />
                </linearGradient>

                {/* Specular Rim Light Highlights */}
                <linearGradient id="rimLightViolet" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#c084fc" stopOpacity="0.9" />
                  <stop offset="50%" stopColor="#818cf8" stopOpacity="0.6" />
                  <stop offset="100%" stopColor="#38bdf8" stopOpacity="0.1" />
                </linearGradient>

                <linearGradient id="rimLightGold" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.95" />
                  <stop offset="50%" stopColor="#fbbf24" stopOpacity="0.7" />
                  <stop offset="100%" stopColor="#fef08a" stopOpacity="0.95" />
                </linearGradient>

                {/* Prismatic Sheen Sweep */}
                <linearGradient id="sheenGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#ffffff" stopOpacity="0" />
                  <stop offset="45%" stopColor="#ffffff" stopOpacity="0.05" />
                  <stop offset="50%" stopColor="#ffffff" stopOpacity="0.35" />
                  <stop offset="55%" stopColor="#ffffff" stopOpacity="0.05" />
                  <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
                </linearGradient>

                {/* Glow Filter */}
                <filter id="bloom" x="-50%" y="-50%" width="200%" height="200%">
                  <feGaussianBlur stdDeviation="6" result="blur" />
                  <feMerge>
                    <feMergeNode in="blur" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>
                <filter id="hyperBloom" x="-50%" y="-50%" width="200%" height="200%">
                  <feGaussianBlur stdDeviation="14" result="blur" />
                  <feMerge>
                    <feMergeNode in="blur" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>
              </defs>

              {/* ── BACKGROUND FACETS / BACK VOLUME ── */}
              <polygon
                points="170,30 265,110 270,310 170,410 70,310 75,110"
                fill="#050508"
                opacity="0.95"
              />

              {/* ── INTERNAL COSMIC NEBULA CAUSTICS (The pulsating core) ── */}
              <g className="animate-crystal-nebula" style={{ transformOrigin: "170px 220px" }}>
                <ellipse
                  cx="170"
                  cy="215"
                  rx="68"
                  ry="95"
                  fill={
                    mode === "academic"
                      ? "url(#nebulaCore)"
                      : mode === "smart"
                        ? "url(#nebulaCyan)"
                        : "url(#nebulaAmber)"
                  }
                  filter="url(#hyperBloom)"
                  opacity={isHovered ? 1 : 0.88}
                />
                {/* Core Sparkle Points */}
                <circle cx="165" cy="205" r="3" fill="#ffffff" filter="url(#bloom)" />
                <circle cx="180" cy="225" r="2" fill="#c084fc" filter="url(#bloom)" />
                <circle cx="155" cy="235" r="1.5" fill="#38bdf8" />
                <circle cx="190" cy="195" r="2" fill="#fde047" />
              </g>

              {/* ── 3D FACETED GEOMETRY (PRECISE CUT GEMSTONE POLYHEDRON) ── */}

              {/* 1. TOP CAP FACET (Crown Apex) */}
              <polygon
                points="170,35 125,95 215,95"
                fill="url(#obsidianTop)"
                stroke="rgba(255,255,255,0.2)"
                strokeWidth="1"
              />

              {/* 2. TOP-LEFT BEVEL FACET */}
              <polygon
                points="170,35 125,95 75,110"
                fill="url(#obsidianLeft)"
                stroke="rgba(255,255,255,0.15)"
                strokeWidth="1"
              />

              {/* 3. TOP-RIGHT BEVEL FACET (Catches rim violet glow) */}
              <polygon
                points="170,35 215,95 265,110"
                fill="url(#obsidianRight)"
                stroke="url(#rimLightViolet)"
                strokeWidth="1.5"
              />

              {/* 4. MAIN CENTRAL WINDOW FACET (Semi-translucent obsidian allowing caustics to shine through) */}
              <polygon
                points="125,95 215,95 230,290 110,290"
                fill="url(#obsidianCenter)"
                stroke="rgba(255,255,255,0.18)"
                strokeWidth="1.2"
              />

              {/* 5. LEFT MAIN BODY FACET */}
              <polygon
                points="75,110 125,95 110,290 68,310"
                fill="url(#obsidianLeft)"
                stroke="rgba(255,255,255,0.1)"
                strokeWidth="1"
              />

              {/* 6. RIGHT MAIN BODY FACET (With shimmering rim glow) */}
              <polygon
                points="265,110 215,95 230,290 272,310"
                fill="url(#obsidianRight)"
                stroke="url(#rimLightViolet)"
                strokeWidth="1.5"
              />

              {/* ── STARDUST SPARKLES CLUSTER OVER THE FACET (GenAuxi Signature Detail) ── */}
              <g opacity="0.9">
                <path
                  d="M170 190 L172 198 L180 200 L172 202 L170 210 L168 202 L160 200 L168 198 Z"
                  fill="#ffffff"
                  filter="url(#bloom)"
                />
                <circle cx="162" cy="180" r="1.5" fill="#fde047" />
                <circle cx="182" cy="185" r="1.2" fill="#c084fc" />
                <circle cx="178" cy="215" r="1.8" fill="#ffffff" filter="url(#bloom)" />
                <circle cx="152" cy="210" r="1.5" fill="#38bdf8" />
                <circle cx="188" cy="230" r="1" fill="#fde047" />
              </g>

              {/* 7. LOWER TRANSITION FACETS */}
              <polygon
                points="68,310 110,290 135,360 90,375"
                fill="#18181b"
                stroke="rgba(255,255,255,0.12)"
                strokeWidth="1"
              />
              <polygon
                points="272,310 230,290 205,360 250,375"
                fill="#18181b"
                stroke="rgba(255,255,255,0.12)"
                strokeWidth="1"
              />
              <polygon
                points="110,290 230,290 205,360 135,360"
                fill="#1c1917"
                stroke="rgba(255,255,255,0.15)"
                strokeWidth="1"
              />

              {/* ══════════════════════════════════════════════════════
                  8. RADIANT BOTTOM MAGMA / SOLAR GOLD FACET (GenAuxi Key Signature)
                  ══════════════════════════════════════════════════════ */}
              <g className="animate-magma-pulse">
                {/* Magma Base Polygon */}
                <polygon
                  points="135,360 205,360 185,415 115,415"
                  fill="url(#magmaGlow)"
                  filter="url(#bloom)"
                  stroke="url(#rimLightGold)"
                  strokeWidth="2"
                />

                {/* Internal Fire Crackles / Hot Spots on the bottom plate */}
                <ellipse cx="160" cy="385" rx="22" ry="12" fill="#ffffff" opacity="0.65" filter="url(#bloom)" />
                <polygon points="140,370 155,365 150,380" fill="#fed7aa" opacity="0.8" />
                <polygon points="175,375 195,370 185,395" fill="#fef08a" opacity="0.9" />
                <circle cx="165" cy="390" r="3" fill="#ffffff" />
              </g>

              {/* 9. BOTTOM LOWER BEVEL SHADOW CAP */}
              <polygon
                points="90,375 115,415 185,415 160,435 85,385"
                fill="#451a03"
                opacity="0.85"
                stroke="#b45309"
                strokeWidth="1"
              />

              {/* ── SPECULAR SHEEN SWEEP (Diagonal Light Ray Across Facets) ── */}
              <g clipPath="url(#crystalClip)" className="pointer-events-none">
                <rect
                  x="-100"
                  y="-100"
                  width="500"
                  height="80"
                  fill="url(#sheenGradient)"
                  className="animate-prism-gleam"
                />
              </g>

              <clipPath id="crystalClip">
                <polygon points="170,35 265,110 272,310 250,375 185,415 115,415 90,375 68,310 75,110" />
              </clipPath>

              {/* ── EXTERIOR SHARP SPECULAR RIM LINES (Crisp Diamond Refractions) ── */}
              <polyline
                points="170,35 265,110 272,310"
                stroke="#ffffff"
                strokeWidth="1.2"
                strokeDasharray="140 10"
                opacity="0.85"
              />
              <line
                x1="215"
                y1="95"
                x2="230"
                y2="290"
                stroke="rgba(255,255,255,0.4)"
                strokeWidth="1"
              />
              <line
                x1="125"
                y1="95"
                x2="110"
                y2="290"
                stroke="rgba(255,255,255,0.25)"
                strokeWidth="1"
              />
            </svg>
          </div>

          {/* ══════════════════════════════════════════════════════
              FLOATING GLASSMORPHIC RECOGNITION BADGES
              ══════════════════════════════════════════════════════ */}

          {/* Top-Right Badge: AUN-QA Accreditation Tier-1 */}
          <div
            className="absolute -top-4 -right-4 sm:-right-8 px-3.5 py-2 rounded-2xl bg-card/90 dark:bg-card/95 border border-purple-500/30 shadow-xl backdrop-blur-md flex items-center gap-2.5 z-40 animate-float-badge hover:scale-105 transition-transform cursor-pointer"
            style={{ transform: "translateZ(80px)" }}
            onClick={() => handleSelectMode("academic")}
          >
            <div className="w-7 h-7 rounded-xl bg-purple-500/15 text-purple-500 flex items-center justify-center flex-none">
              <Award className="w-4 h-4" />
            </div>
            <div className="text-left">
              <div className="text-xs font-bold text-foreground leading-tight">
                {t("portal.hero.crystal.badge_quality")}
              </div>
              <div className="text-[10px] text-muted-foreground font-mono">
                AACSB & AUN-QA Global
              </div>
            </div>
          </div>

          {/* Bottom-Left Badge: Employment Rate */}
          <div
            className="absolute bottom-24 -left-4 sm:-left-8 px-3.5 py-2 rounded-2xl bg-card/90 dark:bg-card/95 border border-emerald-500/30 shadow-xl backdrop-blur-md flex items-center gap-2.5 z-40 animate-float-slow hover:scale-105 transition-transform cursor-pointer"
            style={{ transform: "translateZ(75px)" }}
            onClick={() => handleSelectMode("admissions")}
          >
            <div className="w-7 h-7 rounded-xl bg-emerald-500/15 text-emerald-500 flex items-center justify-center flex-none">
              <TrendingUp className="w-4 h-4" />
            </div>
            <div className="text-left">
              <div className="text-xs font-bold text-foreground leading-tight">
                {t("portal.hero.crystal.badge_employment")}
              </div>
              <div className="text-[10px] text-muted-foreground font-mono">
                {isTh ? "จบแล้วมีงานทำทันที" : "Top Placement Score"}
              </div>
            </div>
          </div>

          {/* Bottom-Right Badge: Digital ID Pass & QR Engine */}
          <div
            className="absolute bottom-6 -right-2 sm:-right-6 px-3.5 py-2 rounded-2xl bg-card/90 dark:bg-card/95 border border-cyan-500/30 shadow-xl backdrop-blur-md flex items-center gap-2.5 z-40 animate-float-badge hover:scale-105 transition-transform cursor-pointer"
            style={{ transform: "translateZ(70px)" }}
            onClick={() => handleSelectMode("smart")}
          >
            <div className="w-7 h-7 rounded-xl bg-cyan-500/15 text-cyan-500 flex items-center justify-center flex-none">
              <Zap className="w-4 h-4" />
            </div>
            <div className="text-left">
              <div className="text-xs font-bold text-foreground leading-tight">
                {t("portal.hero.crystal.badge_pass")}
              </div>
              <div className="text-[10px] text-muted-foreground font-mono">
                AES-256 Verified
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Interactive Mode Pills Under Crystal ── */}
      <div className="absolute -bottom-5 left-1/2 -translate-x-1/2 flex items-center gap-1.5 p-1 rounded-full bg-card/85 dark:bg-card/90 border border-border/80 shadow-lg backdrop-blur-md z-40">
        <button
          type="button"
          onClick={() => handleSelectMode("academic")}
          className={`px-3 py-1 rounded-full text-[11px] font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
            mode === "academic"
              ? "bg-purple-600 text-white shadow-xs"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <GraduationCap className="w-3 h-3" />
          <span>{t("portal.hero.crystal.mode_academic")}</span>
        </button>

        <button
          type="button"
          onClick={() => handleSelectMode("smart")}
          className={`px-3 py-1 rounded-full text-[11px] font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
            mode === "smart"
              ? "bg-cyan-600 text-white shadow-xs"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <Zap className="w-3 h-3" />
          <span>{t("portal.hero.crystal.mode_smart")}</span>
        </button>

        <button
          type="button"
          onClick={() => handleSelectMode("admissions")}
          className={`px-3 py-1 rounded-full text-[11px] font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
            mode === "admissions"
              ? "bg-amber-600 text-white shadow-xs"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <Sparkles className="w-3 h-3" />
          <span>{t("portal.hero.crystal.mode_admissions")}</span>
        </button>
      </div>
    </div>
  );
}
