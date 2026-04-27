'use client'

import { logoutAction } from "@/actions/logout";

export default function LogoutButton() {
  return (
    <button
      onClick={() => logoutAction()}
      className="text-sm font-bold uppercase tracking-wider opacity-60 hover:opacity-100 transition-opacity"
    >
      Wyloguj się
    </button>
  );
}
