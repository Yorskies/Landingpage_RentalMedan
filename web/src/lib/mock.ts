// Placeholder content so the site renders before the client fills Sanity.
// NEVER ship this to production: names, number and prices below are fake (see plan §2.3).
import type { Car, SiteSettings, Testimonial } from './types'

const driverNote = 'Termasuk supir 12 jam, belum termasuk BBM & Tol'
const selfDriveNote = 'Sewa 24 jam, syarat & ketentuan berlaku'
const base = { isFeatured: false, isAvailable: true, driverNote }

export const mockCars: Car[] = [
  { ...base, _id: 'mock-brio', name: 'Honda Brio RS', slug: 'honda-brio-rs', category: 'City Car', image: { url: '/mock/honda-brio.svg' }, imageAlt: 'Foto contoh Honda Brio RS', priceSelfDrive: 350000, priceWithDriver: 550000, transmission: 'Automatic (AT)', fuelType: 'Bensin', seats: 5, selfDriveNote, orderRank: 10 },
  { ...base, _id: 'mock-avanza', name: 'Toyota Avanza', slug: 'toyota-avanza', category: 'MPV Keluarga', image: { url: '/mock/toyota-avanza.svg' }, imageAlt: 'Foto contoh Toyota Avanza', priceSelfDrive: 450000, priceWithDriver: 650000, transmission: 'AT / MT', fuelType: 'Bensin', seats: 7, selfDriveNote, orderRank: 20 },
  { ...base, _id: 'mock-innova', name: 'Toyota Innova Reborn', slug: 'toyota-innova-reborn', category: 'MPV Keluarga', image: { url: '/mock/toyota-innova-reborn.svg' }, imageAlt: 'Foto contoh Toyota Innova Reborn', isFeatured: true, priceSelfDrive: 550000, priceWithDriver: 750000, transmission: 'Automatic (AT)', fuelType: 'Diesel', seats: 7, selfDriveNote, orderRank: 30 },
  { ...base, _id: 'mock-pajero', name: 'Mitsubishi Pajero Sport', slug: 'mitsubishi-pajero-sport', category: 'SUV Premium', image: { url: '/mock/mitsubishi-pajero-sport.svg' }, imageAlt: 'Foto contoh Mitsubishi Pajero Sport', priceSelfDrive: 1100000, priceWithDriver: 1400000, transmission: 'Automatic (AT)', fuelType: 'Diesel', seats: 7, selfDriveNote, orderRank: 40 },
  // Unavailable on purpose: exercises the "Sedang Disewa" state
  { ...base, _id: 'mock-fortuner', name: 'Toyota Fortuner', slug: 'toyota-fortuner', category: 'SUV Premium', image: { url: '/mock/toyota-fortuner.svg' }, imageAlt: 'Foto contoh Toyota Fortuner', isAvailable: false, priceSelfDrive: 1200000, priceWithDriver: 1500000, transmission: 'Automatic (AT)', fuelType: 'Diesel', seats: 7, selfDriveNote, orderRank: 50 },
  // Single-package unit (driver only): exercises the toggle edge case
  { ...base, _id: 'mock-hiace', name: 'Toyota Hiace', slug: 'toyota-hiace', category: 'Minibus', image: { url: '/mock/toyota-hiace.svg' }, imageAlt: 'Foto contoh Toyota Hiace', priceWithDriver: 1200000, transmission: 'Manual (MT)', fuelType: 'Diesel', seats: 14, orderRank: 60 },
]

export const mockSiteSettings: SiteSettings = {
  brandName: 'Rental Mobil Medan (Contoh)',
  whatsappNumber: '6280000000000',
  officeAddress: 'Alamat contoh, Medan, Sumatera Utara',
  operatingHours: 'Setiap hari, 07.00 – 22.00 WIB (contoh)',
  keyTermsHighlights: ['Overtime dihitung per jam (contoh)', 'Deposit dikembalikan saat unit kembali (contoh)'],
  termsSelfDrive: ['E-KTP asli dan SIM A yang masih berlaku (contoh)', 'Deposit sesuai kesepakatan (contoh)'],
  termsWithDriver: ['Supir berpengalaman, 12 jam per hari (contoh)', 'BBM, tol, dan parkir ditanggung penyewa (contoh)'],
  cancellationPolicy: ['Pembatalan maksimal H-1 tanpa biaya (contoh)'],
}

export const mockTestimonials: Testimonial[] = [
  { _id: 'mock-t1', name: 'Pelanggan Contoh A', role: 'Medan', quote: 'Teks testimoni contoh. Ganti dengan ulasan asli dari pelanggan.', rating: 5, orderRank: 10, isSample: true },
  { _id: 'mock-t2', name: 'Pelanggan Contoh B', role: 'Jakarta', quote: 'Teks testimoni contoh. Ganti dengan ulasan asli dari pelanggan.', rating: 5, orderRank: 20, isSample: true },
  { _id: 'mock-t3', name: 'Pelanggan Contoh C', role: 'Pekanbaru', quote: 'Teks testimoni contoh. Ganti dengan ulasan asli dari pelanggan.', rating: 5, orderRank: 30, isSample: true },
]
