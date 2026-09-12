"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useT } from "@/shared/lib/i18n/client";
import { ImportUsersView } from "../_components/import-users-view";
import type { RolePick } from "../_components/types";

export function ImportPageClient({ roles }: { roles: RolePick[] }) {
  const t = useT();
  const router = useRouter();

  return (
    <div className="space-y-6 max-w-5xl mx-auto py-2">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link href="/users">
            <Button variant="outline" size="icon" className="size-9 rounded-xl">
              <ArrowLeft className="size-4" />
              <span className="sr-only">{t("users.backToUsers")}</span>
            </Button>
          </Link>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-foreground flex items-center gap-2">
              <Users className="size-5 text-primary" />
              {t("users.importTitle")}
            </h1>
            <p className="text-xs text-muted-foreground mt-0.5">
              {t("users.importDesc")}
            </p>
          </div>
        </div>

        <Link href="/users">
          <Button variant="ghost" size="sm" className="gap-1.5 text-xs text-muted-foreground">
            {t("users.backToUsers")}
          </Button>
        </Link>
      </div>

      <div className="p-6 bg-card rounded-2xl border border-border/80 shadow-xs">
        <ImportUsersView
          roles={roles}
          onSuccess={() => {
            router.push("/users");
          }}
          onCancel={() => {
            router.push("/users");
          }}
        />
      </div>
    </div>
  );
}
