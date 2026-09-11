import { requirePermission, hasPermission } from "@/features/identity/server";
import { BOOKING_P, listReservations, listResources } from "@/features/booking/server";
import { BookingClient } from "./_components/booking-client";

export default async function BookingAdminPage() {
  const ctx = await requirePermission(BOOKING_P.bookingRead);
  const [initialReservations, initialResources] = await Promise.all([
    listReservations(ctx.tenantId),
    listResources(ctx.tenantId, undefined, true),
  ]);

  return (
    <BookingClient
      initialReservations={initialReservations}
      initialResources={initialResources}
      currentUserId={ctx.userId}
      canCreate={hasPermission(ctx, BOOKING_P.bookingCreate)}
      canApprove={hasPermission(ctx, BOOKING_P.bookingApprove)}
      canManage={hasPermission(ctx, BOOKING_P.bookingManage)}
    />
  );
}
