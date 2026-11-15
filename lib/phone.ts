export function normalizePhone(phone: string): string {
  const compact = phone.trim().replace(/[\s().-]/g, '')
  return compact.startsWith('00') ? `+${compact.slice(2)}` : compact
}

export function isValidInternationalPhone(phone: string): boolean {
  return /^\+[1-9]\d{7,14}$/.test(normalizePhone(phone))
}
