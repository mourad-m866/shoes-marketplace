import { defineQuery } from 'next-sanity'

/**
 * All exhibitions, ordered by store name.
 *
 * `logoRef` / `imageRef` project the raw Sanity asset id so the frontend can
 * build optimised CDN URLs with `@sanity/image-url`.
 */
export const exhibitionsQuery = defineQuery(`
  *[_type == "exhibition"] | order(storeName asc) {
    _id,
    storeName,
    sellerName,
    city,
    phone,
    description,
    "logoRef": logo.asset._ref
  }
`)

/**
 * All shoes with their exhibition resolved.
 */
export const shoesQuery = defineQuery(`
  *[_type == "shoe"] | order(_createdAt desc) {
    _id,
    title,
    category,
    price,
    sizes,
    description,
    isAvailable,
    "imageRef": image.asset._ref,
    "exhibitionId": exhibition._ref,
    "exhibitionName": exhibition->storeName,
    "exhibitionCity": exhibition->city
  }
`)

export const sellerExhibitionByCodeQuery = defineQuery(`
  *[_type == "exhibition" && isApproved == true && accessCode == $accessCodeHash][0...2] {
    _id,
    storeName,
    sellerName,
    city,
    phone,
    description,
    "logoRef": logo.asset._ref
  }
`)

export const approvedActivationRequestQuery = defineQuery(`
  *[_type == "activationRequest" && status == "approved" && phone == $phone && accessCode == $accessCode][0...2] {
    _id,
    _rev,
    phone,
    sellerName,
    storeName,
    accessCode,
    "exhibitionId": exhibition._ref
  }
`)

export const sellerExhibitionByActivationRequestQuery = defineQuery(`
  *[_type == "exhibition" && activationRequest._ref == $requestId && isApproved == true][0] {
    _id,
    storeName,
    sellerName,
    city,
    phone,
    description,
    "logoRef": logo.asset._ref
  }
`)

export const approvedSellerExhibitionQuery = defineQuery(`
  *[_type == "exhibition" && _id == $exhibitionId && isApproved == true][0] {
    _id,
    storeName,
    sellerName,
    city,
    phone,
    description,
    "logoRef": logo.asset._ref
  }
`)

export const sellerShoesQuery = defineQuery(`
  *[_type == "shoe" && exhibition._ref == $exhibitionId] | order(_createdAt desc) {
    _id,
    title,
    category,
    price,
    sizes,
    description,
    isAvailable,
    "imageRef": image.asset._ref,
    "exhibitionId": exhibition._ref,
    "exhibitionName": exhibition->storeName,
    "exhibitionCity": exhibition->city
  }
`)

export const shoeExhibitionQuery = defineQuery(`
  *[_type == "shoe" && _id == $shoeId][0] {
    "exhibitionId": exhibition._ref,
    "imageRef": image.asset._ref
  }
`)
