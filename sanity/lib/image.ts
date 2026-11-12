import { createImageUrlBuilder, type SanityImageSource } from '@sanity/image-url'
import type { ImageLoaderProps } from 'next/image'

import { dataset, projectId } from '../env'

// https://www.sanity.io/docs/image-url
const builder = createImageUrlBuilder({ projectId, dataset })

export const urlFor = (source: SanityImageSource) => {
  return builder.image(source)
}

/**
 * Custom `next/image` loader that lets the Sanity CDN do the resizing.
 *
 * The `src` is the raw Sanity asset reference
 * (`image-<hash>-<width>x<height>-<format>`), which is all the URL builder
 * needs. Using a loader avoids double-encoding (Next optimizing an already
 * resized image) and keeps `next/image` off the default optimizer entirely.
 */
export function sanityImageLoader({
  src,
  width,
  quality,
}: ImageLoaderProps) {
  return urlFor(src)
    .width(width)
    .height(width)
    .fit('crop')
    .auto('format')
    .quality(quality ?? 75)
    .url()
}
