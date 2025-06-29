import { z } from "zod"

console.log("BASE_URL:", process.env.BASE_URL)

const envSchema = z.object({
  NODE_ENV: z
    .enum(["development", "test", "production"])
    .default("development"),
  NEXTAUTH_URL: z.string().url(),
  BASE_URL: z.string().url(),
  NEXTAUTH_SECRET: z.string().min(1),
  DATABASE_URL: z.string().url().optional(),
  // Agrega aquí otras variables que quieras validar
})

const env = envSchema.safeParse(process.env)

if (!env.success) {
  // Muestra todos los errores de validación y detiene la app
  console.error("❌ Error en las variables de entorno:")
  console.error(env.error.format())
  throw new Error(
    "Variables de entorno inválidas. Corrige el .env antes de continuar."
  )
}

export const validatedEnv = env.data
