import LoginForm from "@/app/components/Forms/LoginForm/LoginForm";
import { Suspense } from "react";

export default function Login() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <LoginForm />
    </Suspense>
  );
}