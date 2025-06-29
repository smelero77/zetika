import { PrismaAdapter } from "@auth/prisma-adapter"

import type { NextAuthOptions } from "next-auth"
import type { Adapter } from "next-auth/adapters"

import { db } from "@/lib/prisma"

import CredentialsProvider from "next-auth/providers/credentials"

// Extend NextAuth's Session and User interfaces to include custom properties
declare module "next-auth" {
  interface Session {
    user: {
      id: string
      email: string | null
      name: string | undefined
      avatar: string | null
    }
  }

  interface User {
    id: string
    email: string | null
    name: string | undefined
    avatar: string | null
  }
}
declare module "next-auth/jwt" {
  interface JWT {
    id: string
    email: string | null
    name: string | undefined
    avatar: string | null
  }
}

// Configuration for NextAuth with custom adapters and providers
// NextAuth.js documentation: https://next-auth.js.org/getting-started/introduction
export const authOptions: NextAuthOptions = {
  // Use Prisma adapter for database interaction
  // More info: https://next-auth.js.org/getting-started/adapter
  adapter: PrismaAdapter(db) as Adapter,
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { type: "email" },
        password: { type: "password" },
      },
      // Custom authorize function to validate user credentials
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null
        }
        // Busca el usuario en la base de datos
        const user = await db.user.findUnique({
          where: { email: credentials.email.toLowerCase() },
        })
        if (!user) return null
        // Aquí podrías agregar validación de contraseña con bcrypt si lo deseas
        // if (!(await bcrypt.compare(credentials.password, user.password))) return null
        // Por ahora acepta cualquier contraseña si el usuario existe
        return {
          id: user.id,
          email: user.email,
          name: user.name ?? undefined,
          avatar: user.image ?? null,
        }
      },
    }),
  ],
  pages: {
    signIn: "/sign-in", // Página personalizada de login
  },
  session: {
    strategy: "jwt", // Use JWT strategy for sessions
    maxAge: 30 * 24 * 60 * 60, // Set session expiration to 30 days
    // More info on session strategies: https://next-auth.js.org/getting-started/options#session
  },
  callbacks: {
    // Callback to add custom user properties to JWT
    // Learn more: https://next-auth.js.org/configuration/callbacks#jwt-callback
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.name = user.name
        token.avatar = user.avatar
        token.email = user.email
      }
      return token
    },
    // Callback to include JWT properties in the session object
    // Learn more: https://next-auth.js.org/configuration/callbacks#session-callback
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id
        session.user.name = token.name
        session.user.avatar = token.avatar
        session.user.email = token.email
      }
      return session
    },
    async redirect({ url, baseUrl }) {
      // Siempre redirige al dashboard tras login correcto
      return "/dashboard"
    },
  },
  debug: false, // Enable debug mode to see more information
}
