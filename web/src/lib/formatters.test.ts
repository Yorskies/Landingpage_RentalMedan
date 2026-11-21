import { test } from 'node:test'
import assert from 'node:assert/strict'
import { formatIDR, buildWhatsAppUrl, getMinPrice, buildCarMessage } from './formatters.ts'

test('formatIDR', () => {
  assert.equal(formatIDR(550000), 'Rp 550.000')
  assert.equal(formatIDR(1100000), 'Rp 1.100.000')
  assert.equal(formatIDR(0), 'Rp 0')
})

test('buildWhatsAppUrl encodes the message', () => {
  assert.equal(buildWhatsAppUrl('628123', 'Halo & salam?'), 'https://wa.me/628123?text=Halo%20%26%20salam%3F')
})

test('getMinPrice ignores missing prices', () => {
  assert.equal(getMinPrice([{ priceWithDriver: 1200000 }, { priceSelfDrive: 350000, priceWithDriver: 550000 }]), 350000)
  assert.equal(getMinPrice([{}]), null)
  assert.equal(getMinPrice([]), null)
})

test('buildCarMessage follows the plan format and switches wording when rented out', () => {
  assert.equal(
    buildCarMessage('Toyota Avanza', 'lepas_kunci', 450000, true),
    'Halo Admin, saya melihat dari website. Apakah unit Toyota Avanza (Paket Lepas Kunci - Rp 450.000/hari) tersedia untuk disewa?',
  )
  assert.match(buildCarMessage('Toyota Fortuner', 'dengan_supir', 1500000, false), /Kapan unit Toyota Fortuner \(Paket Dengan Supir - Rp 1\.500\.000\/hari\) tersedia kembali/)
})
