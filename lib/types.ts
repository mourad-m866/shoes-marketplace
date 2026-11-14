/**
 * Shared, framework-agnostic types used across the storefront and the
 * seller dashboard. They intentionally mirror the shape returned by the
 * GROQ queries in `sanity/lib/queries.ts`.
 */

export type ShoeCategory = 'رياضي' | 'كلاسيكي' | 'كاجوال' | 'نسائي' | 'أطفال'

export interface Exhibition {
  _id: string
  storeName: string
  sellerName: string
  email?: string
  city: string
  phone: string
  description?: string
  logoRef?: string
}

export interface Shoe {
  _id: string
  title: string
  category: string
  price: number
  sizes?: number[]
  description?: string
  isAvailable: boolean
  imageRef?: string
  exhibitionId?: string
  exhibitionName?: string
  exhibitionCity?: string
}

/** Payload accepted by the "create shoe" server action. */
export interface CreateShoeInput {
  title: string
  category: string
  price: number
  sizes: number[]
  description: string
  isAvailable: boolean
  exhibitionId: string
  imageUrl?: string
}

/** Payload accepted by the "update shoe" server action. */
export interface UpdateShoeInput extends CreateShoeInput {
  id: string
}

export type ActionResult =
  | {status: 'success'; message: string; shoeId?: string}
  | {status: 'error'; message: string}

export type SellerActivationResult =
  | ActionResult
  | {
      status: 'setup'
      message: string
      suggestedSellerName?: string
      suggestedStoreName?: string
    }
