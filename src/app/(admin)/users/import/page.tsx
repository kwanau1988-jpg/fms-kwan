import { requirePermission, P } from "@/features/identity/server";
import { prisma } from "@/shared/lib/infra/prisma";
import { ImportPageClient } from "./import-page-client";

export default async function UsersImportPage() {
  const ctx = await requirePermission(P.usersManage);
  const roles = await prisma.role.findMany({
    where: { tenantId: ctx.tenantId },
    orderBy: { code: "asc" },
    select: { id: true, code: true, nameTh: true, nameEn: true },
  });

  return <ImportPageClient roles={roles} />;
}
