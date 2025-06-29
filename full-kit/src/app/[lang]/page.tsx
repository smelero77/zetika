import { redirect } from "next/navigation"

export default function LangRootPage() {
  redirect("/en/sign-in")
  return null
}
