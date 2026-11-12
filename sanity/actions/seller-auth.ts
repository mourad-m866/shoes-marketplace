'use server'

import { createHash } from 'node:crypto'

import type { ActionResult, Exhibition } from '@/lib/types'
import { setSellerSession } from '@/lib/seller-session'
import { sellerExhibitionByCodeQuery } from '@/sanity/lib/queries'
import { writeClient } from '@/sanity/lib/write-client'

const INVALID_CODE_MESSAGE =
  'عذراً، هذا القسم مخصص للعارضين المرخّصين من الإدارة فقط. يرجى التواصل مع الأدمن للحصول على كود التفعيل.'

export async function authenticateSeller(
  submittedCode: string,
): Promise<ActionResult> {
  const accessCode = submittedCode.trim()
  if (!accessCode || accessCode.length > 128) {
    return {status: 'error', message: INVALID_CODE_MESSAGE}
  }

  try {
    const accessCodeHash = createHash('sha256')
      .update(accessCode)
      .digest('hex')
    const matches = await writeClient.fetch<Exhibition[]>(
      sellerExhibitionByCodeQuery,
      {accessCodeHash},
    )

    if (matches.length !== 1) {
      return {status: 'error', message: INVALID_CODE_MESSAGE}
    }

    await setSellerSession(matches[0]._id)
    return {status: 'success', message: 'تم التحقق من الترخيص.'}
  } catch (cause) {
    console.error('[authenticateSeller] failed', cause)
    return {
      status: 'error',
      message: 'تعذّر التحقق من الترخيص الآن. يرجى المحاولة لاحقًا.',
    }
  }
}
