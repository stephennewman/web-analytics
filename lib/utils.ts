import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Safely parse JSON from fetch response
 * Handles cases where API returns error pages instead of JSON
 */
export async function safeJsonParse(response: Response) {
  const text = await response.text();
  try {
    return JSON.parse(text);
  } catch (e) {
    console.error('Failed to parse JSON:', text.substring(0, 100));
    throw new Error(`API returned non-JSON response: ${text.substring(0, 100)}`);
  }
}
