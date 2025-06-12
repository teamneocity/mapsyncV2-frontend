import { clsx } from "clsx";
import { twMerge } from "tailwind-merge"

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}


export function getInicials(name) {
  const parts = name.split(" ");
  
  // Pega a primeira letra de cada parte, converte para maiúscula e junta
  const initials = parts.map(parte => parte.charAt(0).toUpperCase()).join("");
  
  return initials;
}

