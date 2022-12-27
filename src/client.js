const { fetch } = require('./machinery/fetch')

module.exports = { createClient }

function createClient({ ip, port, accessToken }) {

  const client = {
    async listDevices() {
      return callDirigera('/v1/devices')
    },

    async patchDevice(id, patches) {
      const response = await callDirigera(
        `/v1/devices/${id}`,
        {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(patches)
        }
      )
    },

    async patchDeviceAttributes(id, patches) {
      return client.patchDevice(id, patches.map(attributes => ({ attributes })))
    },
  }

  return client

  async function callDirigera(endpoint, options = {}) {
    const response = await fetch(
      `https://${ip}:${port}${endpoint}`,
      {
        ...options,
        headers: {
          ...options.headers,
          'Authorization': `Bearer ${accessToken}`
        }
      }
    )

    const body = await response.text()
    if (!response.ok) throw new Error(`${response.status}:\n${body}`)

    const result = body.length ? JSON.parse(body) : null
    return result
  }
}
