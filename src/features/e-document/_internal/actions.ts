"use server";

import { revalidatePath } from "next/cache";
import { runAction, type ActionResult } from "@/shared/lib/result";
import { getLocale } from "@/shared/lib/i18n/server";
import { zodErrorMap } from "@/shared/lib/i18n/zod-locale";
import { requirePermission } from "@/features/identity/server";
import { prisma } from "@/shared/lib/infra/prisma";
import { EDOCUMENT_P } from "../permissions";
import { createDocumentSchema, decideDocumentSchema } from "./validations";
import {
  listDocumentRequests,
  createDocumentRequest,
  decideDocumentApproval,
  type DocumentRequestDto,
} from "./services";

export async function getDocumentRequestsAction(filters?: {
  requesterId?: string;
  status?: string;
}): Promise<ActionResult<DocumentRequestDto[]>> {
  return runAction(async () => {
    const ctx = await requirePermission(EDOCUMENT_P.documentRead);
    return listDocumentRequests(ctx.tenantId, filters);
  });
}

export async function createDocumentRequestAction(
  input: unknown,
): Promise<ActionResult<DocumentRequestDto>> {
  return runAction(async () => {
    const ctx = await requirePermission(EDOCUMENT_P.documentCreate);
    const parsed = createDocumentSchema.parse(input, { error: zodErrorMap(await getLocale()) });
    const result = await createDocumentRequest(ctx.tenantId, ctx.userId, parsed);
    revalidatePath("/documents");
    return result;
  });
}

export async function decideDocumentApprovalAction(
  input: unknown,
): Promise<ActionResult<DocumentRequestDto>> {
  return runAction(async () => {
    const ctx = await requirePermission(EDOCUMENT_P.documentApprove);
    const parsed = decideDocumentSchema.parse(input, { error: zodErrorMap(await getLocale()) });
    const isAdmin = ctx.permissions?.includes(EDOCUMENT_P.documentManage) ?? false;
    const result = await decideDocumentApproval(ctx.tenantId, ctx.userId, parsed, isAdmin);
    revalidatePath("/documents");
    return result;
  });
}

export async function getEligibleApproversAction(): Promise<
  ActionResult<Array<{ id: string; name: string; email: string }>>
> {
  return runAction(async () => {
    const ctx = await requirePermission(EDOCUMENT_P.documentRead);
    const users = await prisma.user.findMany({
      where: {
        userTenants: { some: { tenantId: ctx.tenantId, isActive: true } },
        isActive: true,
      },
      select: {
        id: true,
        name: true,
        email: true,
      },
      orderBy: { name: "asc" },
      take: 50,
    });

    return users.map((u) => ({
      id: u.id,
      name: u.name || u.email,
      email: u.email,
    }));
  });
}
