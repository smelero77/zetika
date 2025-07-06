import type { Metadata } from "next"

import { Register } from "@/components/auth/register"

export const metadata: Metadata = {
  title: "Crear Cuenta - Zetika",
  description: "Únete a Zetika y encuentra las mejores subvenciones públicas",
}

export default function SignUpPage() {
  return <Register />
} 