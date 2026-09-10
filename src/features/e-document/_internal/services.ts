import { prisma } from "@/shared/lib/infra/prisma";
import type { CreateDocumentInput, DecideDocumentInput } from "./validations";

import type { Prisma } from "@/generated/prisma";

export interface DocumentApprovalDto {
  id: string;
  requestId: string;
  stepOrder: number;
  approverId: string;
  approverName: string;
  approverEmail: string;
  decision: "PENDING" | "APPROVED" | "REJECTED";
  comment: string | null;
  actionAt: string | null;
  createdAt: string;
}

export interface DocumentRequestDto {
  id: string;
  tenantId: string;
  docNumber: string;
  title: string;
  docType: string;
  requesterId: string;
  requesterName: string;
  requesterEmail: string;
  currentStep: number;
  status: "DRAFT" | "PENDING" | "APPROVED" | "REJECTED" | "CANCELLED";
  attachmentUrls: string[];
  metadata: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
  approvals: DocumentApprovalDto[];
}

type DocumentWithRelations = Prisma.DocumentRequestGetPayload<{
  include: {
    requester: { select: { id: true; email: true; name: true } };
    approvals: {
      include: {
        approver: { select: { id: true; email: true; name: true } };
      };
    };
  };
}>;

function mapDocumentDto(doc: DocumentWithRelations): DocumentRequestDto {
  return {
    id: doc.id,
    tenantId: doc.tenantId,
    docNumber: doc.docNumber,
    title: doc.title,
    docType: doc.docType,
    requesterId: doc.requesterId,
    requesterName: doc.requester?.name || doc.requester?.email || "Unknown",
    requesterEmail: doc.requester?.email || "",
    currentStep: doc.currentStep,
    status: doc.status,
    attachmentUrls: Array.isArray(doc.attachmentUrls) ? (doc.attachmentUrls as string[]) : [],
    metadata: (doc.metadata as Record<string, unknown>) || {},
    createdAt: doc.createdAt.toISOString(),
    updatedAt: doc.updatedAt.toISOString(),
    approvals: (doc.approvals || []).map((a) => ({
      id: a.id,
      requestId: a.requestId,
      stepOrder: a.stepOrder,
      approverId: a.approverId,
      approverName: a.approver?.name || a.approver?.email || "Approver",
      approverEmail: a.approver?.email || "",
      decision: a.decision,
      comment: a.comment,
      actionAt: a.actionAt ? a.actionAt.toISOString() : null,
      createdAt: a.createdAt.toISOString(),
    })),
  };
}

export async function listDocumentRequests(
  tenantId: string,
  filters?: { requesterId?: string; status?: string },
): Promise<DocumentRequestDto[]> {
  const items = await prisma.documentRequest.findMany({
    where: {
      tenantId,
      ...(filters?.requesterId ? { requesterId: filters.requesterId } : {}),
      ...(filters?.status ? { status: filters.status as Prisma.EnumDocumentStatusFilter["equals"] } : {}),
    },
    include: {
      requester: {
        select: {
          id: true,
          email: true,
          name: true,
        },
      },
      approvals: {
        orderBy: { stepOrder: "asc" },
        include: {
          approver: {
            select: {
              id: true,
              email: true,
              name: true,
            },
          },
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return items.map(mapDocumentDto);
}

export async function getDocumentRequestById(
  tenantId: string,
  id: string,
): Promise<DocumentRequestDto | null> {
  const doc = await prisma.documentRequest.findFirst({
    where: { id, tenantId },
    include: {
      requester: {
        select: {
          id: true,
          email: true,
          name: true,
        },
      },
      approvals: {
        orderBy: { stepOrder: "asc" },
        include: {
          approver: {
            select: {
              id: true,
              email: true,
              name: true,
            },
          },
        },
      },
    },
  });

  return doc ? mapDocumentDto(doc) : null;
}

export async function createDocumentRequest(
  tenantId: string,
  requesterId: string,
  input: CreateDocumentInput,
): Promise<DocumentRequestDto> {
  const count = await prisma.documentRequest.count({ where: { tenantId } });
  const year = new Date().getFullYear();
  const docNumber = `DOC-${year}-${String(count + 1).padStart(4, "0")}`;

  const created = await prisma.$transaction(async (tx) => {
    const doc = await tx.documentRequest.create({
      data: {
        tenantId,
        docNumber,
        title: input.title,
        docType: input.docType,
        requesterId,
        currentStep: 1,
        status: "PENDING",
        attachmentUrls: input.attachmentUrls ?? [],
        metadata: input.metadata ?? {},
      },
    });

    for (let i = 0; i < input.approverIds.length; i++) {
      await tx.documentApproval.create({
        data: {
          requestId: doc.id,
          stepOrder: i + 1,
          approverId: input.approverIds[i],
          decision: "PENDING",
        },
      });
    }

    return doc;
  });

  const full = await getDocumentRequestById(tenantId, created.id);
  if (!full) throw new Error("Failed to load created document request");
  return full;
}

export async function decideDocumentApproval(
  tenantId: string,
  actorId: string,
  input: DecideDocumentInput,
  isAdmin = false,
): Promise<DocumentRequestDto> {
  const doc = await prisma.documentRequest.findFirst({
    where: { id: input.requestId, tenantId },
    include: {
      approvals: {
        orderBy: { stepOrder: "asc" },
      },
    },
  });

  if (!doc) {
    throw new Error("Document not found");
  }

  if (doc.status !== "PENDING") {
    throw new Error("Document is no longer pending approval");
  }

  const currentApproval = doc.approvals.find((a) => a.stepOrder === doc.currentStep);
  if (!currentApproval) {
    throw new Error("Invalid approval step");
  }

  if (!isAdmin && currentApproval.approverId !== actorId) {
    throw new Error("You are not the designated approver for this step");
  }

  await prisma.$transaction(async (tx) => {
    await tx.documentApproval.update({
      where: { id: currentApproval.id },
      data: {
        decision: input.decision,
        comment: input.comment ?? null,
        actionAt: new Date(),
      },
    });

    if (input.decision === "REJECTED") {
      await tx.documentRequest.update({
        where: { id: doc.id },
        data: { status: "REJECTED" },
      });
    } else {
      const nextStep = doc.approvals.find((a) => a.stepOrder === doc.currentStep + 1);
      if (nextStep) {
        await tx.documentRequest.update({
          where: { id: doc.id },
          data: { currentStep: doc.currentStep + 1 },
        });
      } else {
        await tx.documentRequest.update({
          where: { id: doc.id },
          data: { status: "APPROVED" },
        });
      }
    }
  });

  const updated = await getDocumentRequestById(tenantId, doc.id);
  if (!updated) throw new Error("Failed to reload updated document");
  return updated;
}
