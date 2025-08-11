import { clsx } from "clsx";
import { twMerge } from "tailwind-merge"

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}


export function getInicials(name = "") {
  if (!name) return "";
  
  const parts = name.trim().split(/\s+/); // quebra e remove espaços extras
  
  if (parts.length === 1) {
    // Se só tem um nome, pega só a primeira letra
    return parts[0].charAt(0).toUpperCase();
  }

  // Pega primeira letra do primeiro nome e do último nome
  const first = parts[0].charAt(0).toUpperCase();
  const last = parts[parts.length - 1].charAt(0).toUpperCase();

  return first + last;
}


