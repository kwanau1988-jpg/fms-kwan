import type { PermissionDef } from "@/shared/lib/permission-def";

export const EDOCUMENT_P = {
  documentRead: "document:read",
  documentCreate: "document:create",
  documentApprove: "document:approve",
  documentManage: "document:manage",
} as const;

export const EDOCUMENT_PERMISSIONS: readonly PermissionDef[] = [
  { code: EDOCUMENT_P.documentRead, module: "document", action: "read" },
  { code: EDOCUMENT_P.documentCreate, module: "document", action: "create" },
  { code: EDOCUMENT_P.documentApprove, module: "document", action: "approve" },
  { code: EDOCUMENT_P.documentManage, module: "document", action: "manage" },
];
