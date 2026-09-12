import type { PermissionDef } from "@/shared/lib/permission-def";

export const CURRICULUM_P = {
  curriculumRead: "curriculum:read",
  curriculumManage: "curriculum:manage",
  departmentManage: "curriculum:department_manage",
} as const;

export const CURRICULUM_PERMISSIONS: readonly PermissionDef[] = [
  { code: CURRICULUM_P.curriculumRead, module: "curriculum", action: "read" },
  { code: CURRICULUM_P.curriculumManage, module: "curriculum", action: "manage" },
  { code: CURRICULUM_P.departmentManage, module: "curriculum", action: "department_manage" },
];
