import { sanityClient } from 'sanity:client'
import { createImageUrlBuilder } from '@sanity/image-url'
import { defineQuery } from 'groq'
import { mockCars, mockSiteSettings, mockTestimonials } from './mock'
import type { Car, CarImage, SiteSettings, Testimonial } from './types'

export type { Car, CarImage, SiteSettings, Testimonial } from './types'

const hasProject = Boolean(import.meta.env.PUBLIC_SANITY_PROJECT_ID)

/**
 * Mock data is used when there is no Sanity project, when PUBLIC_USE_MOCK_DATA=true,
 * or during `astro dev` while the dataset is still empty. A production build against
 * an empty dataset renders empty sections instead of fake content.
 */
const forceMock = !hasProject || import.meta.env.PUBLIC_USE_MOCK_DATA === 'true'
const useMock = (isEmpty: boolean) => forceMock || (isEmpty && import.meta.env.DEV)

const CARS_QUERY = defineQuery(`*[_type == "car"] | order(orderRank asc, _createdAt desc){
  _id, name, "slug": slug.current, category, image, imageAlt,
  "isAvailable": coalesce(isAvailable, true), "isFeatured": coalesce(isFeatured, false),
  priceSelfDrive, priceWithDriver, transmission, fuelType, seats,
  driverNote, selfDriveNote, "orderRank": coalesce(orderRank, 10)
}`)
const SETTINGS_QUERY = defineQuery(`*[_type == "siteSettings"][0]`)
const TESTIMONIALS_QUERY = defineQuery(`*[_type == "testimonial"] | order(orderRank asc){
  _id, name, role, quote, rating, "orderRank": coalesce(orderRank, 10)
}`)

export async function getCars(): Promise<Car[]> {
  const cars = hasProject ? ((await sanityClient.fetch(CARS_QUERY)) as Car[]) : []
  return useMock(cars.length === 0) ? mockCars : cars
}

export async function getSiteSettings(): Promise<SiteSettings | null> {
  const settings = hasProject ? ((await sanityClient.fetch(SETTINGS_QUERY)) as SiteSettings | null) : null
  if (!settings && !useMock(true)) console.warn('[sanity] No siteSettings document found: WhatsApp number, address and terms will be missing.')
  return useMock(!settings) ? mockSiteSettings : settings
}

export async function getTestimonials(): Promise<Testimonial[]> {
  const items = hasProject ? ((await sanityClient.fetch(TESTIMONIALS_QUERY)) as Testimonial[]) : []
  return useMock(items.length === 0) ? mockTestimonials : items
}

const builder = createImageUrlBuilder(sanityClient)

/** Sanity image -> builder with WebP/AVIF negotiation and no upscaling. Mock images have no builder. */
export const urlFor = (source: Exclude<CarImage, { url: string }>) => builder.image(source).auto('format').fit('max')

/** Image URL at a given width; plain URLs (mock) pass through unchanged. */
export function imageSrc(image: CarImage, width: number): string {
  return 'url' in image ? image.url : urlFor(image).width(width).url()
}

/** `srcset` string for responsive widths; mock images return undefined. */
export function imageSrcset(image: CarImage, widths: number[]): string | undefined {
  return 'url' in image ? undefined : widths.map((w) => `${urlFor(image).width(w).url()} ${w}w`).join(', ')
}
