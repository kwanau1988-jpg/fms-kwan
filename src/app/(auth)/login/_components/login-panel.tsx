"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useT, useLocale } from "@/shared/lib/i18n/client";
import { getTenantBrandingAction } from "@/features/identity/actions";
import { BrandMarkIcon } from "../../_components/icons";
import { PasswordLoginForm } from "./password-login-form";
import { OAuthButtons } from "./oauth-buttons";

export function LoginPanel({ providers }: { providers: ("google" | "microsoft")[] }) {
  const t = useT();
  const locale = useLocale();
  const error = useSearchParams().get("error");
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
    <div className="auth-box">
      <div className="auth-mark">
        <i>
          {branding?.logoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={branding.logoUrl} alt={brandName} className="w-full h-full object-contain p-0.5 rounded-sm" />
          ) : (
            <BrandMarkIcon />
          )}
        </i>
        <div><h1 className="truncate max-w-[240px]" title={brandName}>{brandName}</h1></div>
      </div>
      <div className="auth-head"><h2>{t("auth.welcome")}</h2><p>{t("auth.login.subtitle")}</p></div>
      {error === "NoAccount" && <p className="err" role="alert">{t("auth.oauthNoAccount")}</p>}
      <PasswordLoginForm />
      <div className="auth-foot"><p><Link href="/forgot-password">{t("auth.forgot")}</Link></p></div>
      {providers.length > 0 && (
        <>
          <div className="or"><span>{t("auth.orContinueWith")}</span></div>
          <OAuthButtons providers={providers} />
        </>
      )}
    </div>
  );
}
