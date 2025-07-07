import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"

interface CheckboxFilterProps {
  options: string[]
  selectedValues: string[]
  onToggle: (value: string) => void
}

export function CheckboxFilter({ options, selectedValues, onToggle }: CheckboxFilterProps) {
  return (
    <>
      {options.map((option) => (
        <div key={option} className="flex items-center space-x-2">
          <Checkbox
            id={option}
            checked={selectedValues?.includes(option)}
            onCheckedChange={() => onToggle(option)}
          />
          <Label htmlFor={option} className="text-xs lg:text-sm leading-tight font-light">
            {option}
          </Label>
        </div>
      ))}
    </>
  )
} 