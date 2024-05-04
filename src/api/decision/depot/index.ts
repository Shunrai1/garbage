import request from '@/utils/request'
import { DepotResponseData } from './type'

enum API {
  ALLDEPOT_URL = '/depot/getAll',
  DEPOTBYIDS_URL = '/depot/getMany/',
}
export const reqAllDepotAPI = () =>
  request.get<any, DepotResponseData>(API.ALLDEPOT_URL)

export const reqDepotByIdsAPI = (ids: string) =>
  request.get<any, DepotResponseData>(API.DEPOTBYIDS_URL + ids)
