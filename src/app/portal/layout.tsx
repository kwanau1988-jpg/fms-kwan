import Link from "next/link";
import { GraduationCap } from "lucide-react";
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

      {/* Footer */}
      <footer className="border-t border-border/40 bg-muted/40 text-muted-foreground py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-3 md:col-span-2">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-brand/10 text-brand flex items-center justify-center font-bold overflow-hidden">
                {tenant?.logoUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={tenant.logoUrl} alt="Logo" className="w-full h-full object-contain p-0.5" />
                ) : (
                  <GraduationCap className="w-5 h-5 text-brand" />
                )}
              </div>
              <span className="font-bold text-foreground">
                {t("portal.facultyName")}
              </span>
            </div>
            <p className="text-sm max-w-md leading-relaxed">
              {t("portal.footer.about")}
            </p>
          </div>

          <div>
            <h4 className="font-semibold text-foreground text-sm mb-3">
              {t("portal.footer.quickLinks")}
            </h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="/portal/news" className="hover:text-foreground transition-colors">{t("portal.nav.news")}</Link></li>
              <li><Link href="/portal/personnel" className="hover:text-foreground transition-colors">{t("portal.nav.personnel")}</Link></li>
              <li><Link href="/portal/curriculum" className="hover:text-foreground transition-colors">{t("portal.nav.curriculum")}</Link></li>
              <li><Link href="/portal/facilities" className="hover:text-foreground transition-colors">{t("portal.nav.facilities")}</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-foreground text-sm mb-3">
              {t("portal.footer.contact")}
            </h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="/login" className="hover:text-foreground transition-colors">{t("portal.nav.signIn")}</Link></li>
              <li><Link href="/dashboard" className="hover:text-foreground transition-colors">{t("portal.nav.dashboard")}</Link></li>
            </ul>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8 pt-8 border-t border-border/30 text-xs text-center">
          © {new Date().getFullYear()} {t("portal.facultyName")}. {t("portal.footer.rights")}
        </div>
      </footer>
    </div>
  );
}
