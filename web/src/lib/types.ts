export type CarCategory = 'City Car' | 'MPV Keluarga' | 'SUV Premium' | 'Minibus'

/** A Sanity image object, or a plain URL (mock data). */
export type CarImage = { url: string } | { asset: { _ref: string }; hotspot?: unknown; crop?: unknown }

export interface Car {
  _id: string
  name: string
  slug?: string
  category: CarCategory
  image: CarImage
  imageAlt: string
  isAvailable: boolean
  isFeatured: boolean
  priceSelfDrive?: number | null
  priceWithDriver?: number | null
  transmission?: string | null
  fuelType?: string | null
  seats: number
  driverNote?: string | null
  selfDriveNote?: string | null
  orderRank: number
}

export interface SiteSettings {
  brandName: string
  whatsappNumber: string
  officeAddress?: string | null
  operatingHours?: string | null
  keyTermsHighlights?: string[] | null
  termsSelfDrive?: string[] | null
  termsWithDriver?: string[] | null
  cancellationPolicy?: string[] | null
}

export interface Testimonial {
  _id: string
  name: string
  role?: string | null
  quote: string
  rating: number
  orderRank: number
  /** true for built-in sample data only */
  isSample?: boolean
}
