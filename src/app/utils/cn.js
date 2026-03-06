/** Add clsx + tailwind-merge later for conditional/conflict merging if needed. */
export function cn(...classes) {
  return classes.filter(Boolean).join(' ');
}
