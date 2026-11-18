'use server'

import { createHash, randomBytes } from 'node:crypto'

import type { ActionResult, Exhibition, SellerActivationResult } from '@/lib/types'
import {
  isValidInternationalPhone,
  normalizePhone,
} from '@/lib/phone'
import { clearSellerSession, setSellerSession } from '@/lib/seller-session'
import {
  approvedActivationRequestQuery,
  previousActivationRequestByPhoneQuery,
  sellerExhibitionByActivationRequestQuery,
  sellerExhibitionByCodeQuery,
} from '@/sanity/lib/queries'
import { writeClient } from '@/sanity/lib/write-client'

const INVALID_CODE_MESSAGE =
  'عذراً، هذا القسم مخصص للعارضين المرخّصين من الإدارة فقط. يرجى التواصل مع الأدمن للحصول على كود التفعيل.'
const ACCESS_CODE_CHARACTERS = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'

interface ActivationRequest {
  _id: string
  phone: string
  sellerName: string
  storeName?: string
  accessCode: string
  exhibitionId?: string
}

interface ActivationRequestInput {
  sellerName: string
  phone: string
  storeName?: string
}

interface ExhibitionSetupInput {
  phone: string
  accessCode: string
  storeName: string
  city: string
}

function hashAccessCode(accessCode: string): string {
  return createHash('sha256').update(accessCode).digest('hex')
}

function generateAccessCode(): string {
  return Array.from(randomBytes(12), (byte) =>
    ACCESS_CODE_CHARACTERS.charAt(byte & 31),
  ).join('')
}

async function findActivationRequest(
  phone: string,
  accessCode: string,
): Promise<ActivationRequest | null> {
  const matches = await writeClient.fetch<ActivationRequest[]>(
    approvedActivationRequestQuery,
    {phone, accessCode},
  )

  if (matches.length !== 1) return null

  const latestRequest = await writeClient.fetch<{_id: string} | null>(
    previousActivationRequestByPhoneQuery,
    {phone},
  )
  return latestRequest?._id === matches[0]._id ? matches[0] : null
}

async function findActivationExhibition(
  requestId: string,
  exhibitionId?: string,
): Promise<Exhibition | null> {
  if (exhibitionId) {
    const exhibition = await writeClient.fetch<Exhibition | null>(
      `*[_type == "exhibition" && _id == $exhibitionId && isApproved == true && (!defined(activationRequest._ref) || activationRequest->status == "approved")][0]{
        _id, storeName, sellerName, city, phone, description, "logoRef": logo.asset._ref
      }`,
      {exhibitionId},
    )
    if (exhibition) return exhibition
  }

  return writeClient.fetch<Exhibition | null>(
    sellerExhibitionByActivationRequestQuery,
    {requestId},
  )
}

function validRequestInput(input: ActivationRequestInput): string | null {
  if (
    !input ||
    typeof input.sellerName !== 'string' ||
    typeof input.phone !== 'string' ||
    (input.storeName !== undefined && typeof input.storeName !== 'string')
  ) {
    return 'يرجى إدخال بيانات صحيحة.'
  }

  const sellerName = input.sellerName.trim()
  const phone = normalizePhone(input.phone)
  const storeName = input.storeName?.trim() ?? ''

  if (sellerName.length < 2 || sellerName.length > 120) {
    return 'يرجى إدخال اسم عارض صحيح.'
  }
  if (!isValidInternationalPhone(phone)) {
    return 'يرجى إدخال رقم واتساب دولي صحيح يبدأ بـ + ورمز الدولة.'
  }
  if (storeName.length > 120) {
    return 'اسم المعرض أطول من الحد المسموح.'
  }

  return null
}

export async function submitActivationRequest(
  input: ActivationRequestInput,
): Promise<ActionResult> {
  if (!input || typeof input !== 'object' || typeof input.phone !== 'string') {
    return {status: 'error', message: 'يرجى إدخال بيانات صحيحة.'}
  }
  const phone = normalizePhone(input.phone)
  if (!isValidInternationalPhone(phone)) {
    return {
      status: 'error',
      message: 'يرجى إدخال رقم واتساب دولي صحيح يبدأ بـ + ورمز الدولة.',
    }
  }

  try {
    const existing = await writeClient.fetch<{_id: string} | null>(
      previousActivationRequestByPhoneQuery,
      {phone},
    )
    const accessCode = generateAccessCode()

    if (existing) {
      await writeClient
        .patch(existing._id)
        .set({status: 'pending', accessCode})
        .commit()
    } else {
      const error = validRequestInput(input)
      if (error) return {status: 'error', message: error}

      const requestId = `activation-request-${createHash('sha256')
        .update(phone)
        .digest('hex')
        .slice(0, 40)}`

      await writeClient.createIfNotExists({
        _id: requestId,
        _type: 'activationRequest',
        sellerName: input.sellerName.trim(),
        phone,
        ...(input.storeName?.trim()
          ? {storeName: input.storeName.trim()}
          : {}),
        status: 'pending',
        accessCode,
        createdAt: new Date().toISOString(),
      })
      await writeClient.patch(requestId).set({status: 'pending', accessCode}).commit()
    }

    await clearSellerSession()

    return {
      status: 'success',
      message:
        'تم تحديث طلبك وإرساله للمراجعة. ستحتاج إلى إدخال كود التفعيل الجديد الذي يصلك عبر واتساب بعد الموافقة.',
    }
  } catch (cause) {
    console.error('[submitActivationRequest] failed', cause)
    return {
      status: 'error',
      message: 'تعذّر إرسال الطلب الآن. يرجى المحاولة لاحقًا.',
    }
  }
}

export async function getPreviousActivationRequest(
  submittedPhone: string,
): Promise<
  | {status: 'found'; sellerName: string; storeName?: string}
  | {status: 'not-found'}
  | {status: 'error'; message: string}
> {
  if (
    typeof submittedPhone !== 'string' ||
    !isValidInternationalPhone(normalizePhone(submittedPhone))
  ) {
    return {
      status: 'error',
      message: 'يرجى إدخال رقم واتساب دولي صحيح لاسترجاع الطلب السابق.',
    }
  }

  try {
    const request = await writeClient.fetch<{
      sellerName?: string
      storeName?: string
    } | null>(previousActivationRequestByPhoneQuery, {
      phone: normalizePhone(submittedPhone),
    })

    if (!request || typeof request.sellerName !== 'string') {
      return {status: 'not-found'}
    }

    return {
      status: 'found',
      sellerName: request.sellerName,
      ...(typeof request.storeName === 'string'
        ? {storeName: request.storeName}
        : {}),
    }
  } catch (cause) {
    console.error('[getPreviousActivationRequest] failed', cause)
    return {
      status: 'error',
      message: 'تعذّر استرجاع الطلب السابق الآن. يرجى المحاولة لاحقًا.',
    }
  }
}

export async function authenticateSeller(
  submittedPhone: string,
  submittedCode: string,
): Promise<SellerActivationResult> {
  if (typeof submittedPhone !== 'string' || typeof submittedCode !== 'string') {
    return {status: 'error', message: INVALID_CODE_MESSAGE}
  }

  const phone = normalizePhone(submittedPhone)
  const accessCode = submittedCode.trim()
  if (!isValidInternationalPhone(phone) || !accessCode || accessCode.length > 128) {
    return {status: 'error', message: INVALID_CODE_MESSAGE}
  }

  try {
    const activationRequest = await findActivationRequest(phone, accessCode)
    if (activationRequest) {
      const exhibition = await findActivationExhibition(
        activationRequest._id,
        activationRequest.exhibitionId,
      )
      if (exhibition) {
        if (normalizePhone(exhibition.phone) !== phone) {
          return {status: 'error', message: INVALID_CODE_MESSAGE}
        }
        await setSellerSession(exhibition._id)
        return {status: 'success', message: 'تم التحقق من التفعيل.'}
      }

      return {
        status: 'setup',
        message: 'تم التحقق من التفعيل. أكمل بيانات معرضك للمتابعة.',
        suggestedSellerName: activationRequest.sellerName,
        suggestedStoreName: activationRequest.storeName,
      }
    }

    const matches = await writeClient.fetch<Exhibition[]>(
      sellerExhibitionByCodeQuery,
      {accessCodeHash: hashAccessCode(accessCode)},
    )

    if (matches.length !== 1 || normalizePhone(matches[0].phone) !== phone) {
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

export async function completeSellerRegistration(
  input: ExhibitionSetupInput,
): Promise<ActionResult> {
  if (
    !input ||
    typeof input.phone !== 'string' ||
    typeof input.accessCode !== 'string' ||
    typeof input.storeName !== 'string' ||
    typeof input.city !== 'string'
  ) {
    return {status: 'error', message: 'يرجى إدخال بيانات صحيحة.'}
  }

  const setupPhone = normalizePhone(input.phone)
  if (!isValidInternationalPhone(setupPhone)) {
    return {status: 'error', message: 'يرجى إدخال رقم واتساب دولي صحيح.'}
  }

  const accessCode = input.accessCode.trim()
  const storeName = input.storeName.trim()
  const city = input.city.trim()

  if (!accessCode || accessCode.length > 128) {
    return {status: 'error', message: INVALID_CODE_MESSAGE}
  }
  if (storeName.length < 2 || storeName.length > 120) {
    return {status: 'error', message: 'يرجى إدخال اسم معرض صحيح.'}
  }
  if (city.length < 2 || city.length > 80) {
    return {status: 'error', message: 'يرجى إدخال مدينة صحيحة.'}
  }
  if (!isValidInternationalPhone(setupPhone)) {
    return {status: 'error', message: 'يرجى إدخال رقم واتساب دولي صحيح.'}
  }

  try {
    const activationRequest = await findActivationRequest(setupPhone, accessCode)
    if (!activationRequest) {
      return {status: 'error', message: INVALID_CODE_MESSAGE}
    }

    const existingExhibition = await findActivationExhibition(
      activationRequest._id,
      activationRequest.exhibitionId,
    )
    if (existingExhibition) {
      if (normalizePhone(existingExhibition.phone) !== setupPhone) {
        return {status: 'error', message: INVALID_CODE_MESSAGE}
      }
      await setSellerSession(existingExhibition._id)
      return {status: 'success', message: 'تم تسجيل الدخول إلى معرضك.'}
    }

    const exhibitionId = `seller-${createHash('sha256')
      .update(activationRequest._id)
      .digest('hex')
      .slice(0, 40)}`
    await writeClient.createIfNotExists({
      _id: exhibitionId,
      _type: 'exhibition',
      storeName,
      sellerName: activationRequest.sellerName,
      city,
      phone: setupPhone,
      accessCode: hashAccessCode(accessCode),
      isApproved: true,
      activationRequest: {
        _type: 'reference',
        _ref: activationRequest._id,
      },
    })

    try {
      await writeClient
        .patch(activationRequest._id)
        .set({
          exhibition: {
            _type: 'reference',
            _ref: exhibitionId,
          },
        })
        .commit()
    } catch (cause) {
      const latestRequest = await writeClient.fetch<{
        exhibitionId?: string
      } | null>(
        `*[_type == "activationRequest" && _id == $requestId][0]{"exhibitionId": exhibition._ref}`,
        {requestId: activationRequest._id},
      )
      if (latestRequest?.exhibitionId) {
        if (latestRequest.exhibitionId === exhibitionId) {
          await setSellerSession(exhibitionId)
          return {status: 'success', message: 'تم إنشاء معرضك بنجاح.'}
        }

        const linkedExhibition = await findActivationExhibition(
          activationRequest._id,
          latestRequest.exhibitionId,
        )
        if (linkedExhibition) {
          await setSellerSession(linkedExhibition._id)
          return {status: 'success', message: 'تم تسجيل الدخول إلى معرضك.'}
        }
      }
      throw cause
    }

    await setSellerSession(exhibitionId)
    return {status: 'success', message: 'تم إنشاء معرضك بنجاح.'}
  } catch (cause) {
    console.error('[completeSellerRegistration] failed', cause)
    return {
      status: 'error',
      message: 'تعذّر إنشاء المعرض الآن. يرجى المحاولة لاحقًا.',
    }
  }
}
