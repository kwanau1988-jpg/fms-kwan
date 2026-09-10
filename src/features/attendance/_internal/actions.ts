"use server";

import { revalidatePath } from "next/cache";
import { runAction, type ActionResult } from "@/shared/lib/result";
import { getLocale } from "@/shared/lib/i18n/server";
import { zodErrorMap } from "@/shared/lib/i18n/zod-locale";
import { requirePermission } from "@/features/identity/server";
import { ATTENDANCE_P } from "../permissions";
import {
  createSessionSchema,
  checkInSchema,
  updateRecordStatusSchema,
} from "./validations";
import {
  listSessions,
  getSessionDetail,
  createSession,
  rotateSessionQr,
  checkInAttendance,
  updateAttendanceStatus,
  listCoursesForSession,
  type ClassroomSessionDto,
  type AttendanceRecordDto,
} from "./services";

export async function getSessionsAction(): Promise<ActionResult<ClassroomSessionDto[]>> {
  return runAction(async () => {
    const ctx = await requirePermission(ATTENDANCE_P.attendanceTeach);
    const isManager = ctx.permissions?.includes(ATTENDANCE_P.attendanceManage) ?? false;
    return listSessions(ctx.tenantId, isManager ? undefined : ctx.userId);
  });
}

export async function getSessionDetailAction(
  sessionId: string,
): Promise<ActionResult<ClassroomSessionDto | null>> {
  return runAction(async () => {
    const ctx = await requirePermission(ATTENDANCE_P.attendanceTeach);
    return getSessionDetail(ctx.tenantId, sessionId);
  });
}

export async function createSessionAction(
  input: unknown,
): Promise<ActionResult<ClassroomSessionDto>> {
  return runAction(async () => {
    const ctx = await requirePermission(ATTENDANCE_P.attendanceTeach);
    const parsed = createSessionSchema.parse(input, { error: zodErrorMap(await getLocale()) });
    const result = await createSession(ctx.tenantId, ctx.userId, parsed);
    revalidatePath("/attendance");
    return result;
  });
}

export async function rotateSessionQrAction(
  sessionId: string,
): Promise<ActionResult<ClassroomSessionDto>> {
  return runAction(async () => {
    const ctx = await requirePermission(ATTENDANCE_P.attendanceTeach);
    const result = await rotateSessionQr(ctx.tenantId, sessionId);
    revalidatePath("/attendance");
    return result;
  });
}

export async function checkInAttendanceAction(
  input: unknown,
): Promise<ActionResult<AttendanceRecordDto>> {
  return runAction(async () => {
    const ctx = await requirePermission(ATTENDANCE_P.attendanceScan);
    const parsed = checkInSchema.parse(input, { error: zodErrorMap(await getLocale()) });
    const result = await checkInAttendance(ctx.tenantId, ctx.userId, parsed);
    revalidatePath("/attendance");
    return result;
  });
}

export async function updateAttendanceStatusAction(
  input: unknown,
): Promise<ActionResult<AttendanceRecordDto>> {
  return runAction(async () => {
    const ctx = await requirePermission(ATTENDANCE_P.attendanceTeach);
    const parsed = updateRecordStatusSchema.parse(input, { error: zodErrorMap(await getLocale()) });
    const result = await updateAttendanceStatus(ctx.tenantId, parsed);
    revalidatePath("/attendance");
    return result;
  });
}

export async function getAvailableCoursesAction(): Promise<
  ActionResult<Array<{ id: string; code: string; titleTh: string; titleEn: string }>>
> {
  return runAction(async () => {
    const ctx = await requirePermission(ATTENDANCE_P.attendanceTeach);
    return listCoursesForSession(ctx.tenantId);
  });
}
