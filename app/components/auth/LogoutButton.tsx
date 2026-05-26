'use client'

import { logoutAction } from "@/actions/logout";
import { useTranslation } from "@/app/context/TranslationContext";

export default function LogoutButton() {
  const { t } = useTranslation();
  return (
    <button
      onClick={() => logoutAction()}
      className="text-sm font-bold uppercase tracking-wider opacity-60 hover:opacity-100 transition-opacity"
    >
      {t("common:buttons.logout")}
    </button>
  );
}
