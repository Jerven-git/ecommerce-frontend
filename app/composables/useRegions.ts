import { State, City } from 'country-state-city'
import isoCountries from 'i18n-iso-countries'
import ph from 'philippines'

/**
 * Returns state/province names for a given country name,
 * and city names for a given country + state name.
 *
 * Uses the `philippines` package for PH (complete data),
 * and `country-state-city` for all other countries.
 */
export function useRegions() {

  function getCountryCode(countryName: string): string | null {
    if (!countryName) return null
    const entries = Object.entries(isoCountries.getNames('en', { select: 'official' }))
    const match = entries.find(([, name]) =>
      (name as string).toLowerCase() === countryName.toLowerCase()
    )
    return match ? match[0] : null
  }

  function getStates(countryName: string): string[] {
    const code = getCountryCode(countryName)
    if (!code) return []

    // Philippines: use dedicated package
    if (code === 'PH') {
      return ph.provinces
        .map((p: any) => p.name as string)
        .sort((a: string, b: string) => a.localeCompare(b))
    }

    // Other countries: use country-state-city
    return State.getStatesOfCountry(code)
      .map(s => s.name)
      .sort((a, b) => a.localeCompare(b))
  }

  function getCities(countryName: string, stateName: string): string[] {
    const countryCode = getCountryCode(countryName)
    if (!countryCode || !stateName) return []

    // Philippines: use dedicated package
    if (countryCode === 'PH') {
      const province = ph.provinces.find(
        (p: any) => (p.name as string).toLowerCase() === stateName.toLowerCase()
      )
      if (!province) return []
      return ph.cities
        .filter((c: any) => c.province === province.key)
        .map((c: any) => c.name as string)
        .sort((a: string, b: string) => a.localeCompare(b))
    }

    // Other countries: use country-state-city
    const state = State.getStatesOfCountry(countryCode)
      .find(s => s.name.toLowerCase() === stateName.toLowerCase())
    if (!state) return []
    return [...new Set(
      City.getCitiesOfState(countryCode, state.isoCode).map(c => c.name)
    )].sort((a, b) => a.localeCompare(b))
  }

  return { getStates, getCities }
}
