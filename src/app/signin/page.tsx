import type { Metadata } from "next"

import { SignIn } from "@/components/auth/sign-in"

export const metadata: Metadata = {
  title: "Iniciar Sesión - Zetika",
  description: "Accede a tu cuenta de Zetika",
}

export default function SignInPage() {
  return <SignIn />
} 