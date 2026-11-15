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

  const apiKey = process.env.RESEND_API_KEY
  const sender = process.env.ACTIVATION_EMAIL_FROM
  if (!apiKey || !sender) {
    const missingSettings = [
      !apiKey && 'RESEND_API_KEY',
      !sender && 'ACTIVATION_EMAIL_FROM',
    ].filter(Boolean)
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
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: sender,
        to: [activationRequest.email],
        subject: 'تفعيل معرضك في خطواتك للمعارض',
        text,
      }),
      cache: 'no-store',
    })

    if (!response.ok) {
      const details = await response.text()
      console.error('[sendActivationEmail] Resend rejected the email', {
        status: response.status,
        details,
      })
      return jsonResponse(
        'لم يتمكن مزوّد البريد من إرسال الرسالة. تحقق من إعدادات المرسل ونطاق البريد ثم أعد المحاولة.',
        502,
      )
    }
  } catch (cause) {
    console.error('[sendActivationEmail] Resend request failed', cause)
    return jsonResponse('تعذّر الاتصال بخدمة البريد. يرجى المحاولة لاحقًا.', 502)
  }

  return jsonResponse('تم إرسال رسالة التفعيل إلى بريد العارض.', 200)
}
