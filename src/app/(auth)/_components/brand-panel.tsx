"use client";
import { useEffect, useState } from "react";
import { useT, useLocale } from "@/shared/lib/i18n/client";
import { getTenantBrandingAction } from "@/features/identity/actions";
import { BrandMarkIcon } from "./icons";

export function BrandPanel() {
  const t = useT();
  const locale = useLocale();
  const [branding, setBranding] = useState<{ logoUrl: string | null; nameTh: string; nameEn: string } | null>(null);

  useEffect(() => {
    getTenantBrandingAction().then((res) => {
      if (res.ok) setBranding(res.data);
    });
  }, []);

  const brandName = locale === "en"
    ? (branding?.nameEn || branding?.nameTh || t("app.name"))
    : (branding?.nameTh || branding?.nameEn || t("app.name"));

  return (
    <aside className="brandside">
      <div className="mark">
        <i>
          {branding?.logoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={branding.logoUrl} alt={brandName} className="w-full h-full object-contain p-0.5 rounded-sm" />
          ) : (
            <BrandMarkIcon />
          )}
        </i>
        <span className="truncate max-w-[280px]" title={brandName}>{brandName}</span>
      </div>
      <div className="lead">
        <div className="eyebrow"><span>{t("auth.brand.eyebrow")}</span></div>
        <h1>{t("auth.brand.title")}</h1>
        <p>{t("auth.brand.subtitle")}</p>
      </div>
      <p className="foot">{t("app.tagline")}</p>
    </aside>
  );
}
