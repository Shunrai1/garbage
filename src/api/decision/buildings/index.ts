import request from '@/utils/request'

enum API {
  ALLBUILDINGS_URL = '/buildings/getAll',
}
export const reqAllBuildingsAPI = () =>
  request.get<any, any>(API.ALLBUILDINGS_URL)
