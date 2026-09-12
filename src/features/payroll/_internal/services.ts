import crypto from "crypto";
import { prisma } from "@/shared/lib/infra/prisma";
import { errors } from "@/shared/lib/errors";
import { writeAudit } from "@/features/identity/server";
import { hashPassword } from "@/shared/lib/security/password";
import type {
  CreatePeriodInput,
  TogglePublishPeriodInput,
  GenerateDemoSlipsInput,
  UpsertPayrollSlipInput,
  SetUserPasswordDirectInput,
} from "./validations";

export interface PayrollBreakdown {
  baseSalary: number;
  academicAllowance: number;
  positionAllowance: number;
  specialAllowance: number;
  grossIncome: number;
  taxWithholding: number;
  socialSecurity: number;
  providentFund: number;
  cooperatives: number;
  totalDeductions: number;
  netPayable: number;
}

export interface PayrollPeriodDto {
  id: string;
  tenantId: string;
  year: number;
  month: number;
  isPublished: boolean;
  slipsCount: number;
  createdAt: string;
}

export interface PayrollSlipDto {
  id: string;
  tenantId: string;
  periodId: string;
  year: number;
  month: number;
  userId: string;
  userName: string;
  userEmail: string;
  academicTitle?: string | null;
  positionTh?: string | null;
  departmentTh?: string | null;
  netPayable: number;
  bankAccountMasked: string | null;
  downloadedAt: string | null;
  createdAt: string;
  breakdown?: PayrollBreakdown;
}

export interface EligiblePersonnelDto {
  userId: string;
  email: string;
  name: string;
  academicTitle?: string | null;
  positionTh?: string | null;
  departmentTh?: string | null;
  hasPassword: boolean;
  isActive: boolean;
}


const SECRET = process.env.AUTH_SECRET || "fms_payroll_confidential_salt_key_2026";
const ENCRYPTION_KEY = crypto.createHash("sha256").update(SECRET).digest();

export function encryptPayload(data: Record<string, unknown> | object): string {
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv("aes-256-gcm", ENCRYPTION_KEY, iv);
  const json = JSON.stringify(data);
  const encrypted = Buffer.concat([cipher.update(json, "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();

  return `${iv.toString("hex")}:${tag.toString("hex")}:${encrypted.toString("hex")}`;
}

export function decryptPayload<T = unknown>(encryptedString: string): T {
  const parts = encryptedString.split(":");
  if (parts.length !== 3) {
    throw errors.validation("payroll.invalidPayload");
  }

  const [ivHex, tagHex, dataHex] = parts;
  const iv = Buffer.from(ivHex, "hex");
  const tag = Buffer.from(tagHex, "hex");
  const encrypted = Buffer.from(dataHex, "hex");

  const decipher = crypto.createDecipheriv("aes-256-gcm", ENCRYPTION_KEY, iv);
  decipher.setAuthTag(tag);
  const decrypted = Buffer.concat([decipher.update(encrypted), decipher.final()]);

  return JSON.parse(decrypted.toString("utf8")) as T;
}

export async function listPeriods(tenantId: string): Promise<PayrollPeriodDto[]> {
  const items = await prisma.payrollPeriod.findMany({
    where: { tenantId },
    include: {
      _count: { select: { slips: true } },
    },
    orderBy: [{ year: "desc" }, { month: "desc" }],
  });

  return items.map((p) => ({
    id: p.id,
    tenantId: p.tenantId,
    year: p.year,
    month: p.month,
    isPublished: p.isPublished,
    slipsCount: p._count.slips,
    createdAt: p.createdAt.toISOString(),
  }));
}

export async function createPeriod(
  tenantId: string,
  input: CreatePeriodInput,
): Promise<PayrollPeriodDto> {
  const period = await prisma.payrollPeriod.create({
    data: {
      tenantId,
      year: input.year,
      month: input.month,
      isPublished: false,
    },
    include: {
      _count: { select: { slips: true } },
    },
  });

  return {
    id: period.id,
    tenantId: period.tenantId,
    year: period.year,
    month: period.month,
    isPublished: period.isPublished,
    slipsCount: 0,
    createdAt: period.createdAt.toISOString(),
  };
}

export async function togglePublishPeriod(
  tenantId: string,
  input: TogglePublishPeriodInput,
  actorId?: string,
): Promise<PayrollPeriodDto> {
  const updated = await prisma.$transaction(async (tx) => {
    const period = await tx.payrollPeriod.update({
      where: { id: input.periodId, tenantId },
      data: { isPublished: input.isPublished },
      include: {
        _count: { select: { slips: true } },
      },
    });

    await writeAudit(
      {
        tenantId,
        actorId: actorId ?? null,
        action: input.isPublished ? "payroll.publish" : "payroll.unpublish",
        entity: "payroll_period",
        entityId: period.id,
        after: { isPublished: input.isPublished, year: period.year, month: period.month },
      },
      tx,
    );

    return period;
  });

  return {
    id: updated.id,
    tenantId: updated.tenantId,
    year: updated.year,
    month: updated.month,
    isPublished: updated.isPublished,
    slipsCount: updated._count.slips,
    createdAt: updated.createdAt.toISOString(),
  };
}

export async function generateDemoSlipsForPeriod(
  tenantId: string,
  input: GenerateDemoSlipsInput,
): Promise<number> {
  const period = await prisma.payrollPeriod.findFirst({
    where: { id: input.periodId, tenantId },
  });

  if (!period) throw errors.not_found("payroll.periodNotFound");

  const users = await prisma.user.findMany({
    where: {
      userTenants: { some: { tenantId, isActive: true } },
      isActive: true,
    },
    select: { id: true, name: true, email: true },
  });

  const operations = users.map((user) => {
    // Generate realistic Thai academic payroll breakdown
    const baseSalary = 35000 + Math.floor(Math.random() * 25000);
    const academicAllowance = Math.random() > 0.4 ? 11200 : 5600;
    const positionAllowance = Math.random() > 0.6 ? 7500 : 0;
    const specialAllowance = 3000;
    const grossIncome = baseSalary + academicAllowance + positionAllowance + specialAllowance;

    const taxWithholding = Math.round(grossIncome * 0.05);
    const socialSecurity = 750;
    const providentFund = Math.round(baseSalary * 0.04);
    const cooperatives = 2000;
    const totalDeductions = taxWithholding + socialSecurity + providentFund + cooperatives;
    const netPayable = grossIncome - totalDeductions;

    const breakdown: PayrollBreakdown = {
      baseSalary,
      academicAllowance,
      positionAllowance,
      specialAllowance,
      grossIncome,
      taxWithholding,
      socialSecurity,
      providentFund,
      cooperatives,
      totalDeductions,
      netPayable,
    };

    const encryptedPayload = encryptPayload(breakdown);
    const lastDigits = Math.floor(1000 + Math.random() * 9000);
    const bankAccountMasked = `xxx-x-xx${lastDigits}-0`;

    return prisma.payrollSlip.upsert({
      where: {
        periodId_userId: {
          periodId: period.id,
          userId: user.id,
        },
      },
      update: {
        encryptedPayload,
        netPayable,
        bankAccountMasked,
      },
      create: {
        tenantId,
        periodId: period.id,
        userId: user.id,
        encryptedPayload,
        netPayable,
        bankAccountMasked,
      },
    });
  });

  await prisma.$transaction(operations);
  return users.length;
}

export async function listMySlips(
  tenantId: string,
  userId: string,
): Promise<PayrollSlipDto[]> {
  const slips = await prisma.payrollSlip.findMany({
    where: {
      tenantId,
      userId,
      period: { isPublished: true },
    },
    include: {
      period: true,
      user: { select: { id: true, name: true, email: true } },
    },
    orderBy: [
      { period: { year: "desc" } },
      { period: { month: "desc" } },
    ],
  });

  return slips.map((s) => {
    let breakdown: PayrollBreakdown | undefined;
    try {
      breakdown = decryptPayload<PayrollBreakdown>(s.encryptedPayload);
    } catch {
      breakdown = undefined;
    }

    return {
      id: s.id,
      tenantId: s.tenantId,
      periodId: s.periodId,
      year: s.period.year,
      month: s.period.month,
      userId: s.userId,
      userName: s.user?.name || s.user?.email || "User",
      userEmail: s.user?.email || "",
      netPayable: Number(s.netPayable),
      bankAccountMasked: s.bankAccountMasked,
      downloadedAt: s.downloadedAt ? s.downloadedAt.toISOString() : null,
      createdAt: s.createdAt.toISOString(),
      breakdown,
    };
  });
}

export async function getMySlipDetail(
  tenantId: string,
  userId: string,
  slipId: string,
): Promise<PayrollSlipDto | null> {
  const slip = await prisma.payrollSlip.findFirst({
    where: {
      id: slipId,
      tenantId,
      userId,
      period: { isPublished: true },
    },
    include: {
      period: true,
      user: { select: { id: true, name: true, email: true } },
    },
  });

  if (!slip) return null;

  await prisma.payrollSlip.update({
    where: { id: slip.id },
    data: { downloadedAt: new Date() },
  });

  const breakdown = decryptPayload<PayrollBreakdown>(slip.encryptedPayload);

  return {
    id: slip.id,
    tenantId: slip.tenantId,
    periodId: slip.periodId,
    year: slip.period.year,
    month: slip.period.month,
    userId: slip.userId,
    userName: slip.user?.name || slip.user?.email || "User",
    userEmail: slip.user?.email || "",
    netPayable: Number(slip.netPayable),
    bankAccountMasked: slip.bankAccountMasked,
    downloadedAt: new Date().toISOString(),
    createdAt: slip.createdAt.toISOString(),
    breakdown,
  };
}

export async function listEligiblePersonnel(tenantId: string): Promise<EligiblePersonnelDto[]> {
  const userTenants = await prisma.userTenant.findMany({
    where: { tenantId, isActive: true },
    include: {
      user: {
        include: {
          personnelProfile: true,
        },
      },
    },
    orderBy: { user: { name: "asc" } },
  });

  const existingUserIds = new Set(userTenants.map((ut) => ut.userId));

  const results: EligiblePersonnelDto[] = userTenants.map((ut) => {
    const profile = ut.user.personnelProfile;
    return {
      userId: ut.user.id,
      email: ut.user.email,
      name: ut.user.name,
      academicTitle: profile?.academicTitle ?? null,
      positionTh: profile?.positionTh ?? null,
      departmentTh: profile?.departmentTh ?? null,
      hasPassword: !!ut.user.passwordHash,
      isActive: ut.isActive && ut.user.isActive,
    };
  });

  const unlinkedProfiles = await prisma.personnelProfile.findMany({
    where: {
      tenantId,
      isActive: true,
      OR: [
        { userId: null },
        { userId: { notIn: Array.from(existingUserIds) } },
      ],
    },
    orderBy: [{ displayOrder: "asc" }, { firstNameTh: "asc" }],
  });

  for (const p of unlinkedProfiles) {
    let user = await prisma.user.findUnique({ where: { email: p.email.toLowerCase() } });
    if (!user) {
      const fullName = `${p.academicTitle ? p.academicTitle + " " : ""}${p.firstNameTh} ${p.lastNameTh}`.trim();
      user = await prisma.user.create({
        data: {
          email: p.email.toLowerCase(),
          name: fullName,
        },
      });
      await prisma.userTenant.create({
        data: {
          userId: user.id,
          tenantId,
          isActive: true,
        },
      });
      await prisma.personnelProfile.update({
        where: { id: p.id },
        data: { userId: user.id },
      });
    } else {
      await prisma.userTenant.upsert({
        where: { userId_tenantId: { userId: user.id, tenantId } },
        update: { isActive: true },
        create: { userId: user.id, tenantId, isActive: true },
      });
      if (p.userId !== user.id) {
        await prisma.personnelProfile.update({
          where: { id: p.id },
          data: { userId: user.id },
        });
      }
    }

    if (!existingUserIds.has(user.id)) {
      existingUserIds.add(user.id);
      results.push({
        userId: user.id,
        email: user.email,
        name: user.name,
        academicTitle: p.academicTitle,
        positionTh: p.positionTh,
        departmentTh: p.departmentTh,
        hasPassword: !!user.passwordHash,
        isActive: true,
      });
    }
  }

  return results.sort((a, b) => a.name.localeCompare(b.name, "th"));
}

export async function listPeriodSlips(
  tenantId: string,
  periodId: string,
): Promise<PayrollSlipDto[]> {
  const slips = await prisma.payrollSlip.findMany({
    where: {
      tenantId,
      periodId,
    },
    include: {
      period: true,
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          personnelProfile: {
            select: {
              academicTitle: true,
              positionTh: true,
              departmentTh: true,
            },
          },
        },
      },
    },
    orderBy: { user: { name: "asc" } },
  });

  return slips.map((s) => {
    let breakdown: PayrollBreakdown | undefined;
    try {
      breakdown = decryptPayload<PayrollBreakdown>(s.encryptedPayload);
    } catch {
      breakdown = undefined;
    }

    return {
      id: s.id,
      tenantId: s.tenantId,
      periodId: s.periodId,
      year: s.period.year,
      month: s.period.month,
      userId: s.userId,
      userName: s.user?.name || s.user?.email || "User",
      userEmail: s.user?.email || "",
      academicTitle: s.user?.personnelProfile?.academicTitle ?? null,
      positionTh: s.user?.personnelProfile?.positionTh ?? null,
      departmentTh: s.user?.personnelProfile?.departmentTh ?? null,
      netPayable: Number(s.netPayable),
      bankAccountMasked: s.bankAccountMasked,
      downloadedAt: s.downloadedAt ? s.downloadedAt.toISOString() : null,
      createdAt: s.createdAt.toISOString(),
      breakdown,
    };
  });
}

export async function upsertPayrollSlip(
  tenantId: string,
  input: UpsertPayrollSlipInput,
  actorId?: string,
): Promise<PayrollSlipDto> {
  const period = await prisma.payrollPeriod.findFirst({
    where: { id: input.periodId, tenantId },
  });
  if (!period) throw errors.not_found("payroll.periodNotFound");

  const grossIncome =
    input.baseSalary +
    input.academicAllowance +
    input.positionAllowance +
    input.specialAllowance;

  const totalDeductions =
    input.taxWithholding +
    input.socialSecurity +
    input.providentFund +
    input.cooperatives;

  const netPayable = grossIncome - totalDeductions;

  const breakdown: PayrollBreakdown = {
    baseSalary: input.baseSalary,
    academicAllowance: input.academicAllowance,
    positionAllowance: input.positionAllowance,
    specialAllowance: input.specialAllowance,
    grossIncome,
    taxWithholding: input.taxWithholding,
    socialSecurity: input.socialSecurity,
    providentFund: input.providentFund,
    cooperatives: input.cooperatives,
    totalDeductions,
    netPayable,
  };

  const encryptedPayload = encryptPayload(breakdown);

  const result = await prisma.$transaction(async (tx) => {
    if (input.loginPassword && input.loginPassword.trim().length >= 8) {
      const passwordHash = await hashPassword(input.loginPassword.trim());
      await tx.user.update({
        where: { id: input.userId },
        data: {
          passwordHash,
          mustChangePassword: false,
          emailVerified: true,
          isActive: true,
        },
      });

      await writeAudit(
        {
          tenantId,
          actorId: actorId ?? null,
          action: "user.set_password",
          entity: "user",
          entityId: input.userId,
          after: { resetBy: "payroll_admin" },
        },
        tx,
      );
    }

    const slip = await tx.payrollSlip.upsert({
      where: {
        periodId_userId: {
          periodId: input.periodId,
          userId: input.userId,
        },
      },
      update: {
        encryptedPayload,
        netPayable,
        bankAccountMasked: input.bankAccountMasked || null,
      },
      create: {
        tenantId,
        periodId: input.periodId,
        userId: input.userId,
        encryptedPayload,
        netPayable,
        bankAccountMasked: input.bankAccountMasked || null,
      },
      include: {
        period: true,
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            personnelProfile: {
              select: {
                academicTitle: true,
                positionTh: true,
                departmentTh: true,
              },
            },
          },
        },
      },
    });

    await writeAudit(
      {
        tenantId,
        actorId: actorId ?? null,
        action: "payroll.slip_upsert",
        entity: "payroll_slip",
        entityId: slip.id,
        after: {
          userId: input.userId,
          periodId: input.periodId,
          netPayable,
        },
      },
      tx,
    );

    return slip;
  });

  return {
    id: result.id,
    tenantId: result.tenantId,
    periodId: result.periodId,
    year: result.period.year,
    month: result.period.month,
    userId: result.userId,
    userName: result.user?.name || result.user?.email || "User",
    userEmail: result.user?.email || "",
    academicTitle: result.user?.personnelProfile?.academicTitle ?? null,
    positionTh: result.user?.personnelProfile?.positionTh ?? null,
    departmentTh: result.user?.personnelProfile?.departmentTh ?? null,
    netPayable: Number(result.netPayable),
    bankAccountMasked: result.bankAccountMasked,
    downloadedAt: result.downloadedAt ? result.downloadedAt.toISOString() : null,
    createdAt: result.createdAt.toISOString(),
    breakdown,
  };
}

export async function deletePayrollSlip(
  tenantId: string,
  slipId: string,
  actorId?: string,
): Promise<void> {
  const slip = await prisma.payrollSlip.findFirst({
    where: { id: slipId, tenantId },
  });
  if (!slip) throw errors.not_found("payroll.slipNotFound");

  await prisma.$transaction(async (tx) => {
    await tx.payrollSlip.delete({
      where: { id: slipId },
    });

    await writeAudit(
      {
        tenantId,
        actorId: actorId ?? null,
        action: "payroll.slip_delete",
        entity: "payroll_slip",
        entityId: slipId,
        before: {
          periodId: slip.periodId,
          userId: slip.userId,
          netPayable: Number(slip.netPayable),
        },
      },
      tx,
    );
  });
}

export async function setUserLoginPassword(
  tenantId: string,
  input: SetUserPasswordDirectInput,
  actorId?: string,
): Promise<void> {
  const membership = await prisma.userTenant.findFirst({
    where: { userId: input.userId, tenantId },
  });
  if (!membership) throw errors.not_found("user_not_in_tenant");

  const passwordHash = await hashPassword(input.password);
  await prisma.$transaction(async (tx) => {
    await tx.user.update({
      where: { id: input.userId },
      data: {
        passwordHash,
        mustChangePassword: false,
        emailVerified: true,
        isActive: true,
      },
    });

    await writeAudit(
      {
        tenantId,
        actorId: actorId ?? null,
        action: "user.password_direct_set",
        entity: "user",
        entityId: input.userId,
      },
      tx,
    );
  });
}

