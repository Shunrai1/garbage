import request from '@/utils/request'

enum API {
  ALLBUILDINGS_URL = '/candidate/getAll',
  SITEDECISION_URL = '/candidate/decision',
}
export const reqAllCandidateAPI = () =>
  request.get<any, any>(API.ALLBUILDINGS_URL)
export const reqDecisionAPI = (data: any) =>
  request.post<any, any>(API.SITEDECISION_URL, data)
