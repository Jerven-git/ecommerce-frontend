import countries from 'i18n-iso-countries'
import enLocale from 'i18n-iso-countries/langs/en.json'

countries.registerLocale(enLocale)

export interface Country {
  code: string
  name: string
}

export function useCountries() {
  const list: Country[] = Object.entries(countries.getNames('en', { select: 'official' }))
    .map(([code, name]) => ({ code, name: name as string }))
    .sort((a, b) => a.name.localeCompare(b.name))

  return { countries: list }
}
