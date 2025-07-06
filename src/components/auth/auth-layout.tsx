"use client"

import Image from "next/image"
import Link from "next/link"

import { cn } from "@/lib/utils"

interface AuthProps extends React.ComponentProps<"div"> {
  imgSrc?: string
  imgClassName?: string
}

export function Auth({
  className,
  children,
  imgSrc,
  imgClassName,
  ...props
}: AuthProps) {
  return (
    <section
      className={cn(
        "container min-h-screen w-full flex justify-between px-0",
        className
      )}
      {...props}
    >
      <div className="flex-1 relative grid">
        <div className="absolute top-0 inset-x-0 flex justify-between items-center px-4 py-2.5">
          <Link
            href="/"
            className="flex text-foreground font-black z-50"
          >
            <span>Zetika</span>
          </Link>
        </div>
        <div className="max-w-[28rem] w-full m-auto px-6 py-12 space-y-6">
          {children}
        </div>
      </div>
      {imgSrc && <AuthImage imgSrc={imgSrc} className={cn("", imgClassName)} />}
    </section>
  )
}

interface AuthImageProps extends React.ComponentProps<"div"> {
  imgSrc: string
}

export function AuthImage({ className, imgSrc, ...props }: AuthImageProps) {
  return (
    <div
      className={cn(
        "basis-1/2 relative hidden min-h-screen bg-muted md:block",
        className
      )}
      {...props}
    >
      <Image
        src={imgSrc}
        alt="Image"
        fill
        sizes="(max-width: 1200px) 60vw, 38vw"
        priority
        className="object-cover"
      />
    </div>
  )
}

export function AuthHeader({ className, ...props }: React.ComponentProps<"div">) {
  return <div className={cn("space-y-2 text-center", className)} {...props} />
}

export function AuthTitle({ className, ...props }: React.ComponentProps<"h1">) {
  return (
    <h1
      className={cn(
        "text-2xl font-semibold leading-none tracking-tight",
        className
      )}
      {...props}
    />
  )
}

export function AuthDescription({ className, ...props }: React.ComponentProps<"p">) {
  return (
    <p className={cn("text-sm text-muted-foreground", className)} {...props} />
  )
}

export function AuthForm({ className, ...props }: React.ComponentProps<"div">) {
  return <div className={className} {...props} />
}

export function AuthFooter({ className, ...props }: React.ComponentProps<"div">) {
  return <div className={cn("grid gap-6", className)} {...props} />
} 