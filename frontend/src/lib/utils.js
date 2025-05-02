// frontend/src/lib/utils.js

/**
 * Utility function to conditionally join class names together
 * Used by shadcn/ui components for conditional styling
 */
export function cn(...classes) {
  return classes.filter(Boolean).join(" ");
}