export interface ResponseData {
  code: number
  message: string
  ok: boolean
}
export interface Process {
  gid: number
  name: string
  lat: number
  lon: number
}
export type ProcessList = Process[]
export interface ResponseProcessData extends ResponseData {
  data: ProcessList
}
