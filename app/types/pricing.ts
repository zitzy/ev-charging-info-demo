export type ProviderId = 'zse-drive' | 'greenway' | 'ejoin' | 'ionity' | 'tesla'
export type ChargingType = 'AC' | 'DC' | 'UFC'
export type PriceCategoryId =
  | 'monthly-fee'
  | 'rfid-card'
  | 'free-kwh'
  | 'free-kwh-recalculated'
  | 'home-sk'
  | 'domestic-roaming'
  | 'international-roaming'

export interface PriceValue {
  amount: number | null // null = N/A or not applicable
  unit: string // "EUR", "EUR/kWh", "kWh", "EUR/mes."
  note?: string
}

// Charging-type categories have per-type values + optional note
export interface ChargingTypePricing extends Partial<Record<ChargingType, PriceValue>> {
  _note?: string
}

// A plan's full pricing data: simple values + per-charging-type values
export interface PlanData {
  planId: string
  'monthly-fee'?: PriceValue
  'rfid-card'?: PriceValue
  'free-kwh'?: PriceValue
  'free-kwh-recalculated'?: PriceValue
  'home-sk'?: ChargingTypePricing
  'domestic-roaming'?: ChargingTypePricing
  'international-roaming'?: ChargingTypePricing
}

export interface ProviderPricing {
  providerId: ProviderId
  plans: PlanData[]
}

export interface PricingDataset {
  lastUpdated: string // ISO 8601
  dataSource: 'seed' | 'scraped'
  providers: ProviderPricing[]
}

// Static metadata types (colors, names, plan labels)
export interface PlanMeta {
  id: string
  name: string
}

export interface ProviderMeta {
  id: ProviderId
  name: string
  color: string // Tailwind color name: red, green, yellow, pink
  colorHex: string
  website: string
  plans: PlanMeta[]
}

export interface PriceCategory {
  id: PriceCategoryId
  labelSk: string
  hasChargingTypes: boolean
}
