'use client'

import type {DocumentActionComponent, SanityDocument} from 'sanity'

interface ActivationRequestDocument extends SanityDocument {
  email?: string
  status?: string
  accessCode?: string
}

export const SendActivationEmailAction: DocumentActionComponent = (props) => {
  const published = props.published as ActivationRequestDocument | null
  const draft = props.draft as ActivationRequestDocument | null
  const valuesAreSaved =
    !draft ||
    (draft.status === published?.status &&
      draft.email === published?.email &&
      draft.accessCode === published?.accessCode)
  const canSend =
    published?.status === 'approved' &&
    Boolean(published.email?.trim()) &&
    Boolean(published.accessCode?.trim()) &&
    valuesAreSaved

  return {
    label: 'إرسال رسالة التفعيل للعارض',
    title: canSend
      ? 'فتح رسالة تفعيل جاهزة في تطبيق البريد'
      : 'انشر الطلب بحالة مقبول وأدخل البريد وكود التفعيل أولًا',
    disabled: !canSend,
    onHandle: () => {
      if (!canSend || !published?.email || !published.accessCode) return

      const activationUrl = `${window.location.origin}/seller`
      const subject = 'تفعيل معرضك في خطواتك للمعارض'
      const body = [
        'مرحبًا،',
        '',
        'تمت الموافقة على طلب تفعيل معرضك في خطواتك للمعارض.',
        `رابط الموقع: ${activationUrl}`,
        `البريد الإلكتروني: ${published.email}`,
        `كود التفعيل: ${published.accessCode}`,
        '',
        'استخدم خيار «لدي كود تفعيل مسبق» لإتمام إنشاء معرضك.',
      ].join('\n')

      window.location.href = `mailto:${encodeURIComponent(published.email)}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`
    },
  }
}
