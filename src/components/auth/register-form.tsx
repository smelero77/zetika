"use client"

import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"

import type { RegisterFormType } from "@/types/auth"

import { RegisterSchema } from "@/schemas/register-schema"

import { toast } from "@/hooks/use-toast"
import { ButtonLoading } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { SeparatorWithText } from "@/components/ui/separator"
import { OAuthLinks } from "./oauth-links"

export function RegisterForm() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const form = useForm<RegisterFormType>({
    resolver: zodResolver(RegisterSchema),
  })

  const { isSubmitting, isDirty } = form.formState
  const isDisabled = isSubmitting || !isDirty

  async function onSubmit(data: RegisterFormType) {
    const { firstName, lastName, email, password } = data

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          firstName,
          lastName,
          email,
          password,
        }),
      })

      if (res && res.status >= 400) {
        const {
          issues,
          message,
        }: {
          issues?: { path: (keyof RegisterFormType)[]; message: string }[]
          message?: string
        } = await res.json()

        if (!issues) throw new Error(message ?? "An unknown error occurred.")

        // Set errors in React Hook Form based on server response
        issues.forEach((issue) => {
          const field = issue.path[0] as keyof RegisterFormType
          if (field) {
            form.setError(field, { type: "manual", message: issue.message })
          }
        })
      } else {
        toast({ 
          title: "Registro exitoso",
          description: "Tu cuenta ha sido creada correctamente"
        })
        
        router.push("/signin")
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error en el registro",
        description: error instanceof Error ? error.message : undefined,
      })
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-6">
        <div className="grid gap-2">
          <div className="grid grid-cols-2 gap-2">
            <FormField
              control={form.control}
              name="firstName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nombre</FormLabel>
                  <FormControl>
                    <Input 
                      type="text" 
                      placeholder="Juan" 
                      autoComplete="given-name"
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="lastName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Apellido</FormLabel>
                  <FormControl>
                    <Input 
                      type="text" 
                      placeholder="Pérez" 
                      autoComplete="family-name"
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input
                    type="email"
                    placeholder="nombre@ejemplo.com"
                    autoComplete="email"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Contraseña</FormLabel>
                <FormControl>
                  <Input 
                    type="password" 
                    autoComplete="new-password"
                    {...field} 
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <ButtonLoading isLoading={isSubmitting} disabled={isDisabled}>
          Crear Cuenta con Email
        </ButtonLoading>
        <div className="-mt-4 text-center text-sm">
          ¿Ya tienes una cuenta?{" "}
          <Link
            href="/signin"
            className="underline"
          >
            Inicia sesión
          </Link>
        </div>
        <SeparatorWithText>O continúa con</SeparatorWithText>
        <OAuthLinks />
      </form>
    </Form>
  )
} 