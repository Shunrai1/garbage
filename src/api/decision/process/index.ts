import request from '@/utils/request'
import { ResponseProcessData } from './type'

enum API {
  ALLGPROCESS_URL = '/process/getAll',
  ManyByIds_URL = '/process/getMany/',
}

export const getAllProcessAPI = () =>
  request.get<any, ResponseProcessData>(API.ALLGPROCESS_URL)
export const getManyProcessByIdsAPI = (ids: any) =>
  request.get<any, ResponseProcessData>(API.ManyByIds_URL + ids)
