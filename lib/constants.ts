/**
 * Product categories — kept in sync with
 * `sanity/schemaTypes/shoe.ts` (`SHOE_CATEGORY_OPTIONS`).
 */
export const SHOE_CATEGORIES = [
  'رياضي',
  'كلاسيكي',
  'كاجوال',
  'نسائي',
  'أطفال',
] as const

export type ShoeCategory = (typeof SHOE_CATEGORIES)[number]

/** The "all categories" pseudo-option used by the storefront filter. */
export const ALL_CATEGORIES = 'الكل'

export const CATEGORY_FILTERS = [ALL_CATEGORIES, ...SHOE_CATEGORIES] as const

/** Every shoe size the platform supports, used to build the size filter. */
export const SHOE_SIZES = [36, 37, 38, 39, 40, 41, 42, 43, 44, 45] as const

/** Currency formatting for prices. */
export const CURRENCY = 'د.ل'

export function formatPrice(value: number): string {
  return `${new Intl.NumberFormat('ar-AE', {
    maximumFractionDigits: 2,
  }).format(value)} ${CURRENCY}`
}
