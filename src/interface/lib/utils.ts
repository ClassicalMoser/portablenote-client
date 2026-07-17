import { clsx } from 'clsx';
import type { ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

/** Class-name merger for zaidan/Tailwind primitives. Presentation-only. */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}
