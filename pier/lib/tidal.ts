import axios from 'axios'

function getTidalUrl() {
  if (process.env.TIDAL_API_URL) {
    return process.env.TIDAL_API_URL
  }
  throw new Error('TIDAL_API_URL is undefined')
}

export async function createAsset(input: string) {
  const { data } = await axios.post(`${getTidalUrl()}/assets`, {
    input,
  })
  return data.data
}

export async function deleteAsset(assetId: string) {
  const deleteUrl = `${getTidalUrl()}/assets/${assetId.toString()}`
  await axios.delete(deleteUrl).catch((e) => console.error(e))
}