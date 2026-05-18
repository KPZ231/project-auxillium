import { prisma } from "@/lib/prisma";
import { getUser } from "@/lib/session";
import { redirect } from "next/navigation";
import { acceptInvitation } from "@/actions/invitations";
import Link from "next/link";
import { revalidatePath } from "next/cache";

export default async function InvitePage({
  params,
}: {
  params: Promise<{ locale: string; token: string }>;
}) {
  const { locale, token } = await params;
  const { userId } = await getUser();

  // Check the invitation status
  const invitation = await prisma.spaceInvitation.findUnique({
    where: { inviteToken: token },
    include: {
      space: true,
      createdBy: true,
    },
  });

  if (!invitation) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-zinc-50 p-4">
        <div className="w-full max-w-md bg-white p-8 border border-zinc-200">
          <h1 className="text-h3 font-semibold text-zinc-900 mb-2">Błąd</h1>
          <p className="text-body text-zinc-600">
            Zaproszenie nie istnieje lub zostało usunięte.
          </p>
        </div>
      </div>
    );
  }

  if (invitation.status !== "PENDING" || new Date() > invitation.expiresAt) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-zinc-50 p-4">
        <div className="w-full max-w-md bg-white p-8 border border-zinc-200">
          <h1 className="text-h3 font-semibold text-zinc-900 mb-2">Zaproszenie nieaktywne</h1>
          <p className="text-body text-zinc-600">
            To zaproszenie wygasło lub zostało już wykorzystane.
          </p>
        </div>
      </div>
    );
  }

  // If user is not logged in, redirect them to login with a callback
  if (!userId) {
    const callbackUrl = encodeURIComponent(`/${locale}/invite/${token}`);
    redirect(`/${locale}/login?callbackUrl=${callbackUrl}`);
  }

  const handleAccept = async () => {
    "use server";
    const result = await acceptInvitation(token);
    
    if (result.error) {
      // W normalnych warunkach zrobilibyśmy tu error state, ale w server action możemy rzucić wyjątek 
      // lub użyć redirectu do strony z błędem.
      console.error(result.error);
    } else {
      revalidatePath("/dashboard");
      redirect(`/${locale}/dashboard`);
    }
  };

  return (
    <div className="flex h-screen w-full items-center justify-center bg-zinc-50 p-4">
      <div className="w-full max-w-md bg-white p-8 border border-zinc-200 text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center bg-zinc-100 rounded-none mb-6">
          <span className="text-2xl font-semibold text-zinc-900">
            {invitation.space.spaceName.charAt(0).toUpperCase()}
          </span>
        </div>
        <h1 className="text-h3 font-semibold text-zinc-900 mb-2">
          Zaproszenie do przestrzeni
        </h1>
        <p className="text-body text-zinc-600 mb-8">
          Użytkownik <span className="font-semibold text-zinc-900">{invitation.createdBy.name || invitation.createdBy.email}</span> zaprasza Cię do dołączenia do przestrzeni <span className="font-semibold text-zinc-900">{invitation.space.spaceName}</span> w roli {invitation.role}.
        </p>

        <form action={handleAccept}>
          <button type="submit" className="w-full flex items-center justify-center rounded-none bg-zinc-900 text-zinc-50 hover:bg-zinc-800 h-12 text-sm font-medium mb-3">
            Akceptuj zaproszenie
          </button>
        </form>
        <Link href={`/${locale}/dashboard`} className="text-sm text-zinc-500 hover:text-zinc-900 transition-colors">
          Anuluj i wróć do panelu
        </Link>
      </div>
    </div>
  );
}
