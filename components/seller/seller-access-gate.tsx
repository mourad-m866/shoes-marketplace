'use client'

import {useRef, useState, useTransition, type FormEvent} from 'react'
import {useRouter} from 'next/navigation'

import type {ActionResult, SellerActivationResult} from '@/lib/types'
import {
  authenticateSeller,
  completeSellerRegistration,
  getPreviousActivationRequest,
  submitActivationRequest,
} from '@/sanity/actions/seller-auth'
import {isValidInternationalPhone, normalizePhone} from '@/lib/phone'

const inputClassName =
  'w-full rounded-xl border border-brand-200 bg-brand-50/60 px-4 py-3 text-sm text-brand-950 outline-none transition focus:border-brand-500 focus:bg-white focus:ring-2 focus:ring-brand-500/20'

export function SellerAccessGate() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<'request' | 'activate'>('request')
  const [isSetupMode, setIsSetupMode] = useState(false)
  const [sellerName, setSellerName] = useState('')
  const [suggestedStoreName, setSuggestedStoreName] = useState('')
  const [accessCode, setAccessCode] = useState('')
  const [city, setCity] = useState('')
  const [phone, setPhone] = useState('')
  const [requestResult, setRequestResult] = useState<ActionResult | null>(null)
  const [activationResult, setActivationResult] =
    useState<SellerActivationResult | null>(null)
  const [isPending, startTransition] = useTransition()
  const [isLookupPending, startLookupTransition] = useTransition()
  const [requestLookupMessage, setRequestLookupMessage] = useState<string | null>(
    null,
  )
  const [requestLookupError, setRequestLookupError] = useState<string | null>(null)
  const [hasExistingRequest, setHasExistingRequest] = useState(false)
  const requestLookupAttempt = useRef(0)

  function handleRequestPhoneChange(value: string) {
    requestLookupAttempt.current += 1
    setPhone(value.replace(/\s+/g, ''))
    setSellerName('')
    setSuggestedStoreName('')
    setHasExistingRequest(false)
    setRequestLookupMessage(null)
    setRequestLookupError(null)
  }

  function handleRequestPhoneBlur() {
    const normalizedPhone = normalizePhone(phone)
    if (!isValidInternationalPhone(normalizedPhone)) return

    const attempt = ++requestLookupAttempt.current
    startLookupTransition(async () => {
      const result = await getPreviousActivationRequest(normalizedPhone)
      if (attempt !== requestLookupAttempt.current) return

      if (result.status === 'found') {
        setHasExistingRequest(true)
        setSellerName(result.sellerName)
        setSuggestedStoreName(result.storeName ?? '')
        setRequestLookupMessage(
          'تم استرجاع طلبك السابق. ستبقى بياناته كما هي عند إعادة الإرسال.',
        )
        return
      }

      if (result.status === 'not-found') {
        setHasExistingRequest(false)
        setRequestLookupMessage(
          'لا يوجد طلب سابق لهذا الرقم؛ أكمل البيانات لإرسال طلبك.',
        )
        return
      }

      setRequestLookupError(result.message)
    })
  }

  function handleRequestSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (isLookupPending) return

    startTransition(async () => {
      const result = await submitActivationRequest({
        sellerName,
        phone,
        storeName: suggestedStoreName,
      })
      setRequestResult(result)
    })
  }

  function handleVerifySubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    startTransition(async () => {
      const result = await authenticateSeller(phone, accessCode)
      setActivationResult(result)
      if (result.status === 'setup') {
        setIsSetupMode(true)
        setSellerName(result.suggestedSellerName || '')
        setSuggestedStoreName((current) => current || result.suggestedStoreName || '')
      } else if (result.status === 'success') {
        router.refresh()
      }
    })
  }

  function handleSetupSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    startTransition(async () => {
      const result = await completeSellerRegistration({
        phone,
        accessCode,
        storeName: suggestedStoreName,
        city,
      })
      setActivationResult(result)
      setIsSetupMode(result.status === 'error')
      if (result.status === 'success') router.refresh()
    })
  }

  function chooseTab(tab: 'request' | 'activate') {
    setActiveTab(tab)
    setRequestResult(null)
    setActivationResult(null)
    setIsSetupMode(false)
  }

  return (
    <section className="mx-auto max-w-2xl px-4 py-12 sm:px-6">
      <div className="overflow-hidden rounded-3xl border border-brand-100 bg-white shadow-sm">
        <div className="bg-brand-950 px-6 py-7 text-white sm:px-8">
          <p className="text-sm font-bold text-accent-400">خطواتك للمعارض</p>
          <h1 className="mt-2 text-2xl font-extrabold sm:text-3xl">
            بوابة العارضين
          </h1>
          <p className="mt-2 text-sm leading-7 text-brand-100">
            اطلب تفعيل معرضك أو أكمل الدخول باستخدام رقم الهاتف وكود التفعيل.
          </p>
        </div>

        <div
          className="grid grid-cols-1 gap-2 border-b border-brand-100 bg-brand-50/70 p-3 sm:grid-cols-2"
          role="tablist"
          aria-label="خيارات بوابة العارضين"
        >
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'request'}
            onClick={() => chooseTab('request')}
            className={`rounded-xl px-4 py-3 text-sm font-bold transition ${
              activeTab === 'request'
                ? 'bg-brand-900 text-white shadow-sm'
                : 'text-brand-700 hover:bg-white'
            }`}
          >
            طلب تفعيل معرض جديد
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'activate'}
            onClick={() => chooseTab('activate')}
            className={`rounded-xl px-4 py-3 text-sm font-bold transition ${
              activeTab === 'activate'
                ? 'bg-brand-900 text-white shadow-sm'
                : 'text-brand-700 hover:bg-white'
            }`}
          >
            لدي كود تفعيل مسبق (دخول المعرض)
          </button>
        </div>

        <div className="p-6 sm:p-8">
          {activeTab === 'request' ? (
            <div>
              <h2 className="text-xl font-extrabold text-brand-950">
                طلب تفعيل معرض جديد
              </h2>
              <p className="mt-2 text-sm leading-7 text-brand-600">
                اترك بياناتك لتراجع الإدارة طلبك وتتواصل معك عبر واتساب.
              </p>

              {requestResult?.status === 'success' ? (
                <div
                  role="status"
                  className="mt-6 rounded-2xl border border-emerald-200 bg-emerald-50 p-5 text-sm font-medium leading-7 text-emerald-900"
                >
                  {requestResult.message}
                </div>
              ) : (
                <form onSubmit={handleRequestSubmit} className="mt-6 space-y-4">
                  <label className="block space-y-2 text-sm font-semibold text-brand-800">
                    <span>الاسم الكامل للعارض</span>
                    <input
                      type="text"
                      autoComplete="name"
                      required
                      minLength={2}
                      maxLength={120}
                      value={sellerName}
                      readOnly={hasExistingRequest}
                      onChange={(event) => setSellerName(event.target.value)}
                      className={inputClassName}
                    />
                  </label>
                  <label className="block space-y-2 text-sm font-semibold text-brand-800">
                    <span>رقم واتساب مع رمز الدولة</span>
                    <input
                      type="tel"
                      autoComplete="tel"
                      inputMode="tel"
                      required
                      maxLength={16}
                      pattern="[+][1-9][0-9]{7,14}"
                      title="أدخل الرقم الدولي مع علامة + ورمز الدولة."
                      value={phone}
                      onChange={(event) => handleRequestPhoneChange(event.target.value)}
                      onBlur={handleRequestPhoneBlur}
                      className={inputClassName}
                      dir="ltr"
                    />
                  </label>
                  {isLookupPending && (
                    <p role="status" className="text-sm text-brand-600">
                      جارٍ البحث عن طلب سابق لهذا الرقم…
                    </p>
                  )}
                  {requestLookupMessage && (
                    <p role="status" className="text-sm leading-6 text-brand-600">
                      {requestLookupMessage}
                    </p>
                  )}
                  {requestLookupError && (
                    <p role="alert" className="text-sm leading-6 text-rose-700">
                      {requestLookupError}
                    </p>
                  )}
                  <label className="block space-y-2 text-sm font-semibold text-brand-800">
                    <span>اسم المعرض المقترح (اختياري)</span>
                    <input
                      type="text"
                      maxLength={120}
                      value={suggestedStoreName}
                      readOnly={hasExistingRequest}
                      onChange={(event) => setSuggestedStoreName(event.target.value)}
                      className={inputClassName}
                    />
                  </label>
                  {requestResult?.status === 'error' && (
                    <p role="alert" className="text-sm leading-6 text-rose-700">
                      {requestResult.message}
                    </p>
                  )}
                  <button
                    type="submit"
                    disabled={isPending || isLookupPending}
                    className="w-full rounded-xl bg-brand-900 px-5 py-3.5 text-sm font-bold text-white transition hover:bg-brand-800 disabled:cursor-wait disabled:opacity-60"
                  >
                    {isLookupPending
                      ? 'جارٍ استرجاع البيانات…'
                      : isPending
                        ? 'جارٍ إرسال الطلب…'
                        : 'إرسال طلب التفعيل'}
                  </button>
                </form>
              )}
            </div>
          ) : isSetupMode ? (
            <div>
              <h2 className="text-xl font-extrabold text-brand-950">
                أكمل بيانات معرضك
              </h2>
              <p className="mt-2 text-sm leading-7 text-brand-600">
                تم التحقق من كود التفعيل. أضف بيانات المعرض للبدء باستخدام لوحة التحكم.
              </p>
              <form onSubmit={handleSetupSubmit} className="mt-6 space-y-4">
                <label className="block space-y-2 text-sm font-semibold text-brand-800">
                  <span>اسم المعرض</span>
                  <input
                    type="text"
                    required
                    minLength={2}
                    maxLength={120}
                    value={suggestedStoreName}
                    onChange={(event) => setSuggestedStoreName(event.target.value)}
                    className={inputClassName}
                  />
                </label>
                <label className="block space-y-2 text-sm font-semibold text-brand-800">
                  <span>المدينة</span>
                  <input
                    type="text"
                    required
                    minLength={2}
                    maxLength={80}
                    autoComplete="address-level2"
                    value={city}
                    onChange={(event) => setCity(event.target.value)}
                    className={inputClassName}
                  />
                </label>
                {activationResult?.status === 'error' && (
                  <p role="alert" className="text-sm leading-6 text-rose-700">
                    {activationResult.message}
                  </p>
                )}
                <button
                  type="submit"
                  disabled={isPending}
                  className="w-full rounded-xl bg-brand-900 px-5 py-3.5 text-sm font-bold text-white transition hover:bg-brand-800 disabled:cursor-wait disabled:opacity-60"
                >
                  {isPending ? 'جارٍ إنشاء المعرض…' : 'إنشاء المعرض وفتح اللوحة'}
                </button>
              </form>
              <button
                type="button"
                onClick={() => {
                  setIsSetupMode(false)
                  setActivationResult(null)
                }}
                className="mt-4 text-sm font-semibold text-brand-600 underline underline-offset-4"
              >
                استخدام رقم أو كود آخر
              </button>
            </div>
          ) : (
            <div>
              <h2 className="text-xl font-extrabold text-brand-950">
                لدي كود تفعيل مسبق
              </h2>
              <p className="mt-2 text-sm leading-7 text-brand-600">
                أدخل رقم واتساب الذي قدمت به الطلب وكود التفعيل.
              </p>
              <form onSubmit={handleVerifySubmit} className="mt-6 space-y-4">
                <label className="block space-y-2 text-sm font-semibold text-brand-800">
                  <span>رقم الهاتف المسجل</span>
                  <input
                    type="tel"
                    autoComplete="tel"
                    inputMode="tel"
                    required
                    maxLength={16}
                    pattern="[+][1-9][0-9]{7,14}"
                    title="أدخل الرقم الدولي مع علامة + ورمز الدولة."
                    value={phone}
                    onChange={(event) =>
                      setPhone(event.target.value.replace(/\s+/g, ''))
                    }
                    className={inputClassName}
                    dir="ltr"
                  />
                </label>
                <label className="block space-y-2 text-sm font-semibold text-brand-800">
                  <span>كود التفعيل</span>
                  <input
                    type="password"
                    autoComplete="current-password"
                    required
                    maxLength={128}
                    value={accessCode}
                    onChange={(event) => setAccessCode(event.target.value)}
                    placeholder="أدخل كود التفعيل"
                    className={inputClassName}
                    dir="ltr"
                  />
                </label>
                {activationResult?.status === 'error' && (
                  <p role="alert" className="text-sm leading-6 text-rose-700">
                    {activationResult.message}
                  </p>
                )}
                <button
                  type="submit"
                  disabled={isPending}
                  className="w-full rounded-xl bg-brand-900 px-5 py-3.5 text-sm font-bold text-white transition hover:bg-brand-800 disabled:cursor-wait disabled:opacity-60"
                >
                  {isPending ? 'جارٍ التحقق…' : 'التحقق والدخول'}
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
    </section>
  )
}
