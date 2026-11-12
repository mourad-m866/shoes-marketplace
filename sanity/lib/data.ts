import { cacheTag } from 'next/cache'

import type { Exhibition, Shoe } from '@/lib/types'

import { sanityFetch } from './live'
import { sellerShoesQuery, exhibitionsQuery, shoesQuery } from './queries'
import { writeClient } from './write-client'

/**
 * Cached read helpers.
 *
 * Both functions are wrapped in `'use cache'` boundaries so their results are
 * part of the static shell. `cacheTag` gives Sanity Live a stable tag to
 * expire when the underlying documents change.
 */

export async function getExhibitions(): Promise<Exhibition[]> {
  'use cache'
  cacheTag('exhibitions')

  const { data } = await sanityFetch({
    query: exhibitionsQuery,
    perspective: 'published',
    stega: false,
  })

  return (data ?? []) as Exhibition[]
}

export async function getShoes(): Promise<Shoe[]> {
  'use cache'
  cacheTag('shoes')

  const { data } = await sanityFetch({
    query: shoesQuery,
    perspective: 'published',
    stega: false,
  })

  return (data ?? []) as Shoe[]
}

export async function getSellerShoes(exhibitionId: string): Promise<Shoe[]> {
  return writeClient.fetch<Shoe[]>(sellerShoesQuery, {exhibitionId})
}
