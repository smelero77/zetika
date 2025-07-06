import { z } from "zod"

export const ContactUsSchema = z.object({
  name: z
    .string()
    .min(1, "El nombre es requerido")
    .min(2, "El nombre debe tener al menos 2 caracteres")
    .max(50, "El nombre no puede exceder 50 caracteres"),
  
  email: z
    .string()
    .min(1, "El email es requerido")
    .email("Por favor, ingresa un email válido"),
  
  message: z
    .string()
    .min(1, "El mensaje es requerido")
    .min(10, "El mensaje debe tener al menos 10 caracteres")
    .max(1000, "El mensaje no puede exceder 1000 caracteres"),
})

export type ContactUsType = z.infer<typeof ContactUsSchema> 