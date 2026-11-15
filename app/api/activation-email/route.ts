import nodemailer from 'nodemailer'

import {writeClient} from '@/sanity/lib/write-client'

interface ActivationRequestDocument {
  email: string
  sellerName: string
  accessCode: string
}

interface SendActivationEmailInput {
  requestId?: unknown
  accessCode?: unknown
}

function jsonResponse(message: string, status: number): Response {
  return Response.json(
    {message},
    {status, headers: {'Cache-Control': 'no-store'}},
  )
}

function isGmailAuthenticationError(cause: unknown): boolean {
  if (!cause || typeof cause !== 'object') return false

  return (
    ('code' in cause && cause.code === 'EAUTH') ||
    ('responseCode' in cause && cause.responseCode === 535)
  )
}

export async function POST(request: Request): Promise<Response> {
  let input: SendActivationEmailInput
  try {
    input = (await request.json()) as SendActivationEmailInput
  } catch {
    return jsonResponse('بيانات الطلب غير صالحة.', 400)
  }

  if (
    !input ||
    typeof input !== 'object' ||
    typeof input.requestId !== 'string' ||
    input.requestId.length > 128 ||
    typeof input.accessCode !== 'string' ||
    !input.accessCode.trim() ||
    input.accessCode.length > 128
  ) {
    return jsonResponse('بيانات الطلب غير صالحة.', 400)
  }

  const gmailUser = process.env.GMAIL_USER?.trim()
  const gmailAppPassword = process.env.GMAIL_APP_PASSWORD?.replace(/\s/g, '')
  if (!gmailUser || !gmailAppPassword) {
    const missingSettings: string[] = []
    if (!gmailUser) missingSettings.push('GMAIL_USER')
    if (!gmailAppPassword) missingSettings.push('GMAIL_APP_PASSWORD')
    console.error('[sendActivationEmail] missing environment settings', missingSettings)
    return jsonResponse(
      `إعداد البريد ناقص: ${missingSettings.join(' و ')}. أضف المتغيرات في Vercel ثم أعد النشر.`,
      500,
    )
  }

  let activationRequest: ActivationRequestDocument | null
  try {
    activationRequest = await writeClient.fetch<ActivationRequestDocument | null>(
      `*[_type == "activationRequest" && _id == $requestId && status == "approved" && accessCode == $accessCode][0]{
        email,
        sellerName,
        accessCode
      }`,
      {requestId: input.requestId, accessCode: input.accessCode.trim()},
    )
  } catch (cause) {
    console.error('[sendActivationEmail] failed to read activation request', cause)
    return jsonResponse('تعذّر التحقق من طلب التفعيل. يرجى المحاولة لاحقًا.', 500)
  }

  if (!activationRequest?.email) {
    return jsonResponse('الطلب غير موجود أو أن بيانات التفعيل لم تعد صالحة.', 404)
  }

  const configuredSiteUrl = process.env.NEXT_PUBLIC_SITE_URL
  const siteUrl = configuredSiteUrl
    ? configuredSiteUrl.replace(/\/+$/, '')
    : process.env.VERCEL_URL
      ? `https://${process.env.VERCEL_URL}`
      : new URL(request.url).origin
  const activationUrl = `${siteUrl}/seller`
  const text = [
    `مرحبًا ${activationRequest.sellerName}،`,
    '',
    'تمت الموافقة على طلب تفعيل معرضك في خطواتك للمعارض.',
    `رابط الموقع: ${activationUrl}`,
    `البريد الإلكتروني: ${activationRequest.email}`,
    `كود التفعيل: ${activationRequest.accessCode}`,
    '',
    'استخدم خيار «لدي كود تفعيل مسبق» لإتمام إنشاء معرضك.',
  ].join('\n')

  try {
    const transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 465,
      secure: true,
      auth: {
        user: gmailUser,
        pass: gmailAppPassword,
      },
    })

    const result = await transporter.sendMail({
      from: {
        name: 'خطواتك للمعارض',
        address: gmailUser,
      },
      to: activationRequest.email,
      subject: 'تفعيل معرضك في خطواتك للمعارض',
      text,
    })

    if (result.rejected.length > 0 || result.accepted.length === 0) {
      console.error('[sendActivationEmail] Gmail rejected the recipient')
      return jsonResponse(
        'رفض Gmail عنوان البريد المستلم. تحقق من صحة بريد العارض ثم أعد المحاولة.',
        502,
      )
    }
  } catch (cause) {
    console.error('[sendActivationEmail] Gmail SMTP request failed', cause)
    if (isGmailAuthenticationError(cause)) {
      return jsonResponse(
        'رفض Gmail تسجيل الدخول. تحقق من GMAIL_USER واستخدم كلمة مرور تطبيق Gmail صحيحة.',
        502,
      )
    }
    return jsonResponse(
      'تعذّر إرسال الرسالة عبر Gmail. تحقق من إعدادات الحساب ثم أعد المحاولة.',
      502,
    )
  }

  return jsonResponse('قبل Gmail رسالة التفعيل لإرسالها إلى بريد العارض.', 200)
}
