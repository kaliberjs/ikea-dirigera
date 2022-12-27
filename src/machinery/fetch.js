const fetch = require('node-fetch').default
const https = require('https')

const agent = new https.Agent({
  rejectUnauthorized: false
})

module.exports = { fetch: unsafeFetch, agent }

async function unsafeFetch(url, options) {
  return fetch(url, { ...options, agent })
}
