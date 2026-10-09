declare module 'philippines' {
  interface Region {
    name: string
    long: string
    key: string
  }

  interface Province {
    name: string
    region: string
    key: string
  }

  interface City {
    name: string
    province: string
    city: boolean
  }

  const data: {
    regions: Region[]
    provinces: Province[]
    cities: City[]
  }

  export default data
}
