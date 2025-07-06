import {
  Auth,
  AuthDescription,
  AuthForm,
  AuthHeader,
  AuthTitle,
} from "./auth-layout"
import { RegisterForm } from "./register-form"

export function Register() {
  return (
    <Auth
      imgSrc="/images/illustrations/misc/welcome.svg"
    >
      <AuthHeader>
        <AuthTitle>Crear Cuenta</AuthTitle>
        <AuthDescription>
          Ingresa tu información para crear una cuenta
        </AuthDescription>
      </AuthHeader>
      <AuthForm>
        <RegisterForm />
      </AuthForm>
    </Auth>
  )
} 