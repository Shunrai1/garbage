import axios from 'axios'

export const TransformAPI = (lon: number, lat: number) => {
  const url = `https://restapi.amap.com/v3/assistant/coordinate/convert?locations=${lon},${lat}&coordsys=gps&key=533d2197227b2c2977df04fc3d2ba86f`
  return axios.get(url)
}
