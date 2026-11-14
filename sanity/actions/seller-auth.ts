'use server'

import { createHash } from 'node:crypto'

import type { ActionResult, Exhibition, SellerActivationResult } from '@/lib/types'
import { setSellerSession } from '@/lib/seller-session'
import {
  approvedActivationRequestQuery,
  sellerExhibitionByActivationRequestQuery,
  sellerExhibitionByCodeQuery,
} from '@/sanity/lib/queries'
import { writeClient } from '@/sanity/lib/write-client'

const INVALID_CODE_MESSAGE =
  'عذراً، هذا القسم مخصص للعارضين المرخّصين من الإدارة فقط. يرجى التواصل مع الأدمن للحصول على كود التفعيل.'

interface ActivationRequest {
  _id: string
  _rev: string
  email: string
  sellerName: string
  storeName?: string
  accessCode: string
  exhibitionId?: string
}

interface ActivationRequestInput {
  sellerName: string
  email: string
  storeName?: string
}

interface ExhibitionSetupInput {
  email: string
  accessCode: string
  storeName: string
  city: string
  phone: string
}

function normalizeEmail(email: string): string {
  return email.trim().toLowerCase()
}

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

function hashAccessCode(accessCode: string): string {
  return createHash('sha256').update(accessCode).digest('hex')
}

async function findActivationRequest(
  email: string,
  accessCode: string,
): Promise<ActivationRequest | null> {
  const matches = await writeClient.fetch<ActivationRequest[]>(
    approvedActivationRequestQuery,
    {email, accessCode},
  )

  return matches.length === 1 ? matches[0] : null
}

async function findActivationExhibition(
  requestId: string,
  exhibitionId?: string,
): Promise<Exhibition | null> {
  if (exhibitionId) {
    const exhibition = await writeClient.fetch<Exhibition | null>(
      `*[_type == "exhibition" && _id == $exhibitionId && isApproved == true][0]{
        _id, email, storeName, sellerName, city, phone, description, "logoRef": logo.asset._ref
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
    typeof input.email !== 'string' ||
    (input.storeName !== undefined && typeof input.storeName !== 'string')
  ) {
    return 'يرجى إدخال بيانات صحيحة.'
  }

  const sellerName = input.sellerName.trim()
  const email = normalizeEmail(input.email)
  const storeName = input.storeName?.trim() ?? ''

  if (sellerName.length < 2 || sellerName.length > 120) {
    return 'يرجى إدخال اسم عارض صحيح.'
  }
  if (!isValidEmail(email) || email.length > 254) {
    return 'يرجى إدخال بريد إلكتروني صحيح.'
  }
  if (storeName.length > 120) {
    return 'اسم المعرض أطول من الحد المسموح.'
  }

  return null
}

export async function submitActivationRequest(
  input: ActivationRequestInput,
): Promise<ActionResult> {
  const error = validRequestInput(input)
  if (error) return {status: 'error', message: error}

  const sellerName = input.sellerName.trim()
  const email = normalizeEmail(input.email)
  const storeName = input.storeName?.trim() ?? ''

  try {
    await writeClient.create({
      _type: 'activationRequest',
      sellerName,
      email,
      ...(storeName ? {storeName} : {}),
      status: 'pending',
      createdAt: new Date().toISOString(),
    })

    return {status: 'success', message: 'تم إرسال الطلب بنجاح.'}
  } catch (cause) {
    console.error('[submitActivationRequest] failed', cause)
    return {
      status: 'error',
      message: 'تعذّر إرسال الطلب الآن. يرجى المحاولة لاحقًا.',
    }
  }
}

export async function authenticateSeller(
  submittedEmail: string,
  submittedCode: string,
): Promise<SellerActivationResult> {
  if (typeof submittedEmail !== 'string' || typeof submittedCode !== 'string') {
    return {status: 'error', message: INVALID_CODE_MESSAGE}
  }

  const email = normalizeEmail(submittedEmail)
  const accessCode = submittedCode.trim()
  if (!isValidEmail(email) || email.length > 254 || !accessCode || accessCode.length > 128) {
    return {status: 'error', message: INVALID_CODE_MESSAGE}
  }

  try {
    const activationRequest = await findActivationRequest(email, accessCode)
    if (activationRequest) {
      const exhibition = await findActivationExhibition(
        activationRequest._id,
        activationRequest.exhibitionId,
      )
      if (exhibition) {
        if (exhibition.email && normalizeEmail(exhibition.email) !== email) {
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

    if (matches.length !== 1) {
      return {status: 'error', message: INVALID_CODE_MESSAGE}
    }
    if (matches[0].email && normalizeEmail(matches[0].email) !== email) {
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
    typeof input.email !== 'string' ||
    typeof input.accessCode !== 'string' ||
    typeof input.storeName !== 'string' ||
    typeof input.city !== 'string' ||
    typeof input.phone !== 'string'
  ) {
    return {status: 'error', message: 'يرجى إدخال بيانات صحيحة.'}
  }

  const email = normalizeEmail(input.email)
  if (!isValidEmail(email) || email.length > 254) {
    return {status: 'error', message: 'يرجى إدخال بريد إلكتروني صحيح.'}
  }

  const accessCode = input.accessCode.trim()
  const storeName = input.storeName.trim()
  const city = input.city.trim()
  const phone = input.phone.trim()

  if (!accessCode || accessCode.length > 128) {
    return {status: 'error', message: INVALID_CODE_MESSAGE}
  }
  if (storeName.length < 2 || storeName.length > 120) {
    return {status: 'error', message: 'يرجى إدخال اسم معرض صحيح.'}
  }
  if (city.length < 2 || city.length > 80) {
    return {status: 'error', message: 'يرجى إدخال مدينة صحيحة.'}
  }
  if (phone.length < 6 || phone.length > 30) {
    return {status: 'error', message: 'يرجى إدخال رقم هاتف صحيح.'}
  }

  try {
    const activationRequest = await findActivationRequest(email, accessCode)
    if (!activationRequest) {
      return {status: 'error', message: INVALID_CODE_MESSAGE}
    }

    const existingExhibition = await findActivationExhibition(
      activationRequest._id,
      activationRequest.exhibitionId,
    )
    if (existingExhibition) {
      if (
        existingExhibition.email &&
        normalizeEmail(existingExhibition.email) !== email
      ) {
        return {status: 'error', message: INVALID_CODE_MESSAGE}
      }
      await setSellerSession(existingExhibition._id)
      return {status: 'success', message: 'تم تسجيل الدخول إلى معرضك.'}
    }

    const created = await writeClient.create({
      _type: 'exhibition',
      storeName,
      sellerName: activationRequest.sellerName,
      email,
      city,
      phone,
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
        .ifRevisionId(activationRequest._rev)
        .set({
          exhibition: {
            _type: 'reference',
            _ref: created._id,
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
        if (latestRequest.exhibitionId === created._id) {
          await setSellerSession(created._id)
          return {status: 'success', message: 'تم إنشاء معرضك بنجاح.'}
        }

        const linkedExhibition = await findActivationExhibition(
          activationRequest._id,
          latestRequest.exhibitionId,
        )
        if (linkedExhibition) {
          await writeClient.delete(created._id)
          await setSellerSession(linkedExhibition._id)
          return {status: 'success', message: 'تم تسجيل الدخول إلى معرضك.'}
        }
      }
      throw cause
    }

    await setSellerSession(created._id)
    return {status: 'success', message: 'تم إنشاء معرضك بنجاح.'}
  } catch (cause) {
    console.error('[completeSellerRegistration] failed', cause)
    return {
      status: 'error',
      message: 'تعذّر إنشاء المعرض الآن. يرجى المحاولة لاحقًا.',
    }
  }
}
