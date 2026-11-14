import { defineField, defineType } from 'sanity'
import { TrolleyIcon } from '@sanity/icons/Trolley'

import { AccessCodeInput } from '../components/access-code-input'

/**
 * المعرض (معرض) — represents a shoe seller / exhibition booth.
 *
 * Modelled as a document so that many `shoe` documents can reference it
 * (see `sanity/schemaTypes/shoe.ts`).
 */
export const exhibition = defineType({
  name: 'exhibition',
  title: 'معرض',
  type: 'document',
  icon: TrolleyIcon,
  fields: [
    defineField({
      name: 'storeName',
      title: 'اسم المعرض',
      type: 'string',
      validation: (rule) => rule.required().min(2).max(120),
    }),
    defineField({
      name: 'sellerName',
      title: 'اسم البائع',
      type: 'string',
      validation: (rule) => rule.required().min(2).max(120),
    }),
    defineField({
      name: 'email',
      title: 'البريد الإلكتروني للعارض',
      type: 'string',
      validation: (rule) => rule.email(),
    }),
    defineField({
      name: 'activationRequest',
      title: 'طلب التفعيل',
      type: 'reference',
      to: [{type: 'activationRequest'}],
      weak: true,
      readOnly: true,
    }),
    defineField({
      name: 'city',
      title: 'المدينة',
      type: 'string',
      validation: (rule) => rule.required().min(2).max(80),
    }),
    defineField({
      name: 'phone',
      title: 'رقم الهاتف',
      type: 'string',
      validation: (rule) => rule.required().min(6).max(30),
    }),
    defineField({
      name: 'accessCode',
      title: 'كود ترخيص العارض',
      description:
        'أدخل كودًا عشوائيًا لا يقل عن 20 حرفًا. يُحفظ بصيغة مشفّرة؛ انسخه وشاركه مع العارض قبل مغادرة الحقل.',
      type: 'string',
      components: {input: AccessCodeInput},
      validation: (rule) =>
        rule.regex(/^[a-f0-9]{64}$/).error('أدخل كود ترخيص عبر الحقل المخصص.'),
    }),
    defineField({
      name: 'isApproved',
      title: 'مرخّص من الإدارة',
      type: 'boolean',
      initialValue: false,
    }),
    defineField({
      name: 'logo',
      title: 'شعار المعرض',
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
    }),
    defineField({
      name: 'description',
      title: 'وصف المعرض',
      type: 'text',
      rows: 4,
      validation: (rule) => rule.max(600),
    }),
  ],
  preview: {
    select: {
      title: 'storeName',
      sellerName: 'sellerName',
      city: 'city',
      media: 'logo',
    },
    prepare({ title, sellerName, city, media }) {
      return {
        title: title ?? 'معرض بدون اسم',
        subtitle: [sellerName, city].filter(Boolean).join(' — '),
        media,
      }
    },
  },
})
