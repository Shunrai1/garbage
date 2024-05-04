import request from '@/utils/request'
import {
  GProcessResponseData,
  GStationResponseData,
  StationResponseData,
} from './type'

enum API {
  ALLGPROCESS_URL = '/gprocess/getAll',
  ALLSTATION_URL = '/station/getAll',
  STATIONBYIDS = '/station/getMany/',
}

export const reqStationByIdsAPI = (ids: string) =>
  request.get<any, StationResponseData>(API.STATIONBYIDS + ids)
export const reqAllStationAPI = () =>
  request.get<any, StationResponseData>(API.ALLSTATION_URL)

export const reqAllGProcessAPI = () =>
  request.get<any, GProcessResponseData>(API.ALLGPROCESS_URL)
