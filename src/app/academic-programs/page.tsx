import { redirect } from "next/navigation";
import { auth } from "@/features/identity/server";

export default async function AcademicProgramsPage(props: {
  searchParams?: Promise<{ level?: string; dept?: string }>;
}) {
  const session = await auth();
  if (session?.user) {
    redirect("/curriculum");
  }

  const searchParams = await props.searchParams;
  const params = new URLSearchParams();
  if (searchParams?.level) params.set("level", searchParams.level);
  if (searchParams?.dept) params.set("dept", searchParams.dept);
  const qs = params.toString();
  redirect(qs ? `/portal/curriculum?${qs}` : "/portal/curriculum");
}
