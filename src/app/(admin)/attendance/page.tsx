import { requirePermission, hasPermission } from "@/features/identity/server";
import { ATTENDANCE_P, listSessions, listCoursesForSession } from "@/features/attendance/server";
import { AttendanceClient } from "./_components/attendance-client";

export default async function AttendanceAdminPage() {
  const ctx = await requirePermission(ATTENDANCE_P.attendanceTeach);
  const isManager = hasPermission(ctx, ATTENDANCE_P.attendanceManage);
  const [initialSessions, courses] = await Promise.all([
    listSessions(ctx.tenantId, isManager ? undefined : ctx.userId),
    listCoursesForSession(ctx.tenantId),
  ]);

  return (
    <AttendanceClient
      initialSessions={initialSessions}
      courses={courses}
      currentUserId={ctx.userId}
      canManage={isManager}
    />
  );
}
