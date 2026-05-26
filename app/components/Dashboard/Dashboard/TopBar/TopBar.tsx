"use client";

import { useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import Image from "next/image";
import { Bell, Settings, User, LogOut } from "lucide-react";
import { Breadcrumbs } from "@/app/components/UI/Breadcrumbs";
import ProfileModal from "../ProfileModal/ProfileModal";
import { logoutAction } from "@/actions/logout";
import { useUser } from "@/app/context/UserContext";
import { NotificationDropdown } from "./NotificationDropdown";
import { useTranslation } from "@/app/context/TranslationContext";

interface InitialUser {
  name: string | null;
  avatarUrl: string | null;
}

interface TopBarProps {
  initialUser?: InitialUser | null;
}

export default function TopBar({ initialUser }: TopBarProps) {
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const { t } = useTranslation();

  // user from context (updates after avatar change), falls back to SSR-provided initialUser
  const { user } = useUser();
  const avatarUrl = user?.avatarUrl ?? initialUser?.avatarUrl ?? null;
  const displayName = user?.name ?? initialUser?.name ?? null;

  const handleSettingsClick = () => {
    const locale = pathname.split("/")[1] || "en";
    router.push(`/${locale}/settings`);
  };

  const handleLogout = async () => {
    await logoutAction();
  };

  return (
    <>
      <header className="h-14 w-full flex items-center justify-between px-8 border-b border-gray-200 bg-white sticky top-0 z-40">
        <div className="flex items-center">
          <Breadcrumbs />
        </div>

        <div className="flex items-center gap-6">
          <NotificationDropdown />

          {/* User Avatar Dropdown */}
          <div className="relative">
            <button
              onMouseEnter={() => setIsDropdownOpen(true)}
              onMouseLeave={() => setIsDropdownOpen(false)}
              className="w-8 h-8 bg-black flex items-center justify-center cursor-pointer hover:bg-gray-800 transition-colors overflow-hidden"
              title={displayName ?? "Profile"}
            >
              {avatarUrl ? (
                <div className="relative w-full h-full">
                  <Image
                    src={avatarUrl}
                    alt={displayName ?? "User avatar"}
                    fill
                    className="object-cover"
                  />
                </div>
              ) : (
                <User className="w-4 h-4 text-white shrink-0" />
              )}
            </button>

            {isDropdownOpen && (
              <div
                onMouseEnter={() => setIsDropdownOpen(true)}
                onMouseLeave={() => setIsDropdownOpen(false)}
                className="absolute right-0 top-full w-52 bg-white border border-black z-9999"
              >
                {/* User info header */}
                {displayName && (
                  <div className="px-4 py-3 border-b border-[#F4F4F5]">
                    <p className="text-xs font-bold text-[#0A0A0A] truncate">{displayName}</p>
                  </div>
                )}

                <button
                  onClick={() => {
                    setIsProfileOpen(true);
                    setIsDropdownOpen(false);
                  }}
                  className="w-full flex items-center gap-3 px-4 py-3 text-black hover:bg-black hover:text-white transition-colors duration-150 text-left"
                >
                  <User className="w-4 h-4 shrink-0" />
                  <span className="text-sm font-medium">{t("dashboard:nav.view_profile")}</span>
                </button>

                <button
                  onClick={() => {
                    handleSettingsClick();
                    setIsDropdownOpen(false);
                  }}
                  className="w-full flex items-center gap-3 px-4 py-3 text-black hover:bg-black hover:text-white transition-colors duration-150 text-left"
                >
                  <Settings className="w-4 h-4 shrink-0" />
                  <span className="text-sm font-medium">{t("dashboard:nav.settings")}</span>
                </button>

                <div className="border-t border-black" />

                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-4 py-3 text-black hover:bg-red-600 hover:text-white transition-colors duration-150 text-left"
                >
                  <LogOut className="w-4 h-4 shrink-0" />
                  <span className="text-sm font-medium">{t("dashboard:nav.logout")}</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      <ProfileModal
        isOpen={isProfileOpen}
        onClose={() => setIsProfileOpen(false)}
      />
    </>
  );
}
