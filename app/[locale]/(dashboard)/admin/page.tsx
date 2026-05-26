import { redirect } from "next/navigation";
import { verifyAdminSession } from "@/actions/admin-auth";
import { getAdminUsers } from "@/actions/admin-users";
import AdminDashboardClient from "./AdminDashboardClient";

export default async function AdminPage() {
  const { authenticated } = await verifyAdminSession();
  
  if (!authenticated) {
    redirect("/admin/login");
  }

  const { users, total, pages } = await getAdminUsers(1, 20, "");

  return (
    <AdminDashboardClient 
      initialUsers={users}
      initialTotal={total}
      initialPages={pages}
    />
  );
}