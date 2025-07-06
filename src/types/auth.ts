import type { z } from "zod"
import type { SignInSchema } from "@/schemas/sign-in-schema"
import type { RegisterSchema } from "@/schemas/register-schema"

export type SignInFormType = z.infer<typeof SignInSchema>
export type RegisterFormType = z.infer<typeof RegisterSchema> 