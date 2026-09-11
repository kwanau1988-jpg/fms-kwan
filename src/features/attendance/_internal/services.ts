import crypto from "crypto";
import { prisma } from "@/shared/lib/infra/prisma";
import { errors } from "@/shared/lib/errors";
import type { CreateSessionInput, CheckInInput, UpdateRecordStatusInput } from "./validations";

export interface AttendanceRecordDto {
  id: string;
  sessionId: string;
  studentId: string;
  studentName: string;
  studentEmail: string;
  status: "PRESENT" | "LATE" | "ABSENT" | "EXCUSED";
  checkedAt: string;
  ipAddress: string | null;
  remark: string | null;
}

export interface ClassroomSessionDto {
  id: string;
  tenantId: string;
  courseId: string;
  courseCode: string;
  courseTitleTh: string;
  courseTitleEn: string;
  instructorId: string;
  roomNumber: string | null;
  sessionDate: string;
  startTime: string;
  endTime: string;
  qrToken: string | null;
  qrExpiresAt: string | null;
  isActive: boolean;
  createdAt: string;
  recordsCount: number;
  presentCount: number;
  records?: AttendanceRecordDto[];
}

function generateQrToken(): { token: string; expiresAt: Date } {
  const token = crypto.randomBytes(4).toString("hex").toUpperCase();
  const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 mins
  return { token, expiresAt };
}

import type { Prisma } from "@/generated/prisma";

type SessionWithRelations = Prisma.ClassroomSessionGetPayload<{
  include: {
    course: true;
    records: {
      include: {
        student: { select: { id: true; name: true; email: true } };
      };
    };
  };
}>;

function mapSessionDto(s: SessionWithRelations): ClassroomSessionDto {
  const records = s.records || [];
  const presentCount = records.filter(
    (r) => r.status === "PRESENT" || r.status === "LATE",
  ).length;

  return {
    id: s.id,
    tenantId: s.tenantId,
    courseId: s.courseId,
    courseCode: s.course?.code || "",
    courseTitleTh: s.course?.titleTh || "",
    courseTitleEn: s.course?.titleEn || "",
    instructorId: s.instructorId,
    roomNumber: s.roomNumber,
    sessionDate: s.sessionDate instanceof Date ? s.sessionDate.toISOString().split("T")[0] : String(s.sessionDate),
    startTime: s.startTime,
    endTime: s.endTime,
    qrToken: s.qrToken,
    qrExpiresAt: s.qrExpiresAt ? s.qrExpiresAt.toISOString() : null,
    isActive: s.isActive,
    createdAt: s.createdAt.toISOString(),
    recordsCount: records.length,
    presentCount,
    records: records.map((r) => ({
      id: r.id,
      sessionId: r.sessionId,
      studentId: r.studentId,
      studentName: r.student?.name || r.student?.email || "Student",
      studentEmail: r.student?.email || "",
      status: r.status,
      checkedAt: r.checkedAt.toISOString(),
      ipAddress: r.ipAddress,
      remark: r.remark,
    })),
  };
}

export async function listSessions(
  tenantId: string,
  instructorId?: string,
): Promise<ClassroomSessionDto[]> {
  const items = await prisma.classroomSession.findMany({
    where: {
      tenantId,
      ...(instructorId ? { instructorId } : {}),
    },
    include: {
      course: true,
      records: {
        include: {
          student: { select: { id: true, name: true, email: true } },
        },
      },
    },
    orderBy: [{ sessionDate: "desc" }, { startTime: "desc" }],
  });

  return items.map(mapSessionDto);
}

export async function getSessionDetail(
  tenantId: string,
  sessionId: string,
): Promise<ClassroomSessionDto | null> {
  const session = await prisma.classroomSession.findFirst({
    where: { id: sessionId, tenantId },
    include: {
      course: true,
      records: {
        include: {
          student: { select: { id: true, name: true, email: true } },
        },
        orderBy: { checkedAt: "asc" },
      },
    },
  });

  return session ? mapSessionDto(session) : null;
}

export async function createSession(
  tenantId: string,
  instructorId: string,
  input: CreateSessionInput,
): Promise<ClassroomSessionDto> {
  const { token, expiresAt } = generateQrToken();

  const created = await prisma.classroomSession.create({
    data: {
      tenantId,
      courseId: input.courseId,
      instructorId,
      roomNumber: input.roomNumber ?? null,
      sessionDate: new Date(`${input.sessionDate}T00:00:00.000Z`),
      startTime: input.startTime,
      endTime: input.endTime,
      qrToken: token,
      qrExpiresAt: expiresAt,
      isActive: true,
    },
    include: {
      course: true,
      records: {
        include: {
          student: { select: { id: true, name: true, email: true } },
        },
      },
    },
  });

  return mapSessionDto(created);
}

export async function rotateSessionQr(
  tenantId: string,
  sessionId: string,
): Promise<ClassroomSessionDto> {
  const { token, expiresAt } = generateQrToken();

  const updated = await prisma.classroomSession.update({
    where: { id: sessionId, tenantId },
    data: {
      qrToken: token,
      qrExpiresAt: expiresAt,
    },
    include: {
      course: true,
      records: {
        include: {
          student: { select: { id: true, name: true, email: true } },
        },
      },
    },
  });

  return mapSessionDto(updated);
}

export async function checkInAttendance(
  tenantId: string,
  studentId: string,
  input: CheckInInput,
  ipAddress?: string,
): Promise<AttendanceRecordDto> {
  const session = await prisma.classroomSession.findFirst({
    where: { id: input.sessionId, tenantId },
  });

  if (!session || !session.isActive) {
    throw errors.validation("attendance.sessionInactive");
  }

  if (!session.qrToken || session.qrToken !== input.qrToken.toUpperCase().trim()) {
    throw errors.validation("attendance.tokenExpired");
  }

  if (session.qrExpiresAt && session.qrExpiresAt < new Date()) {
    throw errors.validation("attendance.tokenExpired");
  }

  const existing = await prisma.attendanceRecord.findFirst({
    where: {
      sessionId: input.sessionId,
      studentId,
    },
  });

  if (existing) {
    throw errors.conflict("attendance.alreadyChecked");
  }

  const record = await prisma.attendanceRecord.create({
    data: {
      tenantId,
      sessionId: input.sessionId,
      studentId,
      status: "PRESENT",
      ipAddress: ipAddress ?? null,
      remark: input.remark ?? null,
    },
    include: {
      student: { select: { id: true, name: true, email: true } },
    },
  });

  return {
    id: record.id,
    sessionId: record.sessionId,
    studentId: record.studentId,
    studentName: record.student?.name || record.student?.email || "Student",
    studentEmail: record.student?.email || "",
    status: record.status,
    checkedAt: record.checkedAt.toISOString(),
    ipAddress: record.ipAddress,
    remark: record.remark,
  };
}

export async function updateAttendanceStatus(
  tenantId: string,
  input: UpdateRecordStatusInput,
): Promise<AttendanceRecordDto> {
  const record = await prisma.attendanceRecord.update({
    where: { id: input.recordId, tenantId },
    data: {
      status: input.status,
      remark: input.remark ?? null,
    },
    include: {
      student: { select: { id: true, name: true, email: true } },
    },
  });

  return {
    id: record.id,
    sessionId: record.sessionId,
    studentId: record.studentId,
    studentName: record.student?.name || record.student?.email || "Student",
    studentEmail: record.student?.email || "",
    status: record.status,
    checkedAt: record.checkedAt.toISOString(),
    ipAddress: record.ipAddress,
    remark: record.remark,
  };
}

export async function listCoursesForSession(tenantId: string) {
  return prisma.course.findMany({
    where: { tenantId },
    select: {
      id: true,
      code: true,
      titleTh: true,
      titleEn: true,
    },
    orderBy: { code: "asc" },
  });
}
