import Link from "next/link";
import { GraduationCap, MapPin, Phone, Mail, ChevronRight, ShieldCheck } from "lucide-react";
import { auth } from "@/features/identity/server";
import { getT } from "@/i18n/server";
import { getLocale } from "@/shared/lib/i18n/server";
import { localizedName } from "@/shared/lib/format";
import { prisma } from "@/shared/lib/infra/prisma";
import { PortalNavbar } from "./_components/portal-navbar";

export default async function PortalLayout({ children }: { children: React.ReactNode }) {
  const [session, t, locale, tenant] = await Promise.all([
    auth().catch(() => null),
    getT(),
    getLocale(),
    prisma.tenant.findFirst({ orderBy: { createdAt: "asc" }, select: { logoUrl: true } }).catch(() => null),
  ]);

  const roleLabel = session?.roles?.[0] ? localizedName(session.roles[0], locale) : null;

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      {/* Top Bar - Liyon Admin Styled Portal Navbar */}
      <PortalNavbar
        tenantLogoUrl={tenant?.logoUrl}
        facultyName={t("portal.facultyName")}
        tagline={t("portal.tagline")}
        sessionUser={session?.user}
        roleLabel={roleLabel}
        labels={{
          home: t("portal.nav.home"),
          news: t("portal.nav.news"),
          personnel: t("portal.nav.personnel"),
          curriculum: t("portal.nav.curriculum"),
          facilities: t("portal.nav.facilities"),
          scan: t("portal.nav.scan"),
          signIn: t("portal.nav.signIn"),
          dashboard: t("portal.nav.dashboard"),
          themeToggle: t("nav.themeToggle"),
          openMenu: t("nav.openDrawer"),
          closeMenu: t("nav.collapse"),
        }}
      />


      {/* Main Content Area */}
      <main className="flex-1">
        {children}
      </main>

      {/* Footer - Styled with Liyon ink-band and theme-reactive palette */}
      <footer className="mt-20 relative bg-[var(--ink-band)] text-[var(--ink-band-text)] pt-16 pb-8 overflow-hidden">
        {/* Top Edge Gradient Line - Matching Liyon shell */}
        <div
          className="absolute top-0 left-0 right-0 h-[1px]"
          style={{ background: "var(--edge-grad-h)" }}
          aria-hidden="true"
        />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Main 4-Column Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10 pb-12 border-b border-white/10">
            {/* Column 1: Identity & Contact (span 4) */}
            <div className="lg:col-span-4 space-y-4">
              <Link href="/portal" className="inline-flex items-center gap-3 group">
                <div className="w-10 h-10 rounded-xl bg-brand flex items-center justify-center text-on-brand shadow-sm overflow-hidden flex-none">
                  {tenant?.logoUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={tenant.logoUrl} alt="Logo" className="w-full h-full object-contain p-0.5" />
                  ) : (
                    <GraduationCap className="w-6 h-6" />
                  )}
                </div>
                <div className="flex flex-col">
                  <span className="font-bold text-base leading-tight tracking-tight text-[var(--ink-band-text)]">
                    {t("portal.facultyName")}
                  </span>
                  <span className="text-xs text-[var(--ink-band-muted)]">
                    {t("portal.tagline")}
                  </span>
                </div>
              </Link>

              <p className="text-sm leading-relaxed text-[var(--ink-band-muted)] max-w-sm">
                {t("portal.footer.about")}
              </p>

              <div className="space-y-2.5 pt-2 text-xs text-[var(--ink-band-muted)]">
                <div className="flex items-start gap-2.5">
                  <MapPin className="w-4 h-4 text-brand flex-none mt-0.5" />
                  <span>{t("portal.footer.address")}</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <Phone className="w-4 h-4 text-brand flex-none" />
                  <span>{t("portal.footer.tel")}</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <Mail className="w-4 h-4 text-brand flex-none" />
                  <span>{t("portal.footer.email")}</span>
                </div>
              </div>
            </div>

            {/* Column 2: Quick Links & Information (span 2) */}
            <div className="lg:col-span-2 space-y-4">
              <h4 className="text-xs font-bold tracking-wider uppercase text-[var(--ink-band-muted)] pb-1 border-b border-white/10">
                {t("portal.footer.quickLinks")}
              </h4>
              <ul className="space-y-2.5 text-sm">
                <li>
                  <Link href="/portal/news" className="text-[var(--ink-band-muted)] hover:text-[var(--ink-band-text)] transition-colors inline-flex items-center gap-1.5 group">
                    <ChevronRight className="w-3.5 h-3.5 text-[var(--ink-band-muted)]/50 group-hover:text-brand group-hover:translate-x-0.5 transition-all" />
                    <span>{t("portal.nav.news")}</span>
                  </Link>
                </li>
                <li>
                  <Link href="/portal/personnel" className="text-[var(--ink-band-muted)] hover:text-[var(--ink-band-text)] transition-colors inline-flex items-center gap-1.5 group">
                    <ChevronRight className="w-3.5 h-3.5 text-[var(--ink-band-muted)]/50 group-hover:text-brand group-hover:translate-x-0.5 transition-all" />
                    <span>{t("portal.nav.personnel")}</span>
                  </Link>
                </li>
                <li>
                  <Link href="/portal/facilities" className="text-[var(--ink-band-muted)] hover:text-[var(--ink-band-text)] transition-colors inline-flex items-center gap-1.5 group">
                    <ChevronRight className="w-3.5 h-3.5 text-[var(--ink-band-muted)]/50 group-hover:text-brand group-hover:translate-x-0.5 transition-all" />
                    <span>{t("portal.nav.facilities")}</span>
                  </Link>
                </li>
                <li>
                  <Link href="/portal/attendance/scan" className="text-[var(--ink-band-muted)] hover:text-[var(--ink-band-text)] transition-colors inline-flex items-center gap-1.5 group">
                    <ChevronRight className="w-3.5 h-3.5 text-[var(--ink-band-muted)]/50 group-hover:text-brand group-hover:translate-x-0.5 transition-all" />
                    <span>{t("portal.nav.scan")}</span>
                  </Link>
                </li>
              </ul>
            </div>

            {/* Column 3: Academic Programs (span 3) */}
            <div className="lg:col-span-3 space-y-4">
              <h4 className="text-xs font-bold tracking-wider uppercase text-[var(--ink-band-muted)] pb-1 border-b border-white/10">
                {t("portal.footer.programs")}
              </h4>
              <ul className="space-y-2.5 text-sm">
                <li>
                  <Link href="/portal/curriculum?level=BACHELOR" className="text-[var(--ink-band-muted)] hover:text-[var(--ink-band-text)] transition-colors inline-flex items-center gap-1.5 group">
                    <ChevronRight className="w-3.5 h-3.5 text-[var(--ink-band-muted)]/50 group-hover:text-brand group-hover:translate-x-0.5 transition-all" />
                    <span>{t("portal.footer.programs.bachelor")}</span>
                  </Link>
                </li>
                <li>
                  <Link href="/portal/curriculum?level=MASTER" className="text-[var(--ink-band-muted)] hover:text-[var(--ink-band-text)] transition-colors inline-flex items-center gap-1.5 group">
                    <ChevronRight className="w-3.5 h-3.5 text-[var(--ink-band-muted)]/50 group-hover:text-brand group-hover:translate-x-0.5 transition-all" />
                    <span>{t("portal.footer.programs.master")}</span>
                  </Link>
                </li>
                <li>
                  <Link href="/portal/curriculum?level=DOCTORAL" className="text-[var(--ink-band-muted)] hover:text-[var(--ink-band-text)] transition-colors inline-flex items-center gap-1.5 group">
                    <ChevronRight className="w-3.5 h-3.5 text-[var(--ink-band-muted)]/50 group-hover:text-brand group-hover:translate-x-0.5 transition-all" />
                    <span>{t("portal.footer.programs.doctoral")}</span>
                  </Link>
                </li>
                <li>
                  <Link href="/portal/curriculum?level=SHORT_COURSE" className="text-[var(--ink-band-muted)] hover:text-[var(--ink-band-text)] transition-colors inline-flex items-center gap-1.5 group">
                    <ChevronRight className="w-3.5 h-3.5 text-[var(--ink-band-muted)]/50 group-hover:text-brand group-hover:translate-x-0.5 transition-all" />
                    <span>{t("portal.footer.programs.shortCourse")}</span>
                  </Link>
                </li>
              </ul>
            </div>

            {/* Column 4: Internal Services & Auth (span 3) */}
            <div className="lg:col-span-3 space-y-4">
              <h4 className="text-xs font-bold tracking-wider uppercase text-[var(--ink-band-muted)] pb-1 border-b border-white/10">
                {t("portal.footer.systems")}
              </h4>
              <ul className="space-y-2.5 text-sm">
                <li>
                  <Link href="/booking" className="text-[var(--ink-band-muted)] hover:text-[var(--ink-band-text)] transition-colors inline-flex items-center gap-1.5 group">
                    <ChevronRight className="w-3.5 h-3.5 text-[var(--ink-band-muted)]/50 group-hover:text-brand group-hover:translate-x-0.5 transition-all" />
                    <span>{t("portal.footer.systems.booking")}</span>
                  </Link>
                </li>
                <li>
                  <Link href="/documents" className="text-[var(--ink-band-muted)] hover:text-[var(--ink-band-text)] transition-colors inline-flex items-center gap-1.5 group">
                    <ChevronRight className="w-3.5 h-3.5 text-[var(--ink-band-muted)]/50 group-hover:text-brand group-hover:translate-x-0.5 transition-all" />
                    <span>{t("portal.footer.systems.documents")}</span>
                  </Link>
                </li>
                <li>
                  <Link href="/me/payroll" className="text-[var(--ink-band-muted)] hover:text-[var(--ink-band-text)] transition-colors inline-flex items-center gap-1.5 group">
                    <ChevronRight className="w-3.5 h-3.5 text-[var(--ink-band-muted)]/50 group-hover:text-brand group-hover:translate-x-0.5 transition-all" />
                    <span>{t("portal.footer.systems.payroll")}</span>
                  </Link>
                </li>
                <li>
                  <Link href="/dashboard" className="text-[var(--ink-band-muted)] hover:text-[var(--ink-band-text)] transition-colors inline-flex items-center gap-1.5 group">
                    <ChevronRight className="w-3.5 h-3.5 text-[var(--ink-band-muted)]/50 group-hover:text-brand group-hover:translate-x-0.5 transition-all" />
                    <span>{t("portal.footer.systems.dashboard")}</span>
                  </Link>
                </li>
                <li className="pt-1">
                  <Link href="/login" className="text-brand font-semibold hover:underline inline-flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-brand" />
                    <span>{t("portal.footer.systems.login")}</span>
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          {/* Bottom Bar: Copyright & Compliance */}
          <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[var(--ink-band-muted)]">
            <div className="flex items-center gap-2 text-center sm:text-left">
              <span>© {new Date().getFullYear()} {t("portal.facultyName")}. {t("portal.footer.rights")}</span>
            </div>

            <div className="flex items-center gap-4 flex-wrap justify-center">
              <span className="hover:text-[var(--ink-band-text)] transition-colors cursor-pointer">
                {t("portal.footer.privacy")}
              </span>
              <span>·</span>
              <span className="hover:text-[var(--ink-band-text)] transition-colors cursor-pointer">
                {t("portal.footer.terms")}
              </span>
              <span>·</span>
              <span className="text-[var(--ink-band-muted)]/75">
                {t("portal.footer.poweredBy")}
              </span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
