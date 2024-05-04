export interface ResponseData {
  code: number
  message: string
  ok: boolean
}
export interface trunk {
  id: number
  carnumber: string
  load: number
  did: number
  type: number
}

export interface Depot {
  gid: number
  lat: number
  lon: number
  name: string
  trunks?: trunk[]
}

export type DepotList = Depot[]

export interface DepotResponseData extends ResponseData {
  data: DepotList
}
