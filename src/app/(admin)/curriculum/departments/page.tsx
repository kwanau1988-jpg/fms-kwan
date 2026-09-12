import { requirePermission, hasPermission } from "@/features/identity/server";
import { CURRICULUM_P, listCurricula, listDepartments } from "@/features/curriculum/server";
import { CurriculumClient } from "../_components/curriculum-client";

export default async function CurriculumDepartmentsAdminPage() {
  const ctx = await requirePermission(CURRICULUM_P.curriculumRead);
  const initialItems = await listCurricula(ctx.tenantId);
  const initialDepartments = await listDepartments(ctx.tenantId, true);
  return (
    <CurriculumClient
      initialItems={initialItems}
      initialDepartments={initialDepartments}
      canManage={hasPermission(ctx, CURRICULUM_P.curriculumManage)}
      canManageDepartments={hasPermission(ctx, CURRICULUM_P.departmentManage)}
      initialTab="departments"
    />
  );
}
