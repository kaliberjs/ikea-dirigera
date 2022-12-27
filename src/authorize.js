const crypto = require('crypto')
const { fetch } = require('./machinery/fetch')
const { repeatUntilResult, timeoutSignal } = require('./machinery/repeatUntilResult')

module.exports = { authorize }

async function authorize({ ip, port, name }) {
  const { authorizationCode, verifier } = await getAuthorizationCode({ ip, port })

  try {
    console.log('Press the action button on the bottom of the DIRIGERA within the next 10 seconds')
    const result = await repeatUntilResult(
      { timeBetween: 200, timeout: 10000 },
      async () => getAccessToken({ ip, port, name, authorizationCode, verifier })
    )
    return result
  } catch (e) {
    if (e === timeoutSignal) throw new Error(`Unable to obtain response within 10 seconds`)
    throw e
  }
}

async function getAuthorizationCode({ ip, port }) {
  const verifier = createRandomString()

  const params = new URLSearchParams({
    audience: 'homesmart.local',
    response_type: 'code',
    code_challenge: createCodeChallenge(verifier),
    code_challenge_method: 'S256'
  }).toString()

  const response = await fetch(`https://${ip}:${port}/v1/oauth/authorize?${params}`)

  if (response.status === 409)
    throw new Error(`Already pairing, wait for DIRIGERA to timeout on the pending request`)
  if (!response.ok)
    throw new Error(`${response.status}:\n${await response.text()}`)

  const { code } = await response.json()

  return { authorizationCode: code, verifier }
}

async function getAccessToken({ ip, port, name, authorizationCode, verifier }) {
  const response = await fetch(
    `https://${ip}:${port}/v1/oauth/token`,
    {
      method: 'POST',
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        name,
        grant_type: 'authorization_code',
        code: authorizationCode,
        code_verifier: verifier,
      }).toString(),
    }
  )

  const body = await response.text()

  if (response.status === 403) {
    const { error } = JSON.parse(body)
    if (error === 'Pairing') return null
  }
  if (!response.ok) throw new Error(`${response.status}:\n${body}`)

  const { access_token } = JSON.parse(body)
  return { accessToken: access_token }
}

function createCodeChallenge(str) {
  const sha256Hash = crypto.createHash('sha256')
  sha256Hash.update(str)
  const digest = sha256Hash.digest()
  const sha256HashAsBase64 = Buffer.from(digest)
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '')
  return sha256HashAsBase64
}

function createRandomString() {
  return Array.from(Array(128)).reduce(result => result + createRandomChar(), '')
}

const CODE_ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-._~'
function createRandomChar() {
  return CODE_ALPHABET[Math.floor(Math.random() * CODE_ALPHABET.length)]
}
