import { NextRequest, NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import { z } from "zod"

import { db } from "@/lib/prisma"
import { RegisterSchema } from "@/schemas/register-schema"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { firstName, lastName, email, password } = RegisterSchema.parse(body)

    // Verificar si el usuario ya existe
    const existingUser = await db.user.findFirst({
      where: {
        email,
      },
    })

    if (existingUser) {
      return NextResponse.json(
        { message: "El email o nombre de usuario ya está en uso" },
        { status: 400 }
      )
    }

    // Encriptar la contraseña
    const hashedPassword = await bcrypt.hash(password, 12)

    // Crear el usuario
    await db.user.create({
      data: {
        firstName,
        lastName,
        email,
        password: hashedPassword,
        name: `${firstName} ${lastName}`,
      },
    })

    return NextResponse.json(
      { message: "Usuario creado exitosamente" },
      { status: 201 }
    )
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { message: "Datos inválidos", issues: error.issues },
        { status: 400 }
      )
    }

    console.error("Error en registro:", error)
    return NextResponse.json(
      { message: "Error interno del servidor" },
      { status: 500 }
    )
  }
} 