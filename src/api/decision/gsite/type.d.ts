export interface ResponseData {
  code: number
  message: string
  ok: boolean
}

export interface GSite {
  id: number
  address: string
  area: string
  description: string
  lat: number
  lon: number
  label: string
  street: string
}

export interface Site {
  gid: number
  address: string
  area: string
  description: string
  latitude: number
  longitude: number
  label: string
  street: string
  ogcapacity: number
  kwcapacity: number
}

export type GSiteList = GSite[]
export type SiteList = Site[]

export interface SiteResponseData extends ResponseData {
  data: SiteList
}
export interface GSiteResponseData extends ResponseData {
  data: GSiteList
}
