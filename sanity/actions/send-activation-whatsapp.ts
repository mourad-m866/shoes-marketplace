'use client'

import {useToast} from '@sanity/ui/toast'
import type {DocumentActionComponent, SanityDocument} from 'sanity'

import {isValidInternationalPhone, normalizePhone} from '@/lib/phone'

interface ActivationRequestDocument extends SanityDocument {
  sellerName?: string
  phone?: string
  storeName?: string
  status?: string
  accessCode?: string
}

export const SendActivationWhatsAppAction: DocumentActionComponent = (props) => {
  const toast = useToast()
  const published = props.published as ActivationRequestDocument | null
  const draft = props.draft as ActivationRequestDocument | null
  const valuesAreSaved =
    !draft ||
    (draft.status === published?.status &&
      draft.phone === published?.phone &&
      draft.sellerName === published?.sellerName &&
      draft.storeName === published?.storeName &&
      draft.accessCode === published?.accessCode)
  const canSend =
    published?.status === 'approved' &&
    Boolean(published.phone && isValidInternationalPhone(published.phone)) &&
    Boolean(published.accessCode?.trim()) &&
    valuesAreSaved

  function openWhatsApp() {
    if (!canSend || !published?.phone || !published.accessCode) return

    const phone = normalizePhone(published.phone).slice(1)
    const message = [
      `مرحبًا ${published.sellerName || ''}،`,
      '',
      'تمت الموافقة على طلب تفعيل معرضك في خطواتك للمعارض. استخدم كود التفعيل الجديد أدناه للدخول.',
      `رابط الموقع: ${window.location.origin}/seller`,
      `رقم واتساب: ${published.phone}`,
      `كود التفعيل: ${published.accessCode}`,
      '',
      'استخدم خيار «لدي كود تفعيل مسبق» لإتمام إنشاء معرضك.',
    ].join('\n')
    const url = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`

    window.open(url, '_blank', 'noopener,noreferrer')
    toast.push({
      status: 'success',
      title: 'تم فتح واتساب برسالة التفعيل الجاهزة',
      description: 'راجع المستلم والرسالة ثم اضغط إرسال في واتساب.',
    })
    props.onComplete()
  }

  return {
    label: 'فتح واتساب لإرسال رسالة التفعيل',
    title: canSend
      ? 'فتح محادثة واتساب برسالة جاهزة إلى رقم مقدم الطلب'
      : 'انشر الطلب بحالة مقبول وأدخل رقم واتساب دوليًا وكود التفعيل أولًا',
    disabled: !canSend,
    onHandle: openWhatsApp,
  }
}
