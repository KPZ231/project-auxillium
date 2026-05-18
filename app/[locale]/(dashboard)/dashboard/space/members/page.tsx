import { prisma } from "@/lib/prisma";
import { getActiveSpaceId } from "@/actions/space";
import { getUser } from "@/lib/session";
import { redirect } from "next/navigation";
import { checkPermission } from "@/lib/permissions";
import MembersClient from "./MembersClient";

export default async function MembersPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const { userId } = await getUser();
  const spaceId = await getActiveSpaceId();
  
  if (!userId) redirect(`/${locale}/login`);
  if (!spaceId) redirect(`/${locale}/dashboard`);

  const permission = await checkPermission(userId, spaceId, "read");
  if (!permission.allowed) {
    redirect(`/${locale}/dashboard`);
  }

  const members = await prisma.spaceMember.findMany({
    where: { spaceId },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          avatarUrl: true,
        }
      }
    },
    orderBy: { joinedAt: "desc" }
  });

  const invitations = await prisma.spaceInvitation.findMany({
    where: { spaceId, status: "PENDING" },
    orderBy: { createdAt: "desc" }
  });

  const canManageMembers = (await checkPermission(userId, spaceId, "manage_members")).allowed;
  const canInvite = (await checkPermission(userId, spaceId, "invite")).allowed;

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-h2 font-semibold text-zinc-900 mb-1">Członkowie zespołu</h1>
        <p className="text-body text-zinc-500">Zarządzaj dostępem do przestrzeni roboczej.</p>
      </div>
      
      <MembersClient 
        members={members} 
        invitations={invitations} 
        currentUserId={userId}
        spaceId={spaceId}
        canManageMembers={canManageMembers}
        canInvite={canInvite}
      />
    </div>
  );
}
