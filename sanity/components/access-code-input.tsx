'use client'

import { useState } from 'react'
import { PatchEvent, set, type StringInputProps } from 'sanity'

const MIN_CODE_LENGTH = 20

export function AccessCodeInput({onChange, value}: StringInputProps) {
  const [code, setCode] = useState('')
  const [message, setMessage] = useState('')

  async function saveCode(submittedCode = code) {
    const normalizedCode = submittedCode.trim()
    if (!normalizedCode) return

    if (normalizedCode.length < MIN_CODE_LENGTH) {
      setMessage(`يجب أن يتكون الكود من ${MIN_CODE_LENGTH} حرفًا على الأقل.`)
      return
    }

    try {
      const digest = await crypto.subtle.digest(
        'SHA-256',
        new TextEncoder().encode(normalizedCode),
      )
      const hash = Array.from(new Uint8Array(digest))
        .map((byte) => byte.toString(16).padStart(2, '0'))
        .join('')
      onChange(PatchEvent.from(set(hash)))
      setMessage('تم حفظ بصمة الكود. انسخ الكود الظاهر وشاركه مع العارض.')
    } catch (cause) {
      console.error('[AccessCodeInput] failed to hash seller code', cause)
      setMessage('تعذّر تشفير الكود. يرجى المحاولة مجددًا.')
    }
  }

  function generateCode() {
    const bytes = crypto.getRandomValues(new Uint8Array(24))
    const binary = Array.from(bytes, (byte) => String.fromCharCode(byte)).join('')
    const generatedCode = btoa(binary)
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/g, '')
    setCode(generatedCode)
    setMessage('انسخ الكود الجديد وشاركه مع العارض قبل مغادرة الحقل.')
    void saveCode(generatedCode)
  }

  return (
    <div>
      <div className="flex flex-wrap gap-2">
        <input
          type="text"
          value={code}
          maxLength={128}
          onChange={(event) => {
            setCode(event.target.value)
            setMessage('')
          }}
          onBlur={() => void saveCode()}
          placeholder={value ? 'أدخل كودًا جديدًا لاستبدال الحالي' : 'أدخل كودًا عشوائيًا قويًا'}
          className="min-w-72 flex-1 rounded border border-gray-300 px-3 py-2"
          dir="ltr"
        />
        <button
          type="button"
          onClick={generateCode}
          className="rounded border border-gray-300 px-3 py-2 text-sm"
        >
          إنشاء كود قوي
        </button>
      </div>
      <p className="mt-2 text-sm text-gray-600">
        {message ||
          (value
            ? 'يوجد كود محفوظ بصيغة مشفّرة. أدخل كودًا جديدًا لتغييره.'
            : 'يُحفظ الكود كبصمة ولا يمكن عرضه لاحقًا؛ احتفظ بنسخة منه قبل الحفظ.')}
      </p>
    </div>
  )
}
