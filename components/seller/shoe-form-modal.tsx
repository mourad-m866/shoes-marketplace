'use client'

import Image from 'next/image'
import { useCallback, useEffect, useRef, useState, useTransition } from 'react'

import {
  MAX_SHOE_IMAGE_SIZE,
  SHOE_CATEGORIES,
  SHOE_IMAGE_MIME_TYPES,
  SHOE_SIZES,
} from '@/lib/constants'
import type { ActionResult, Exhibition, Shoe } from '@/lib/types'

import { createShoe, updateShoe } from '@/sanity/actions/shoes'
import { sanityImageLoader } from '@/sanity/lib/image'

interface ShoeFormModalProps {
  onClose: () => void
  exhibitions: Exhibition[]
  /** When set, the modal edits this shoe instead of creating a new one. */
  editingShoe?: Shoe | null
}

interface FormState {
  title: string
  category: string
  price: string
  exhibitionId: string
  description: string
  imageFile: File | null
  sizes: number[]
  isAvailable: boolean
}

const EMPTY_FORM: FormState = {
  title: '',
  category: SHOE_CATEGORIES[0],
  price: '',
  exhibitionId: '',
  description: '',
  imageFile: null,
  sizes: [],
  isAvailable: true,
}

/**
 * Modal form used to add a new shoe to an exhibition or to edit an existing
 * one. Submissions go through the `createShoe` / `updateShoe` server actions.
 */
export function ShoeFormModal({
  onClose,
  exhibitions,
  editingShoe,
}: ShoeFormModalProps) {
  const [form, setForm] = useState<FormState>(() =>
    editingShoe
      ? {
          title: editingShoe.title,
          category: editingShoe.category,
          price: String(editingShoe.price),
          exhibitionId: editingShoe.exhibitionId ?? '',
          description: editingShoe.description ?? '',
          imageFile: null,
          sizes: editingShoe.sizes ?? [],
          isAvailable: editingShoe.isAvailable,
        }
      : {
          ...EMPTY_FORM,
          exhibitionId: exhibitions[0]?._id ?? '',
        },
  )
  const [result, setResult] = useState<ActionResult | null>(null)
  const [isPending, startTransition] = useTransition()
  const dialogRef = useRef<HTMLDivElement>(null)
  const imageInputRef = useRef<HTMLInputElement>(null)
  const imagePreviewRef = useRef<string | null>(null)
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null)

  const isEditing = Boolean(editingShoe)

  const handleClose = useCallback(() => {
    if (imagePreviewRef.current) {
      URL.revokeObjectURL(imagePreviewRef.current)
      imagePreviewRef.current = null
    }

    setImagePreviewUrl(null)
    setForm((previous) => ({...previous, imageFile: null}))
    if (imageInputRef.current) imageInputRef.current.value = ''
    onClose()
  }, [onClose])

  useEffect(() => {
    return () => {
      if (imagePreviewRef.current) {
        URL.revokeObjectURL(imagePreviewRef.current)
      }
    }
  }, [])

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') handleClose()
    }

    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [handleClose])

  function update<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((previous) => ({...previous, [key]: value}))
  }

  function clearImageSelection() {
    if (imagePreviewRef.current) {
      URL.revokeObjectURL(imagePreviewRef.current)
      imagePreviewRef.current = null
    }

    setImagePreviewUrl(null)
    update('imageFile', null)
    if (imageInputRef.current) imageInputRef.current.value = ''
  }

  function handleImageChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.currentTarget.files?.[0]
    if (!file) return

    if (!SHOE_IMAGE_MIME_TYPES.some((type) => type === file.type)) {
      clearImageSelection()
      setResult({
        status: 'error',
        message: 'صيغة الصورة غير مدعومة. استخدم JPEG أو PNG أو WebP أو AVIF.',
      })
      return
    }

    if (file.size > MAX_SHOE_IMAGE_SIZE) {
      clearImageSelection()
      setResult({
        status: 'error',
        message: 'يجب ألا يتجاوز حجم الصورة 4 ميغابايت.',
      })
      return
    }

    if (imagePreviewRef.current) {
      URL.revokeObjectURL(imagePreviewRef.current)
    }
    const previewUrl = URL.createObjectURL(file)
    imagePreviewRef.current = previewUrl
    setImagePreviewUrl(previewUrl)
    update('imageFile', file)
    setResult(null)
  }

  function toggleSize(size: number) {
    setForm((previous) => ({
      ...previous,
      sizes: previous.sizes.includes(size)
        ? previous.sizes.filter((item) => item !== size)
        : [...previous.sizes, size].sort((a, b) => a - b),
    }))
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const payload = new FormData()
    payload.set('title', form.title)
    payload.set('category', form.category)
    payload.set('price', form.price)
    payload.set('exhibitionId', form.exhibitionId)
    payload.set('description', form.description)
    if (form.imageFile) payload.set('imageFile', form.imageFile)
    payload.set('sizes', form.sizes.join(','))
    if (form.isAvailable) payload.set('isAvailable', 'on')
    if (editingShoe) payload.set('id', editingShoe._id)

    startTransition(async () => {
      const actionResult = editingShoe
        ? await updateShoe(payload)
        : await createShoe(payload)

      setResult(actionResult)

      if (actionResult.status === 'success') {
        handleClose()
      }
    })
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-brand-950/60 p-4 backdrop-blur-sm sm:items-center"
      role="dialog"
      aria-modal="true"
      aria-labelledby="shoe-modal-title"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) handleClose()
      }}
    >
      <div
        ref={dialogRef}
        className="my-8 w-full max-w-2xl rounded-3xl border border-brand-100 bg-white shadow-2xl"
      >
        <div className="flex items-center justify-between gap-4 border-b border-brand-100 px-6 py-4">
          <h2 id="shoe-modal-title" className="text-lg font-bold text-brand-950">
            {isEditing ? 'تعديل بيانات الحذاء' : '+ إضافة حذاء جديد للمعرض'}
          </h2>
          <button
            type="button"
            onClick={handleClose}
            aria-label="إغلاق"
            className="flex size-9 items-center justify-center rounded-full text-brand-500 transition hover:bg-brand-50 hover:text-brand-800"
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              className="size-5"
            >
              <path d="m6 6 12 12M18 6 6 18" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5 px-6 py-5">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field label="اسم الحذاء" htmlFor="shoe-title">
              <input
                id="shoe-title"
                type="text"
                required
                value={form.title}
                onChange={(event) => update('title', event.target.value)}
                placeholder="مثال: حذاء رياضي جلد"
                className={inputClassName}
              />
            </Field>

            <Field label="الفئة" htmlFor="shoe-category">
              <select
                id="shoe-category"
                value={form.category}
                onChange={(event) => update('category', event.target.value)}
                className={inputClassName}
              >
                {SHOE_CATEGORIES.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </Field>

            <Field label="السعر" htmlFor="shoe-price">
              <input
                id="shoe-price"
                type="number"
                required
                min="0"
                step="0.01"
                value={form.price}
                onChange={(event) => update('price', event.target.value)}
                placeholder="0.00"
                className={inputClassName}
              />
            </Field>

            <Field label="المعرض" htmlFor="shoe-exhibition">
              <select
                id="shoe-exhibition"
                required
                value={form.exhibitionId}
                onChange={(event) => update('exhibitionId', event.target.value)}
                className={inputClassName}
              >
                {exhibitions.length === 0 && (
                  <option value="">لا توجد معارض متاحة</option>
                )}
                {exhibitions.map((exhibition) => (
                  <option key={exhibition._id} value={exhibition._id}>
                    {exhibition.storeName} — {exhibition.city}
                  </option>
                ))}
              </select>
            </Field>
          </div>

          <Field
            label="المقاسات المتاحة"
            htmlFor="shoe-sizes"
            hint="اختر المقاسات التي يتوفر بها الحذاء."
          >
            <div
              id="shoe-sizes"
              className="flex flex-wrap gap-2 rounded-xl border border-brand-200 bg-brand-50/60 p-3"
            >
              {SHOE_SIZES.map((size) => {
                const isSelected = form.sizes.includes(size)

                return (
                  <button
                    key={size}
                    type="button"
                    onClick={() => toggleSize(size)}
                    aria-pressed={isSelected}
                    className={`size-10 rounded-lg border text-sm font-bold transition ${
                      isSelected
                        ? 'border-brand-700 bg-brand-700 text-white'
                        : 'border-brand-200 bg-white text-brand-700 hover:border-brand-400'
                    }`}
                  >
                    {size}
                  </button>
                )
              })}
            </div>
          </Field>

          <Field
            label="صورة الحذاء من الجهاز"
            htmlFor="shoe-image"
            hint={
              editingShoe?.imageRef
                ? 'اختر صورة جديدة لاستبدال الحالية، أو اترك الحقل فارغًا للاحتفاظ بها.'
                : 'الصيغ المدعومة: JPEG وPNG وWebP وAVIF، بحد أقصى 4 ميغابايت.'
            }
          >
            <input
              ref={imageInputRef}
              id="shoe-image"
              type="file"
              accept={SHOE_IMAGE_MIME_TYPES.join(',')}
              required={!editingShoe?.imageRef && !form.imageFile}
              onChange={handleImageChange}
              className={inputClassName}
            />
            {(imagePreviewUrl || editingShoe?.imageRef) && (
              <div className="mt-3 flex items-center gap-3">
                {imagePreviewUrl ? (
                  <Image
                    src={imagePreviewUrl}
                    alt={form.title || 'معاينة صورة الحذاء'}
                    width={112}
                    height={112}
                    unoptimized
                    className="size-28 rounded-xl border border-brand-100 object-cover"
                  />
                ) : (
                  editingShoe?.imageRef && (
                    <Image
                      src={editingShoe.imageRef}
                      alt={form.title || 'صورة الحذاء الحالية'}
                      width={112}
                      height={112}
                      loader={sanityImageLoader}
                      className="size-28 rounded-xl border border-brand-100 object-cover"
                    />
                  )
                )}
                {form.imageFile && (
                  <button
                    type="button"
                    onClick={clearImageSelection}
                    className="text-sm font-semibold text-rose-700 underline"
                  >
                    إزالة الصورة المختارة
                  </button>
                )}
              </div>
            )}
          </Field>

          <Field label="الوصف" htmlFor="shoe-description">
            <textarea
              id="shoe-description"
              rows={3}
              value={form.description}
              onChange={(event) => update('description', event.target.value)}
              placeholder="تفاصيل إضافية عن الحذاء…"
              className={`${inputClassName} resize-y`}
            />
          </Field>

          <label className="flex items-center gap-3 text-sm font-semibold text-brand-800">
            <input
              type="checkbox"
              checked={form.isAvailable}
              onChange={(event) => update('isAvailable', event.target.checked)}
              className="size-5 rounded border-brand-300 text-brand-700 focus:ring-brand-500"
            />
            الحذاء متاح للبيع
          </label>

          {result && (
            <p
              role="status"
              className={`rounded-xl px-4 py-3 text-sm font-semibold ${
                result.status === 'success'
                  ? 'bg-emerald-50 text-emerald-700'
                  : 'bg-rose-50 text-rose-700'
              }`}
            >
              {result.message}
            </p>
          )}

          <div className="flex flex-col-reverse gap-3 border-t border-brand-100 pt-4 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={handleClose}
              className="rounded-xl border border-brand-200 px-5 py-2.5 text-sm font-bold text-brand-700 transition hover:bg-brand-50"
            >
              إلغاء
            </button>
            <button
              type="submit"
              disabled={isPending || exhibitions.length === 0}
              className="rounded-xl bg-brand-900 px-5 py-2.5 text-sm font-bold text-white transition hover:bg-brand-800 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isPending
                ? 'جارٍ الحفظ…'
                : isEditing
                  ? 'حفظ التعديلات'
                  : 'إضافة الحذاء'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

const inputClassName =
  'w-full rounded-xl border border-brand-200 bg-brand-50/60 px-4 py-2.5 text-sm text-brand-950 outline-none transition focus:border-brand-500 focus:bg-white focus:ring-2 focus:ring-brand-500/20'

interface FieldProps {
  label: string
  htmlFor: string
  hint?: string
  children: React.ReactNode
}

function Field({label, htmlFor, hint, children}: FieldProps) {
  return (
    <div>
      <label
        htmlFor={htmlFor}
        className="mb-1.5 block text-sm font-semibold text-brand-800"
      >
        {label}
      </label>
      {children}
      {hint && <p className="mt-1.5 text-xs text-brand-500">{hint}</p>}
    </div>
  )
}
