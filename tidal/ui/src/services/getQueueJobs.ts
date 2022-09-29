import axios from 'axios'
import { tidalApiEndpoint, tidalTokenKey } from '../config/global'

const AUTH_TOKEN = localStorage.getItem(tidalTokenKey)
axios.defaults.headers.common['X-API-Key'] = `${AUTH_TOKEN}`

export function getQueueJobs() {
  return axios(`${tidalApiEndpoint}/queues/adaptiveTranscode/jobs`).then(result => result.data)
}
