import { coreBenefitsData } from "./_data/core-benefits"

export function CoreBenefitsList() {
  return (
    <div className="grid gap-8 md:grid-cols-3">
      {coreBenefitsData.map((benefit, idx) => (
        <div key={idx} className="flex flex-col items-center text-center gap-4">
          {benefit.images && benefit.images[0] && (
            <img src={benefit.images[0]} alt="" className="h-32 w-auto mb-2" />
          )}
          <h3 className="text-xl font-semibold">{benefit.title}</h3>
          <p className="text-muted-foreground text-sm mb-2">{benefit.description}</p>
          <ul className="text-sm text-muted-foreground list-disc list-inside space-y-1">
            {benefit.points?.map((point, i) => (
              <li key={i}>{point}</li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  )
} 