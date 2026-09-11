"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTheme } from "next-themes";
import {
  Home,
  Newspaper,
  Users,
  BookOpen,
  Building2,
  QrCode,
  LayoutDashboard,
  LogIn,
  Menu,
  X,
} from "lucide-react";
import { LanguageSwitcher } from "@/components/layout/language-switcher";

export interface PortalNavbarProps {
  tenantLogoUrl?: string | null;
  facultyName: string;
  tagline: string;
  sessionUser?: {
    name?: string | null;
    email?: string | null;
    image?: string | null;
  } | null;
  roleLabel?: string | null;
  labels: {
    home: string;
    news: string;
    personnel: string;
    curriculum: string;
    facilities: string;
    scan: string;
    signIn: string;
    dashboard: string;
    themeToggle: string;
    openMenu: string;
    closeMenu: string;
  };
}

export function PortalNavbar({
  tenantLogoUrl,
  facultyName,
  tagline,
  sessionUser,
  roleLabel,
  labels,
}: PortalNavbarProps) {
  const pathname = usePathname();
  const { theme, setTheme } = useTheme();
  const [drawerOpen, setDrawerOpen] = React.useState(false);
  const [prevPathname, setPrevPathname] = React.useState(pathname);
  if (pathname !== prevPathname) {
    setPrevPathname(pathname);
    setDrawerOpen(false);
  }

  const navItems = [
    { href: "/portal", label: labels.home, icon: Home },
    { href: "/portal/news", label: labels.news, icon: Newspaper },
    { href: "/portal/personnel", label: labels.personnel, icon: Users },
    { href: "/portal/curriculum", label: labels.curriculum, icon: BookOpen },
    { href: "/portal/facilities", label: labels.facilities, icon: Building2 },
    { href: "/portal/attendance/scan", label: labels.scan, icon: QrCode },
  ];

  return (
    <header className="adm-head sticky top-0 z-50 !px-3 sm:!px-6 !h-14">
      {/* Brand Block - Matching Admin Shell Style */}
      <Link className="brand-blk !w-auto !max-w-[260px] sm:!max-w-sm mr-2 sm:mr-4" href="/portal">
        <i>
          {tenantLogoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={tenantLogoUrl}
              alt={facultyName}
              className="w-full h-full object-contain p-0.5 rounded-sm"
            />
          ) : (
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M22 10 12 5 2 10l10 5 10-5Z" />
              <path d="M6 12v5c0 1.7 2.7 3 6 3s6-1.3 6-3v-5" />
            </svg>
          )}
        </i>
        <div className="t">
          <b>{facultyName}</b>
          <span>{tagline}</span>
        </div>
      </Link>

      {/* Desktop Portal Menus */}
      <nav className="hidden xl:flex items-center gap-1 ml-1" aria-label="Portal Navigation">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive =
            item.href === "/portal"
              ? pathname === "/portal"
              : pathname.startsWith(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={isActive ? "page" : undefined}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 ${
                isActive
                  ? "bg-brand/12 text-brand font-bold shadow-2xs"
                  : "text-foreground/75 hover:text-foreground hover:bg-muted/70"
              }`}
            >
              <Icon className={`w-3.5 h-3.5 ${isActive ? "text-brand" : "text-muted-foreground"}`} />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Flexible Spacer */}
      <span className="sp" />

      {/* Right Toolbar - Identical to Admin Shell */}
      <div className="flex items-center gap-2">
        {/* Role Pill if logged in */}
        {roleLabel && (
          <span className="pill role hidden md:inline-flex">{roleLabel}</span>
        )}

        {/* Theme Toggle Button */}
        <button
          type="button"
          className="icon-btn"
          aria-label={labels.themeToggle}
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
        >
          <svg className="sun" viewBox="0 0 24 24" aria-hidden="true">
            <circle cx="12" cy="12" r="4.2" />
            <path d="M12 2v2.3M12 19.7V22M2 12h2.3M19.7 12H22M5.1 5.1l1.6 1.6M17.3 17.3l1.6 1.6M18.9 5.1l-1.6 1.6M6.7 17.3l-1.6 1.6" />
          </svg>
          <svg className="moon" viewBox="0 0 24 24" aria-hidden="true">
            <path d="M20.2 14.7A8.3 8.3 0 0 1 9.3 3.8a8.5 8.5 0 1 0 10.9 10.9Z" />
          </svg>
        </button>

        {/* Language Switcher */}
        <LanguageSwitcher className="lang" />

        {/* Auth Button */}
        {sessionUser ? (
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-brand text-on-brand shadow-xs hover:bg-brand/90 transition-transform active:scale-95"
          >
            <LayoutDashboard className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">{labels.dashboard}</span>
          </Link>
        ) : (
          <Link
            href="/login"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-brand text-on-brand shadow-xs hover:bg-brand/90 transition-transform active:scale-95"
          >
            <LogIn className="w-3.5 h-3.5" />
            <span>{labels.signIn}</span>
          </Link>
        )}

        {/* Mobile Drawer Button */}
        <button
          type="button"
          className="icon-btn xl:!hidden ml-1"
          aria-label={drawerOpen ? labels.closeMenu : labels.openMenu}
          onClick={() => setDrawerOpen((v) => !v)}
        >
          {drawerOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
        </button>
      </div>

      {/* Mobile Drawer Dropdown */}
      {drawerOpen && (
        <div className="xl:hidden absolute top-full left-0 right-0 border-b border-border/60 bg-background/95 backdrop-blur-xl p-4 shadow-xl space-y-1 animate-in fade-in slide-in-from-top-2 duration-150">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive =
              item.href === "/portal"
                ? pathname === "/portal"
                : pathname.startsWith(item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                  isActive
                    ? "bg-brand/12 text-brand"
                    : "text-foreground/80 hover:bg-muted"
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? "text-brand" : "text-muted-foreground"}`} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </div>
      )}
    </header>
  );
}
