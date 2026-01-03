import ResetPasswordPage from "@/components/ResetPassword";
import { Suspense } from "react";


export default function ResetPassword(){
  return(
    <>
    <Suspense fallback={null}>
      <ResetPasswordPage />
    </Suspense>
    </>
)
}
