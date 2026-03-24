import type { PriceValue } from '~/types/pricing'

export function formatPrice(value: PriceValue | undefined | null): string {
  if (!value || value.amount === null) return '—'
  const num = value.amount.toLocaleString('sk-SK', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  })
  return `${num} ${value.unit}`
}

export function parsePrice(text: string): number | null {
  const cleaned = text.replace(/,/g, '.').replace(/[^\d.]/g, '')
  const num = parseFloat(cleaned)
  return isNaN(num) ? null : num
}
