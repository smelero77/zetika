import { SectionWrapper } from "../../shared/section-wrapper"
import { CtaContent } from "./cta-content"

export function ReadyToBuildCTA() {
  return (
    <SectionWrapper className="bg-muted/40" container={false}>
      <div className="container mx-auto">
        <CtaContent />
      </div>
    </SectionWrapper>
  )
} 