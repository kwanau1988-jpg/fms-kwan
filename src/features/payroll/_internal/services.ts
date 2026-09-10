import crypto from "crypto";
import { prisma } from "@/shared/lib/infra/prisma";
import type {
  CreatePeriodInput,
  TogglePublishPeriodInput,
  GenerateDemoSlipsInput,
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
  netPayable: number;
  bankAccountMasked: string | null;
  downloadedAt: string | null;
  createdAt: string;
  breakdown?: PayrollBreakdown;
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
    throw new Error("Invalid encrypted payload format");
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
): Promise<PayrollPeriodDto> {
  const updated = await prisma.payrollPeriod.update({
    where: { id: input.periodId, tenantId },
    data: { isPublished: input.isPublished },
    include: {
      _count: { select: { slips: true } },
    },
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

  if (!period) throw new Error("Payroll period not found");

  const users = await prisma.user.findMany({
    where: {
      userTenants: { some: { tenantId, isActive: true } },
      isActive: true,
    },
    select: { id: true, name: true, email: true },
  });

  let count = 0;
  for (const user of users) {
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

    await prisma.payrollSlip.upsert({
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
    count++;
  }

  return count;
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
