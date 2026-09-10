import { requirePermission, hasPermission } from "@/features/identity/server";
import { PERSONNEL_P, listPersonnelProfiles } from "@/features/personnel/server";
import { PersonnelClient } from "./_components/personnel-client";

export default async function PersonnelAdminPage() {
  const ctx = await requirePermission(PERSONNEL_P.personnelRead);
  const initialItems = await listPersonnelProfiles(ctx.tenantId);
  return (
    <PersonnelClient
      initialItems={initialItems}
      canManage={hasPermission(ctx, PERSONNEL_P.personnelManage)}
    />
  );
}
