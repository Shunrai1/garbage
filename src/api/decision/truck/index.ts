import request from '@/utils/request'
import { ResponseProcessData } from './type'

enum API {
  GETALLTRUCK_URL = '/trunk/getall',
}

export const getAllTruckAPI = (
  current: number | null,
  pageSize: number | null,
  keyword: string | null,
) => {
  if (current == null && pageSize == null && keyword == null) {
    return request.get<any, any>(API.GETALLTRUCK_URL)
  } else {
    return request.get<any, any>(
      API.GETALLTRUCK_URL +
        '?current=' +
        current +
        '&PAGE_SIZE=' +
        pageSize +
        '&keyword=' +
        keyword,
    )
  }
}
