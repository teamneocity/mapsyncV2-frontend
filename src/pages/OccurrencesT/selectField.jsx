import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";


export function SelectField({ label, options, value, onChange, placeholder = "Selecione..." }) {
  return (
    <div className="space-y-1">
      <p className="text-sm font-medium text-gray-600">{label}</p>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger className="w-full text-[#787891] h-[55px] bg-white border-none">
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          {options.map((option) => (
            <SelectItem key={option.id} value={option.id.toString()}>
              {option.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
