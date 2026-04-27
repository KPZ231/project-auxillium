"use client";

import { usePathname } from "next/navigation";
import { FaGear, FaBell, FaUser } from "react-icons/fa6";
import Link from "next/link";

export default function NavPanel() {
  const path = usePathname();
  const pageName = path.split("/").filter(Boolean).pop();

  return (
    <>
      <section className="w-full flex flex-row justify-between p-4 px-10 border-b-2 border-(--primary)">
        <div className="w-1/5">
          <p className="text-xl font-bold tracking-wide">{pageName}</p>
        </div>
        <div className="w-2/5 flex flex-row gap-4">
          <Link href="/account/settings" title="Settings">
            <FaGear className="text-gray-600 text-xl hover:text-(--primary) transition-colors" />
          </Link>
          <Link href="/account/notifications" title="Notifications">
            <FaBell className="text-gray-600 text-xl hover:text-(--primary) transition-colors" />
          </Link>
          <Link href="/account" title="Account">
            <FaUser className="text-gray-600 text-xl hover:text-(--primary) transition-colors" />
          </Link>
        </div>
      </section>
    </>
  );
}
