import Link from "next/link";
import { auth } from "@/features/identity/server";
import { LanguageSwitcher } from "@/components/layout/language-switcher";
import { getT } from "@/i18n/server";
import { GraduationCap, LogIn, LayoutDashboard, Newspaper, Users, BookOpen, Calendar, Building2 } from "lucide-react";

export default async function PortalLayout({ children }: { children: React.ReactNode }) {
  const [session, t] = await Promise.all([auth().catch(() => null), getT()]);

  const navLinks = [
    { href: "/portal", label: t("portal.nav.home"), icon: Building2 },
    { href: "/portal/news", label: t("portal.nav.news"), icon: Newspaper },
    { href: "/portal/personnel", label: t("portal.nav.personnel"), icon: Users },
    { href: "/portal/curriculum", label: t("portal.nav.curriculum"), icon: BookOpen },
    { href: "/portal/facilities", label: t("portal.nav.facilities"), icon: Calendar },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      {/* Top Bar */}
      <header className="sticky top-0 z-40 w-full border-b border-border/50 bg-background/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/portal" className="flex items-center gap-2 group">
              <div className="w-10 h-10 rounded-xl bg-brand/10 text-brand flex items-center justify-center font-bold shadow-xs border border-brand/20 group-hover:scale-105 transition-transform">
                <GraduationCap className="w-6 h-6 text-brand" />
              </div>
              <div className="flex flex-col">
                <span className="font-bold text-base leading-tight tracking-tight text-foreground group-hover:text-brand transition-colors">
                  {t("portal.facultyName")}
                </span>
                <span className="text-xs text-muted-foreground">
                  {t("portal.tagline")}
                </span>
              </div>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => {
              const Icon = link.icon;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className="px-3.5 py-2 text-sm font-medium rounded-lg text-foreground/80 hover:text-foreground hover:bg-muted transition-colors flex items-center gap-1.5"
                >
                  <Icon className="w-4 h-4 text-muted-foreground" />
                  <span>{link.label}</span>
                </Link>
              );
            })}
          </nav>

          {/* Actions & Language */}
          <div className="flex items-center gap-2">
            <LanguageSwitcher className="border border-border/50 rounded-lg hover:bg-muted" />

            {session?.user ? (
              <Link
                href="/dashboard"
                className="inline-flex items-center gap-1.5 px-3.5 py-2 text-sm font-medium rounded-lg bg-brand text-on-brand shadow-xs hover:bg-brand/90 transition-colors"
              >
                <LayoutDashboard className="w-4 h-4" />
                <span>{t("portal.nav.dashboard")}</span>
              </Link>
            ) : (
              <Link
                href="/login"
                className="inline-flex items-center gap-1.5 px-3.5 py-2 text-sm font-medium rounded-lg bg-brand text-on-brand shadow-xs hover:bg-brand/90 transition-colors"
              >
                <LogIn className="w-4 h-4" />
                <span>{t("portal.nav.signIn")}</span>
              </Link>
            )}
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1">
        {children}
      </main>

      {/* Footer */}
      <footer className="border-t border-border/40 bg-muted/40 text-muted-foreground py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-3 md:col-span-2">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-brand/10 text-brand flex items-center justify-center font-bold">
                <GraduationCap className="w-5 h-5 text-brand" />
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
