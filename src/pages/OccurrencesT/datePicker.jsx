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
  return (
    <Popover>
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
        <Calendar mode="single" selected={date} onSelect={onChange} />
      </PopoverContent>
    </Popover>
  );
}
