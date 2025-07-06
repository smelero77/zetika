import { SiFacebook, SiGithub, SiGoogle, SiX } from "react-icons/si"

export interface OAuthLinkType {
  href: string
  label: string
  icon: React.ComponentType<{ className?: string }>
}

export const oauthLinksData: OAuthLinkType[] = [
  { href: "/", label: "Facebook", icon: SiFacebook },
  { href: "/", label: "GitHub", icon: SiGithub },
  { href: "/", label: "Google", icon: SiGoogle },
  { href: "/", label: "X", icon: SiX },
] 