import { getSession } from "@/lib/session";
import { redirect } from "next/navigation";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export default async function ProtectedRoute({ children }: ProtectedRouteProps) {
  const session = await getSession();

  if (!session) {
    redirect("/login");
  }

  return <>{children}</>;
}
