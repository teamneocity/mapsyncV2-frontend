"use client";

import * as React from "react";
import { format } from "date-fns";
import CalendarIcon from "@/assets/icons/calendar-icon.svg?react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

export function DateRange({ selectedRange, onDateRangeChange }) {
  const [date, setDate] = React.useState(selectedRange);

  // Atualiza o componente quando o filtro externo mudar
  React.useEffect(() => {
    setDate(selectedRange);
  }, [selectedRange]);

  // Envia a seleção para o pai sempre que mudar internamente
  React.useEffect(() => {
    if (onDateRangeChange) {
      onDateRangeChange(date);
    }
  }, [date, onDateRangeChange]);

  return (
    <div className="grid gap-2">
      <Popover>
        <PopoverTrigger asChild>
          <Button
            id="date"
            variant="outline"
            className="w-[250px] rounded-xl justify-between text-left font-normal h-12 !text-[#4B4B62]"
          >
            {date?.from ? (
              date.to ? (
                <>
                  {format(date.from, "dd/MM/yyyy")} -{" "}
                  {format(date.to, "dd/MM/yyyy")}
                </>
              ) : (
                format(date.from, "dd/MM/yyyy")
              )
            ) : (
              <span className="text-[#4B4B62] font-inter">Selecione a Data</span>
            )}
            <CalendarIcon className="mr-2" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            initialFocus
            mode="range"
            defaultMonth={date?.from}
            selected={date}
            onSelect={setDate}
            numberOfMonths={2}
          />
        </PopoverContent>
      </Popover>
    </div>
  );
}
