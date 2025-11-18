// src/components/selectField.jsx
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export function SelectField({
  label,
  options = [],
  value,
  onChange,
  placeholder = "Selecione...",
  className = "",
}) {
  // aceita tanto {id, name} quanto {value, label}
  const safeOptions = (options || [])
    .map((opt, idx) => {
      const val = opt?.value ?? opt?.id;
      const lab = opt?.label ?? opt?.name;
      if (val == null || lab == null) return null;
      return {
        key: opt?.id ?? opt?.value ?? String(idx),
        value: String(val),
        label: String(lab),
      };
    })
    .filter(Boolean);

  return (
    <div className="space-y-1">
      {label ? (
        <p className="text-sm font-medium text-gray-600">{label}</p>
      ) : null}

      <Select value={value ?? ""} onValueChange={onChange}>
        <SelectTrigger
          className={`w-full h-[44px] text-[#787891] bg-white ${className}`}
        >
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          {safeOptions.map((opt) => (
            <SelectItem
              key={opt.key}
              value={opt.value}
              className="text-left justify-start"
            >
              {opt.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
