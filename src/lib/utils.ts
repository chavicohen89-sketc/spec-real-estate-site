import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/** מיזוג מחלקות Tailwind. משמש את רכיבי shadcn בממשק הניהול */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
