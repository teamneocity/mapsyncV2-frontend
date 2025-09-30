// src/pages/.../dateRangePicker.jsx
"use client";
import React from "react";
import { format } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";

export function DateRangePicker({
  value,
  onChange,
  placeholder = "Selecione o período",
  className = "",
}) {
  const start = value?.start ?? null;
  const end = value?.end ?? null;

  const label =
    start && end
      ? `${format(start, "dd/MM/yyyy")} → ${format(end, "dd/MM/yyyy")}`
      : placeholder;

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          className={`w-full justify-between bg-white px-3 ${className}`}
          style={{ height: 55 }}
        >
          <span
            className={`truncate ${
              start && end ? "text-gray-900" : "text-gray-500"
            }`}
          >
            {label}
          </span>
          <CalendarIcon className="ml-2 h-4 w-4 opacity-70" />
        </Button>
      </PopoverTrigger>

      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="range"
          numberOfMonths={2}
          selected={
            start && end ? { from: start, to: end } : { from: start, to: end }
          }
          onSelect={(range) => {
            // range: { from?: Date; to?: Date }
            onChange({
              start: range?.from ?? null,
              end: range?.to ?? null,
            });
          }}
          initialFocus
        />
      </PopoverContent>
    </Popover>
  );
}
