export interface ResponseData {
  code: number
  message: string
  ok: boolean
}

export interface GStation {
  id: number
  area: string
  street: string
  name: string
  address: string
  number: number
  deal: number
  type: string
  buildarea: number
  department: string
  unit: string
  station: string
  cmethod: string
  dmethod: string
  lon: number
  lat: number
}

export interface Station {
  gid: number
  area: string
  street: string
  name: string
  address: string
  number: number
  deal: number
  type: string
  buildarea: number
  department: string
  unit: string
  station: string
  cmethod: string
  dmethod: string
  lon: number
  lat: number
}

export type GStationList = GStation[]
export type StationList = Station[]

export interface StationResponseData extends ResponseData {
  data: StationList
}
export interface GStationResponseData extends ResponseData {
  data: GStationList
}

export interface GProcess {
  id: number
  name: string
  description: string
  lon: number
  lat: number
}
export type GProcessList = GProcess[]
export interface GProcessResponseData extends ResponseData {
  data: GProcessList
}
