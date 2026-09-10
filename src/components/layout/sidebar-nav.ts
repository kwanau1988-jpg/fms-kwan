import {
  LayoutDashboard,
  Users,
  Settings,
  Newspaper,
  UserCheck,
  GraduationCap,
  Globe,
  FileCheck,
  CalendarDays,
  QrCode,
  Coins,
  Wallet,
  type LucideIcon,
} from "lucide-react";
import { hasPermission, P } from "@/features/identity";
import { NEWS_P } from "@/features/news";
import { PERSONNEL_P } from "@/features/personnel";
import { CURRICULUM_P } from "@/features/curriculum";
import { EDOCUMENT_P } from "@/features/e-document";
import { BOOKING_P } from "@/features/booking";
import { ATTENDANCE_P } from "@/features/attendance";
import { PAYROLL_P } from "@/features/payroll";

export interface NavItem {
  /** i18n key */
  title: string;
  href: string;
  icon?: LucideIcon;
  /** ต้องมีสิทธิ์นี้ถึงเห็น — ไม่มี = ทุกคนที่ login เห็น */
  permission?: string;
  children?: NavItem[];
}
export interface NavGroup { label: string; items: NavItem[] }
export interface NavCrumb { title: string; href: string }

export const sidebarGroups: NavGroup[] = [
  {
    label: "nav.group.overview",
    items: [
      { title: "nav.dashboard", href: "/dashboard", icon: LayoutDashboard },
      { title: "หน้าเว็บไซต์คณะ (Portal)", href: "/portal", icon: Globe },
    ],
  },
  {
    label: "ระบบบริหารคณะวิทยาการจัดการ",
    items: [
      { title: "news.nav", href: "/news", icon: Newspaper, permission: NEWS_P.newsRead },
      { title: "personnel.nav", href: "/personnel", icon: UserCheck, permission: PERSONNEL_P.personnelRead },
      { title: "curriculum.nav", href: "/curriculum", icon: GraduationCap, permission: CURRICULUM_P.curriculumRead },
      { title: "document.nav", href: "/documents", icon: FileCheck, permission: EDOCUMENT_P.documentRead },
      { title: "booking.nav", href: "/booking", icon: CalendarDays, permission: BOOKING_P.bookingRead },
      { title: "attendance.nav", href: "/attendance", icon: QrCode, permission: ATTENDANCE_P.attendanceTeach },
      { title: "payroll.myNav", href: "/me/payroll", icon: Coins, permission: PAYROLL_P.payrollViewOwn },
      { title: "payroll.nav", href: "/payroll", icon: Wallet, permission: PAYROLL_P.payrollManage },
    ],
  },
  {
    label: "nav.group.settings",
    items: [
      {
        title: "nav.users",
        href: "/users",
        icon: Users,
        permission: P.usersRead,
        children: [
          { title: "nav.users", href: "/users", permission: P.usersRead },
          { title: "nav.roles", href: "/users/roles", permission: P.rolesManage },
        ],
      },
      { title: "nav.settings", href: "/settings", icon: Settings, permission: P.settingsManage },
    ],
  },
];

type Ctx = Parameters<typeof hasPermission>[0];

function visibleItem(item: NavItem, ctx: Ctx): NavItem | null {
  if (item.permission && !hasPermission(ctx, item.permission)) return null;
  if (!item.children) return item;
  const children = item.children.filter((c) => !c.permission || hasPermission(ctx, c.permission));
  return children.length ? { ...item, children } : null;
}

export function visibleGroups(ctx: Ctx): NavGroup[] {
  return sidebarGroups
    .map((g) => ({ ...g, items: g.items.map((i) => visibleItem(i, ctx)).filter((i): i is NavItem => i !== null) }))
    .filter((g) => g.items.length > 0);
}

/** สายเมนูสำหรับ breadcrumb — จับ href ที่ยาวที่สุดที่ตรง (ลูกชนะแม่) */
export function getActiveNavChain(pathname: string): NavCrumb[] {
  let best: { parent: NavItem | null; item: NavItem } | null = null;
  const consider = (item: NavItem, parent: NavItem | null) => {
    if (pathname === item.href || pathname.startsWith(item.href + "/")) {
      if (!best || item.href.length > best.item.href.length || (item.href.length === best.item.href.length && parent)) best = { parent, item };
    }
  };
  for (const g of sidebarGroups) for (const i of g.items) { consider(i, null); for (const c of i.children ?? []) consider(c, i); }
  if (!best) return [];
  const { parent, item } = best as { parent: NavItem | null; item: NavItem };
  const chain: NavCrumb[] = [];
  if (parent && parent.href !== item.href) chain.push({ title: parent.title, href: parent.href });
  chain.push({ title: item.title, href: item.href });
  return chain;
}
