import {
  Auth,
  AuthDescription,
  AuthForm,
  AuthHeader,
  AuthTitle,
} from "./auth-layout"
import { SignInForm } from "./sign-in-form"

export function SignIn() {
  return (
    <Auth
      imgSrc="/images/illustrations/misc/welcome.svg"
    >
      <AuthHeader>
        <AuthTitle>Iniciar Sesión</AuthTitle>
        <AuthDescription>
          Ingresa tu email para acceder a tu cuenta
        </AuthDescription>
      </AuthHeader>
      <AuthForm>
        <SignInForm />
      </AuthForm>
    </Auth>
  )
} 