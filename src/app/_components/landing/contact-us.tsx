import { ContactUsForm } from "./contact-us-form"
import { ContactUsInfo } from "./contact-us-info"

export function ContactUs() {
  return (
    <section id="contact" className="container grid gap-8">
      <div className="text-center mx-auto space-y-1.5">
        <h2 className="text-3xl md:text-4xl font-semibold">Contáctanos</h2>
        <p className="max-w-prose text-sm text-muted-foreground">
          ¿Tienes preguntas? Estamos aquí para ayudarte. Ponte en contacto con nuestro equipo.
        </p>
      </div>
      <div className="grid gap-8 lg:grid-cols-2">
        <ContactUsForm />
        <ContactUsInfo />
      </div>
    </section>
  )
} 