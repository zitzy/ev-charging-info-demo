import type { ProviderMeta, PriceCategory, ChargingType } from '~/types/pricing'

export const PROVIDERS: ProviderMeta[] = [
  {
    id: 'zse-drive',
    name: 'ZSE Drive',
    color: 'red',
    colorHex: '#e53e3e',
    website: 'https://zsedrive.sk',
    plans: [
      { id: 'eco', name: 'ECO' },
      { id: 'start', name: 'START' },
      { id: 'partner-safe', name: 'Partner Safe' },
      { id: 'road-safe', name: 'Road Safe' },
      { id: 'flat-safe', name: 'Flat Safe' },
    ],
  },
  {
    id: 'greenway',
    name: 'GreenWay',
    color: 'green',
    colorHex: '#38a169',
    website: 'https://greenway.sk',
    plans: [
      { id: 'standard', name: 'STANDARD' },
      { id: 'plus', name: 'PLUS' },
      { id: 'max', name: 'MAX' },
      { id: 'premium', name: 'PREMIUM' },
    ],
  },
  {
    id: 'ejoin',
    name: 'ejoin',
    color: 'yellow',
    colorHex: '#d69e2e',
    website: 'https://ejoin.eu',
    plans: [
      { id: 'default', name: 'Štandard' },
    ],
  },
  {
    id: 'ionity',
    name: 'Ionity',
    color: 'pink',
    colorHex: '#d53f8c',
    website: 'https://ionity.eu',
    plans: [
      { id: 'motion', name: 'Motion' },
      { id: 'power', name: 'Power' },
    ],
  },
  {
    id: 'tesla',
    name: 'Tesla Supercharger',
    color: 'red',
    colorHex: '#cc0000',
    website: 'https://www.tesla.com/findus/list/superchargers/Slovakia',
    plans: [
      { id: 'standard', name: 'Štandard' },
    ],
  },
]

export const PRICE_CATEGORIES: PriceCategory[] = [
  { id: 'monthly-fee', labelSk: 'Mesačný poplatok', hasChargingTypes: false },
  { id: 'rfid-card', labelSk: 'Vydanie RFID karty', hasChargingTypes: false },
  { id: 'free-kwh', labelSk: 'Voľné kWh vo vlastnej sieti', hasChargingTypes: false },
  { id: 'free-kwh-recalculated', labelSk: 'Prepočet ceny voľných kWh', hasChargingTypes: false },
  { id: 'home-sk', labelSk: 'Domáca sieť na SK', hasChargingTypes: true },
  { id: 'domestic-roaming', labelSk: 'Domáci roaming', hasChargingTypes: true },
  { id: 'international-roaming', labelSk: 'Medzinárodný roaming', hasChargingTypes: true },
]

export const CHARGING_TYPES: ChargingType[] = ['AC', 'DC', 'UFC']
