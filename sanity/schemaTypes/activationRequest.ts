import {defineField, defineType} from 'sanity'
import {UserIcon} from '@sanity/icons/User'

import {isValidInternationalPhone} from '@/lib/phone'
import {PhoneInput} from '../components/phone-input'

export const activationRequest = defineType({
  name: 'activationRequest',
  title: 'طلبات تحتاج التفعيل',
  type: 'document',
  icon: UserIcon,
  fields: [
    defineField({
      name: 'sellerName',
      title: 'اسم العارض',
      type: 'string',
      validation: (rule) => rule.required().min(2).max(120),
    }),
    defineField({
      name: 'phone',
      title: 'رقم واتساب',
      description: 'أدخل الرقم بصيغته الدولية مع رمز الدولة، بدءًا من علامة +.',
      type: 'string',
      components: {input: PhoneInput},
      validation: (rule) =>
        rule.required().max(30).custom((value) =>
          typeof value === 'string' && isValidInternationalPhone(value)
            ? true
            : 'أدخل رقم واتساب دوليًا يبدأ بـ + ورمز الدولة.',
        ),
    }),
    defineField({
      name: 'storeName',
      title: 'اسم المعرض المقترح',
      type: 'string',
      validation: (rule) => rule.max(120),
    }),
    defineField({
      name: 'status',
      title: 'حالة الطلب',
      type: 'string',
      options: {
        list: [
          {title: 'قيد المراجعة', value: 'pending'},
          {title: 'مقبول ومفعل', value: 'approved'},
          {title: 'مرفوض', value: 'rejected'},
        ],
        layout: 'radio',
      },
      initialValue: 'pending',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'accessCode',
      title: 'كود التفعيل',
      description: 'يُستخدم هذا الكود للتحقق من العارض وإتمام إنشاء المعرض.',
      type: 'string',
      validation: (rule) =>
        rule.max(128).custom((value, context) =>
          context.document?.status === 'approved' && !value
            ? 'كود التفعيل مطلوب عند الموافقة.'
            : true,
        ),
    }),
    defineField({
      name: 'createdAt',
      title: 'تاريخ الطلب',
      type: 'datetime',
      readOnly: true,
    }),
    defineField({
      name: 'exhibition',
      title: 'المعرض المرتبط',
      description: 'يُملأ تلقائيًا بعد إتمام العارض إنشاء معرضه.',
      type: 'reference',
      to: [{type: 'exhibition'}],
      weak: true,
      readOnly: true,
    }),
  ],
  preview: {
    select: {
      title: 'sellerName',
      subtitle: 'phone',
      status: 'status',
    },
    prepare({title, subtitle, status}) {
      const statusTitle =
        status === 'approved'
          ? 'مقبول ومفعل'
          : status === 'rejected'
            ? 'مرفوض'
            : 'قيد المراجعة'

      return {
        title: title ?? 'طلب تفعيل',
        subtitle: [subtitle, statusTitle].filter(Boolean).join(' — '),
      }
    },
  },
})
