import axios from 'axios'

export async function getVersion() {
  const response = await axios.get('/api/version')
  return 'v' + (response.data ?? 'Unknown Version')
}
