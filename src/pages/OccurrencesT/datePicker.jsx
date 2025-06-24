import * as React from "react";
import CalendarIcon from "@/assets/icons/calendar-icon.svg?react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { format } from "date-fns";

export function DatePicker({ date, onChange, className }) {
  const [open, setOpen] = React.useState(false);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          className={`${className} w-full justify-between text-left font-normal bg-white hover:bg-gray-200`}
        >
          {date ? (
            format(date, "dd/MM/yyyy")
          ) : (
            <span className="text-[#787891]">Escolha uma data</span>
          )}
          <CalendarIcon className="opacity-40" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0">
        <Calendar
          mode="single"
          selected={date}
          onSelect={(selected) => {
            if (selected) {
              onChange(selected); // Atualiza o estado no pai
              setOpen(false);     // Fecha o popover
            }
          }}
        />
      </PopoverContent>
    </Popover>
  );
}
