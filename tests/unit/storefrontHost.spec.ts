import { describe, expect, it } from 'vitest'
import { isApexHostname } from '~/utils/storefrontHost'

describe('storefront host classification', () => {
  it.each([
    ['localhost', 'localhost'],
    ['databasy.com', 'databasy.com'],
    ['www.databasy.com', 'databasy.com'],
    ['DATABASY.COM.', 'databasy.com'],
  ])('recognises %s as the Apex host for %s', (hostname, baseDomain) => {
    expect(isApexHostname(hostname, baseDomain)).toBe(true)
  })

  it.each([
    ['store.localhost', 'localhost'],
    ['merchant.databasy.com', 'databasy.com'],
    ['merchant.example.com', 'databasy.com'],
    ['', 'databasy.com'],
  ])('keeps %s outside the Apex host for %s', (hostname, baseDomain) => {
    expect(isApexHostname(hostname, baseDomain)).toBe(false)
  })
})
