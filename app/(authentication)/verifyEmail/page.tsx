import { Suspense } from "react";
import VerifyEmailPage from "@/components/VerifyEmail";


export default function VerifyEmail(){
  return(
    <Suspense fallback={<div>Loading...</div>}>
      <VerifyEmailPage/>
    </Suspense>
  )
}
