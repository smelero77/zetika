import { oauthLinksData } from "@/data/oauth-links"

import { buttonVariants } from "@/components/ui/button"

export function OAuthLinks() {
  return (
    <div className="flex justify-center gap-2">
      {oauthLinksData.map((link) => (
        <a
          key={link.label}
          href={link.href}
          className={buttonVariants({ variant: "outline", size: "icon" })}
          aria-label={link.label}
        >
          <link.icon className="size-4" />
        </a>
      ))}
    </div>
  )
} 