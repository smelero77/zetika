import { Slider } from "@/components/ui/slider"
import { Label } from "@/components/ui/label"

interface RangeFilterProps {
  minValue: number
  maxValue: number
  currentMin: number
  currentMax: number
  onMinChange: (value: number) => void
  onMaxChange: (value: number) => void
  step?: number
  formatValue?: (value: number) => string
}

export function RangeFilter({ 
  minValue, 
  maxValue, 
  currentMin, 
  currentMax, 
  onMinChange, 
  onMaxChange, 
  step = 1,
  formatValue = (value) => value.toString()
}: RangeFilterProps) {
  return (
    <div className="space-y-3 lg:space-y-4">
      <div className="space-y-1 lg:space-y-2">
        <Label className="text-xs lg:text-sm font-light">Mínimo: {formatValue(currentMin)}</Label>
        <Slider
          value={[currentMin]}
          onValueChange={([value]) => value !== undefined && onMinChange(value)}
          max={maxValue}
          min={minValue}
          step={step}
          className="w-full"
        />
      </div>
      <div className="space-y-1 lg:space-y-2">
        <Label className="text-xs lg:text-sm font-light">Máximo: {formatValue(currentMax)}</Label>
        <Slider
          value={[currentMax]}
          onValueChange={([value]) => value !== undefined && onMaxChange(value)}
          max={maxValue}
          min={minValue}
          step={step}
          className="w-full"
        />
      </div>
    </div>
  )
} 