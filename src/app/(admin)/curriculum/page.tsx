import { requirePermission, hasPermission } from "@/features/identity/server";
import { CURRICULUM_P, listCurricula } from "@/features/curriculum/server";
import { CurriculumClient } from "./_components/curriculum-client";

export default async function CurriculumAdminPage() {
  const ctx = await requirePermission(CURRICULUM_P.curriculumRead);
  const initialItems = await listCurricula(ctx.tenantId);
  return (
    <CurriculumClient
      initialItems={initialItems}
      canManage={hasPermission(ctx, CURRICULUM_P.curriculumManage)}
    />
  );
}
