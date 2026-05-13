"use client";
import { usePathname } from "next/navigation";
import { FaBell, FaUser } from "react-icons/fa6";
import Link from "next/link";
import { useUser } from "@/app/context/UserContext";

export default function NavPanel() {
  const path = usePathname();
  const { user } = useUser();

  const pageName = path.split("/").filter(Boolean).pop();

  return (
    <>
      <section className="w-full flex flex-row justify-between p-4 px-10 border-b-2 border-(--primary)">
        <div className="w-1/5">
          <p className="text-xl font-bold tracking-wide">{pageName}</p>
        </div>
        <div className="w-2/5 flex flex-row items-center gap-4 relative">
          <Link href="/account/notifications" title="Notifications">
            <FaBell className="text-gray-600 text-xl hover:text-(--primary) transition-colors" />
          </Link>
          {/* User Avatar */}
          <div className="w-8 h-8 bg-gray-200 flex items-center justify-center overflow-hidden border border-gray-300">
            {user?.avatarUrl ? (
              <img src={user.avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
            ) : (
              <FaUser className="text-gray-600 w-5 h-5" />
            )}
          </div>
        </div>
      </section>
    </>
  );
}
