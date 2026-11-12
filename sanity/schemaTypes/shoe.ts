import { defineArrayMember, defineField, defineType } from 'sanity'
import { PackageIcon } from '@sanity/icons/Package'

/**
 * The fixed list of product categories used across the storefront filters.
 * Keep this in sync with `lib/constants.ts` (`SHOE_CATEGORIES`).
 */
export const SHOE_CATEGORY_OPTIONS = [
  {title: 'رياضي', value: 'رياضي'},
  {title: 'كلاسيكي', value: 'كلاسيكي'},
  {title: 'كاجوال', value: 'كاجوال'},
  {title: 'نسائي', value: 'نسائي'},
  {title: 'أطفال', value: 'أطفال'},
]

/**
 * Shoe (حذاء) — a single product listed by an exhibition.
 */
export const shoe = defineType({
  name: 'shoe',
  title: 'حذاء',
  type: 'document',
  icon: PackageIcon,
  fields: [
    defineField({
      name: 'title',
      title: 'اسم الحذاء',
      type: 'string',
      validation: (rule) => rule.required().min(2).max(160),
    }),
    defineField({
      name: 'exhibition',
      title: 'المعرض',
      type: 'reference',
      to: [{type: 'exhibition'}],
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'category',
      title: 'الفئة',
      type: 'string',
      options: {
        list: SHOE_CATEGORY_OPTIONS,
        layout: 'radio',
      },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'price',
      title: 'السعر',
      type: 'number',
      validation: (rule) => rule.required().positive().precision(2),
    }),
    defineField({
      name: 'image',
      title: 'صورة الحذاء',
      type: 'image',
      options: {
        hotspot: true,
      },
      fields: [
        defineField({
          name: 'alt',
          title: 'النص البديل',
          type: 'string',
        }),
      ],
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'sizes',
      title: 'المقاسات المتاحة',
      type: 'array',
      of: [
        defineArrayMember({
          type: 'number',
          name: 'size',
        }),
      ],
      validation: (rule) => rule.unique(),
    }),
    defineField({
      name: 'description',
      title: 'الوصف',
      type: 'text',
      rows: 4,
      validation: (rule) => rule.max(800),
    }),
    defineField({
      name: 'isAvailable',
      title: 'متاح للبيع',
      type: 'boolean',
      initialValue: true,
    }),
  ],
  preview: {
    select: {
      title: 'title',
      media: 'image',
      category: 'category',
      exhibitionName: 'exhibition.storeName',
    },
    prepare({ title, media, category, exhibitionName }) {
      return {
        title: title ?? 'حذاء بدون اسم',
        subtitle: [category, exhibitionName].filter(Boolean).join(' — '),
        media,
      }
    },
  },
})
