import { redirect } from "next/navigation";
import { getUser } from "@/lib/session";
import VerifyEmailForm from "@/app/components/Forms/VerifyEmail/VerifyEmailForm";

export default async function VerifyEmailPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const { userId } = await getUser();

  if (!userId) {
    redirect(`/${locale}/login`);
  }

  return <VerifyEmailForm />;
}
