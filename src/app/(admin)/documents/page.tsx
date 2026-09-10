import { requirePermission, hasPermission } from "@/features/identity/server";
import { EDOCUMENT_P, listDocumentRequests } from "@/features/e-document/server";
import { DocumentClient } from "./_components/document-client";

export default async function DocumentsAdminPage() {
  const ctx = await requirePermission(EDOCUMENT_P.documentRead);
  const initialItems = await listDocumentRequests(ctx.tenantId);

  return (
    <DocumentClient
      initialItems={initialItems}
      currentUserId={ctx.userId}
      canCreate={hasPermission(ctx, EDOCUMENT_P.documentCreate)}
      canApprove={hasPermission(ctx, EDOCUMENT_P.documentApprove)}
      canManage={hasPermission(ctx, EDOCUMENT_P.documentManage)}
    />
  );
}
