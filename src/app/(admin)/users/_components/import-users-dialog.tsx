"use client";
import { LiyonDialog, LiyonDialogHeader, LiyonDialogBody, LiyonDialogCloseButton } from "@/shared/components/liyon";
import { useT } from "@/shared/lib/i18n/client";
import { ImportUsersView } from "./import-users-view";
import type { RolePick } from "./types";

export function ImportUsersDialog({
  open,
  onOpenChange,
  roles,
  onSuccess,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  roles: RolePick[];
  onSuccess: () => void;
}) {
  const t = useT();

  return (
    <LiyonDialog open={open} onOpenChange={onOpenChange} wide className="!max-w-4xl !w-[94vw]">
      <LiyonDialogCloseButton label={t("common.close")} />
      <LiyonDialogHeader
        title={t("users.importTitle")}
        description={t("users.importDesc")}
      />
      <LiyonDialogBody className="pb-4">
        <ImportUsersView
          roles={roles}
          onSuccess={() => {
            onSuccess();
            onOpenChange(false);
          }}
          onCancel={() => onOpenChange(false)}
        />
      </LiyonDialogBody>
    </LiyonDialog>
  );
}
