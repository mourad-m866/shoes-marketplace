'use client'

import {PatchEvent, set, type StringInputProps} from 'sanity'

import {normalizePhone} from '@/lib/phone'

export function PhoneInput({onChange, value}: StringInputProps) {
  return (
    <input
      type="tel"
      inputMode="tel"
      value={value ?? ''}
      onChange={(event) =>
        onChange(PatchEvent.from(set(normalizePhone(event.currentTarget.value))))
      }
      className="w-full rounded border border-gray-300 px-3 py-2"
      dir="ltr"
    />
  )
}
