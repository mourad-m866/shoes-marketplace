'use server'

import { revalidatePath, updateTag } from 'next/cache'

import {
  MAX_SHOE_IMAGE_SIZE,
  SHOE_CATEGORIES,
  SHOE_IMAGE_MIME_TYPES,
  SHOE_SIZES,
} from '@/lib/constants'
import { getApprovedSellerExhibitionId } from '@/lib/seller-session'
import type { ActionResult } from '@/lib/types'

import { shoeExhibitionQuery } from '../lib/queries'
import { writeClient } from '../lib/write-client'

function buildImageField(assetId: string) {
  return {
    _type: 'image' as const,
    asset: {
      _type: 'reference' as const,
      _ref: assetId,
    },
  }
}

function readImageFile(value: FormDataEntryValue | null): File | null {
  if (typeof File === 'undefined' || !(value instanceof File) || value.size === 0) {
    return null
  }

  return value
}

async function uploadShoeImage(file: File) {
  const buffer = Buffer.from(await file.arrayBuffer())

  return writeClient.assets.upload('image', buffer, {
    filename: file.name,
    contentType: file.type,
  })
}

function parseSizes(value: FormDataEntryValue | null): number[] {
  if (!value || typeof value !== 'string') return []

  return value
    .split(',')
    .map((size) => Number.parseInt(size.trim(), 10))
    .filter((size) => Number.isFinite(size) && SHOE_SIZES.some((s) => s === size))
}

function isValidCategory(value: string): boolean {
  return SHOE_CATEGORIES.some((category) => category === value)
}

function readFormValues(formData: FormData) {
  return {
    title: String(formData.get('title') ?? '').trim(),
    category: String(formData.get('category') ?? '').trim(),
    price: Number(formData.get('price') ?? Number.NaN),
    exhibitionId: String(formData.get('exhibitionId') ?? '').trim(),
    description: String(formData.get('description') ?? '').trim(),
    imageFile: readImageFile(formData.get('imageFile')),
    sizes: parseSizes(formData.get('sizes')),
    isAvailable: formData.get('isAvailable') === 'on',
  }
}

function validate(
  values: ReturnType<typeof readFormValues>,
  requireImage: boolean,
): string | null {
  if (!values.title) return 'اسم الحذاء مطلوب.'
  if (!values.exhibitionId) return 'يجب اختيار المعرض.'
  if (!isValidCategory(values.category)) return 'الفئة غير صحيحة.'
  if (!Number.isFinite(values.price) || values.price <= 0) {
    return 'السعر غير صحيح.'
  }

  if (requireImage && !values.imageFile) return 'اختر صورة للحذاء من جهازك.'
  if (
    values.imageFile &&
    !SHOE_IMAGE_MIME_TYPES.some((type) => type === values.imageFile?.type)
  ) {
    return 'صيغة الصورة غير مدعومة. استخدم JPEG أو PNG أو WebP أو AVIF.'
  }
  if (values.imageFile && values.imageFile.size > MAX_SHOE_IMAGE_SIZE) {
    return 'يجب ألا يتجاوز حجم الصورة 4 ميغابايت.'
  }

  return null
}

/**
 * Refreshes every surface that shows shoes or exhibitions.
 *
 * `updateTag` expires the `'use cache'` entries (read-your-own-writes), and
 * `revalidatePath` re-renders the affected routes.
 */
function refreshShoeData() {
  updateTag('shoes')
  updateTag('exhibitions')
  revalidatePath('/')
  revalidatePath('/seller')
}

/**
 * Creates a new shoe document and attaches it to the given exhibition.
 */
export async function createShoe(formData: FormData): Promise<ActionResult> {
  const values = readFormValues(formData)

  const error = validate(values, true)
  if (error) {
    return {status: 'error', message: error}
  }

  try {
    const sellerExhibitionId = await getApprovedSellerExhibitionId()
    if (!sellerExhibitionId) {
      return {status: 'error', message: 'انتهت صلاحية الجلسة. يرجى تسجيل الدخول مجددًا.'}
    }
    if (values.exhibitionId !== sellerExhibitionId) {
      return {status: 'error', message: 'لا يمكنك إضافة أحذية إلى معرض آخر.'}
    }

    if (!values.imageFile) {
      return {status: 'error', message: 'اختر صورة للحذاء من جهازك.'}
    }

    const imageAsset = await uploadShoeImage(values.imageFile)

    const created = await writeClient.create({
      _type: 'shoe',
      title: values.title,
      exhibition: {
        _type: 'reference',
        _ref: values.exhibitionId,
      },
      category: values.category,
      price: values.price,
      image: buildImageField(imageAsset._id),
      sizes: values.sizes,
      description: values.description,
      isAvailable: values.isAvailable,
    })

    refreshShoeData()

    return {
      status: 'success',
      message: `تمت إضافة «${values.title}» بنجاح.`,
      shoeId: created._id,
    }
  } catch (cause) {
    console.error('[createShoe] failed', cause)
    return {
      status: 'error',
      message: 'تعذّر حفظ الحذاء في Sanity. تأكد من صحة البيانات وصلاحية رمز الكتابة.',
    }
  }
}

/**
 * Updates an existing shoe document.
 */
export async function updateShoe(formData: FormData): Promise<ActionResult> {
  const id = String(formData.get('id') ?? '').trim()
  if (!id) {
    return {status: 'error', message: 'معرّف الحذاء مفقود.'}
  }

  const values = readFormValues(formData)

  const error = validate(values, false)
  if (error) {
    return {status: 'error', message: error}
  }

  try {
    const sellerExhibitionId = await getApprovedSellerExhibitionId()
    if (!sellerExhibitionId) {
      return {status: 'error', message: 'انتهت صلاحية الجلسة. يرجى تسجيل الدخول مجددًا.'}
    }
    if (values.exhibitionId !== sellerExhibitionId) {
      return {status: 'error', message: 'لا يمكنك تعديل أحذية معرض آخر.'}
    }

    const shoe = await writeClient.fetch<
      {exhibitionId?: string; imageRef?: string} | null
    >(
      shoeExhibitionQuery,
      {shoeId: id},
    )
    if (shoe?.exhibitionId !== sellerExhibitionId) {
      return {status: 'error', message: 'لا يمكنك تعديل أحذية معرض آخر.'}
    }

    if (!values.imageFile && !shoe.imageRef) {
      return {status: 'error', message: 'اختر صورة للحذاء من جهازك.'}
    }

    const image = values.imageFile
      ? buildImageField((await uploadShoeImage(values.imageFile))._id)
      : undefined

    await writeClient
      .patch(id)
      .set({
        title: values.title,
        exhibition: {
          _type: 'reference',
          _ref: values.exhibitionId,
        },
        category: values.category,
        price: values.price,
        sizes: values.sizes,
        description: values.description,
        isAvailable: values.isAvailable,
        ...(image ? {image} : {}),
      })
      .commit()

    refreshShoeData()

    return {status: 'success', message: `تم تحديث «${values.title}» بنجاح.`}
  } catch (cause) {
    console.error('[updateShoe] failed', cause)
    return {
      status: 'error',
      message: 'تعذّر تحديث الحذاء في Sanity.',
    }
  }
}

/**
 * Deletes a shoe document.
 */
export async function deleteShoe(id: string): Promise<ActionResult> {
  if (!id) {
    return {status: 'error', message: 'معرّف الحذاء مفقود.'}
  }

  try {
    const sellerExhibitionId = await getApprovedSellerExhibitionId()
    if (!sellerExhibitionId) {
      return {status: 'error', message: 'انتهت صلاحية الجلسة. يرجى تسجيل الدخول مجددًا.'}
    }

    const shoe = await writeClient.fetch<{exhibitionId?: string} | null>(
      shoeExhibitionQuery,
      {shoeId: id},
    )
    if (shoe?.exhibitionId !== sellerExhibitionId) {
      return {status: 'error', message: 'لا يمكنك حذف أحذية معرض آخر.'}
    }

    await writeClient.delete(id)

    refreshShoeData()

    return {status: 'success', message: 'تم حذف الحذاء بنجاح.'}
  } catch (cause) {
    console.error('[deleteShoe] failed', cause)
    return {status: 'error', message: 'تعذّر حذف الحذاء من Sanity.'}
  }
}
