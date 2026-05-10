import WorkloadDashboard from "@/app/components/Dashboard/Space/Workload/WorkloadDashboard";
import { getActiveSpaceId, getActiveSpace } from "@/actions/space";
import { redirect } from "next/navigation";

export default async function WorkloadPage() {
  const spaceId = await getActiveSpaceId();
  
  if (!spaceId) {
    redirect("/dashboard/space/settings");
  }

  const space = await getActiveSpace();
  const spaceName = space?.spaceName || "Space";

  return <WorkloadDashboard spaceId={spaceId} spaceName={spaceName} />;
}
