import { Suspense } from "react";
import ResetPasswordConfirm from "@/app/components/Forms/ResetPassword/ResetPasswordConfirm";

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div>Ładowanie...</div>}>
      <ResetPasswordConfirm />
    </Suspense>
  );
}
