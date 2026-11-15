'use client'

import {useState} from 'react'
import {useToast} from '@sanity/ui/toast'
import type {DocumentActionComponent, SanityDocument} from 'sanity'

interface ActivationRequestDocument extends SanityDocument {
  email?: string
  status?: string
  accessCode?: string
}

interface SendEmailResponse {
  message?: string
}

export const SendActivationEmailAction: DocumentActionComponent = (props) => {
  const [isSending, setIsSending] = useState(false)
  const toast = useToast()
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

  async function sendActivationEmail() {
    if (!canSend || !published?._id || !published.accessCode || isSending) return

    setIsSending(true)
    try {
      const response = await fetch('/api/activation-email', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({
          requestId: published._id,
          accessCode: published.accessCode,
        }),
      })
      const result = (await response.json()) as SendEmailResponse

      if (!response.ok) {
        throw new Error(result.message || 'تعذّر إرسال رسالة التفعيل.')
      }

      toast.push({
        status: 'success',
        title: result.message || 'تم إرسال رسالة التفعيل إلى بريد العارض.',
      })
      props.onComplete()
    } catch (cause) {
      console.error('[sendActivationEmail] failed', cause)
      toast.push({
        status: 'error',
        title: 'تعذّر إرسال رسالة التفعيل',
        description:
          cause instanceof Error
            ? cause.message
            : 'حدث خطأ غير متوقع. يرجى المحاولة مرة أخرى.',
        duration: 10000,
      })
    } finally {
      setIsSending(false)
    }
  }

  return {
    label: isSending ? 'جارٍ إرسال رسالة التفعيل…' : 'إرسال رسالة التفعيل للعارض',
    title: canSend
      ? 'إرسال رسالة التفعيل مباشرة إلى البريد الإلكتروني المسجل'
      : 'انشر الطلب بحالة مقبول وأدخل البريد وكود التفعيل أولًا',
    disabled: !canSend || isSending,
    onHandle: sendActivationEmail,
  }
}
