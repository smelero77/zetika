"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"

import type { ContactUsType } from "@/schemas/contact-us-schema"

import { ContactUsSchema } from "@/schemas/contact-us-schema"

import { toast } from "@/hooks/use-toast"
import { ButtonLoading } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"

export function ContactUsForm() {
  const form = useForm<ContactUsType>({
    resolver: zodResolver(ContactUsSchema),
    defaultValues: {
      name: "",
      email: "",
      message: "",
    },
  })

  const { isSubmitting } = form.formState

  async function onSubmit(_data: ContactUsType) {
    toast({
      title: "¡Éxito!",
      description: "Tu mensaje ha sido enviado correctamente. Te contactaremos pronto.",
    })
  }

  return (
    <Form {...form}>
      <Card asChild>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="grid gap-6 p-6 md:col-span-2"
        >
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nombre</FormLabel>
                <FormControl>
                  <Input type="text" placeholder="Juan Pérez" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
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
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="message"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Mensaje</FormLabel>
                <FormControl>
                  <Textarea 
                    className="min-h-[115px]" 
                    placeholder="Escribe tu mensaje aquí..."
                    {...field} 
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <ButtonLoading isLoading={isSubmitting} size="lg">
            Enviar
          </ButtonLoading>
        </form>
      </Card>
    </Form>
  )
} 