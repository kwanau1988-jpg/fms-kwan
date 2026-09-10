import Link from "next/link";
import { auth } from "@/features/identity/server";
import { LanguageSwitcher } from "@/components/layout/language-switcher";
import { getLocale } from "@/shared/lib/i18n/server";
import { GraduationCap, LogIn, LayoutDashboard, Newspaper, Users, BookOpen, Calendar, Building2 } from "lucide-react";

export default async function PortalLayout({ children }: { children: React.ReactNode }) {
  const [session, locale] = await Promise.all([auth().catch(() => null), getLocale()]);
  const isTh = locale === "th";

  const navLinks = [
    { href: "/portal", label: isTh ? "หน้าแรก" : "Home", icon: Building2 },
    { href: "/portal/news", label: isTh ? "ข่าวสาร" : "News", icon: Newspaper },
    { href: "/portal/personnel", label: isTh ? "บุคลากร" : "Personnel", icon: Users },
    { href: "/portal/curriculum", label: isTh ? "หลักสูตร" : "Curricula", icon: BookOpen },
    { href: "/portal/facilities", label: isTh ? "จองห้อง/ยานพาหนะ" : "Facilities", icon: Calendar },
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
                  {isTh ? "คณะวิทยาการจัดการ" : "Faculty of Management Science"}
                </span>
                <span className="text-xs text-muted-foreground">
                  {isTh ? "Faculty Web Platform" : "Academic & Research Portal"}
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
                <span>{isTh ? "ระบบจัดการ" : "Dashboard"}</span>
              </Link>
            ) : (
              <Link
                href="/login"
                className="inline-flex items-center gap-1.5 px-3.5 py-2 text-sm font-medium rounded-lg bg-brand text-on-brand shadow-xs hover:bg-brand/90 transition-colors"
              >
                <LogIn className="w-4 h-4" />
                <span>{isTh ? "เข้าสู่ระบบ" : "Sign In"}</span>
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
                {isTh ? "คณะวิทยาการจัดการ" : "Faculty of Management Science"}
              </span>
            </div>
            <p className="text-sm max-w-md leading-relaxed">
              {isTh
                ? "มุ่งมั่นผลิตบัณฑิตที่มีคุณภาพและคุณธรรม พัฒนางานวิจัยและนวัตกรรมสู่สังคมและองค์กรระดับสากล"
                : "Committed to educating ethical and visionary leaders, advancing research and impactful innovations."}
            </p>
          </div>

          <div>
            <h4 className="font-semibold text-foreground text-sm mb-3">
              {isTh ? "การนำทาง" : "Quick Links"}
            </h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="/portal/news" className="hover:text-foreground transition-colors">{isTh ? "ข่าวประชาสัมพันธ์" : "Announcements"}</Link></li>
              <li><Link href="/portal/personnel" className="hover:text-foreground transition-colors">{isTh ? "ทำเนียบคณาจารย์และบุคลากร" : "Staff Directory"}</Link></li>
              <li><Link href="/portal/curriculum" className="hover:text-foreground transition-colors">{isTh ? "หลักสูตรระดับปริญญา" : "Academic Programs"}</Link></li>
              <li><Link href="/portal/facilities" className="hover:text-foreground transition-colors">{isTh ? "ปฏิทินการใช้ห้องและรถ" : "Reservations Calendar"}</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-foreground text-sm mb-3">
              {isTh ? "ระบบบริการภายใน" : "Staff & Student Portal"}
            </h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="/login" className="hover:text-foreground transition-colors">{isTh ? "เข้าสู่ระบบบุคลากร (SSO)" : "Staff Login"}</Link></li>
              <li><Link href="/dashboard" className="hover:text-foreground transition-colors">{isTh ? "ระบบบริหารงานคณะ (Admin)" : "Admin Console"}</Link></li>
            </ul>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8 pt-8 border-t border-border/30 text-xs text-center">
          © {new Date().getFullYear()} Faculty of Management Science. All rights reserved. Powered by VibeCore Framework.
        </div>
      </footer>
    </div>
  );
}
