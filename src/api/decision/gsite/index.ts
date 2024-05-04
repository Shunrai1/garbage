import request from '@/utils/request'
import { SiteResponseData } from './type'
import { da } from 'element-plus/es/locales.mjs'

enum API {
  SITEBYIDS_URL = '/site/getMany/',
  COMPUTELM_URL = '/site/computeLM',
  CHECK_URL = '/site/check',
  ROUTEP_URL = '/site/routePlan/',
  KITCOMPUTE_URL = '/site/kitcomputeLM',
  KITCHECK_URL = '/site/kitcheck',
  PAGESITE_URL = '/site/getAll',
  GETRATE_URL = '/site/getRate',
}

export const routePlanAPI = (ids: string, data: any, type: string) =>
  request.post<any, any>(API.ROUTEP_URL + ids + '/' + type, data)
export const reqCheckAPI = () => request.get<any, any>(API.CHECK_URL)
export const reqComputeLMAPI = (data: any) =>
  request.put<any, any>(API.COMPUTELM_URL, data)
export const reqSiteByIdsAPI = (ids: string) =>
  request.get<any, SiteResponseData>(API.SITEBYIDS_URL + ids)
export const reqKITComputeAPI = (data: any) =>
  request.put<any, any>(API.KITCOMPUTE_URL, data)
export const reqKITCheckAPI = () => request.get<any, any>(API.KITCHECK_URL)
export const reqAllSiteAPI = (
  current: number | null,
  pageSize: number | null,
  keyword: string | null,
) => {
  if (current == null && pageSize == null && keyword == null) {
    return request.get<any, any>(API.PAGESITE_URL)
  } else {
    return request.get<any, SiteResponseData>(
      API.PAGESITE_URL +
        '?current=' +
        current +
        '&PAGE_SIZE=' +
        pageSize +
        '&keyword=' +
        keyword,
    )
  }
}
export const reqGetRateAPI = () => request.get<any, any>(API.GETRATE_URL)
