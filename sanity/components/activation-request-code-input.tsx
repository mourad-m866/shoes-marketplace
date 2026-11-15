'use client'

import {PatchEvent, set, type StringInputProps} from 'sanity'

const CODE_LENGTH = 12
const CODE_CHARACTERS = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'

export function ActivationRequestCodeInput({onChange, value}: StringInputProps) {
  function generateCode() {
    const bytes = crypto.getRandomValues(new Uint8Array(CODE_LENGTH))
    const code = Array.from(bytes, (byte) =>
      CODE_CHARACTERS.charAt(byte & 31),
    ).join('')

    onChange(PatchEvent.from(set(code)))
  }

  return (
    <div>
      <div className="flex flex-wrap gap-2">
        <input
          type="text"
          value={value ?? ''}
          maxLength={128}
          onChange={(event) =>
            onChange(PatchEvent.from(set(event.currentTarget.value)))
          }
          placeholder="أنشئ كودًا أو أدخله يدويًا"
          className="min-w-72 flex-1 rounded border border-gray-300 px-3 py-2"
          dir="ltr"
        />
        <button
          type="button"
          onClick={generateCode}
          className="rounded border border-gray-300 px-3 py-2 text-sm"
        >
          إنشاء كود عشوائي (12 رمزًا)
        </button>
      </div>
      <p className="mt-2 text-sm text-gray-600">
        الكود المولّد يتكون من 12 حرفًا ورقمًا؛ احفظ الطلب ثم أرسله للعارض عبر واتساب.
      </p>
    </div>
  )
}
