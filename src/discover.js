const createMdns = require('mdns-server')

/**
 * @typedef {import('events').EventEmitter &
 *   {
 *     destroy(cb: (e?: Error) => void ):void,
 *     query(query: Array<{ name, type }>):void,
 *     initServer():void,
 *   }
 * } Mdns
 */

const domain = '_ihsp._tcp.local'
const ipv4 = Symbol('ipv4')
const ipv6 = Symbol('ipv6')

/**
 * @typedef {typeof ipv4 | typeof ipv6} IpVersion
 */

const recordTypes = {
  [ipv4]: 'A',
  [ipv6]: 'AAAA',
}
const families = {
  [ipv4]: 'IPv4',
}

module.exports = {
  discover,
  ipv4,
  ipv6,
}

async function discover({ ipVersion = /** @type {IpVersion} */ (ipv4) } = {}) {
  if (![ipv4, ipv6].includes(ipVersion)) throw new Error('Invalid IP version given, use `ipv4` or `ipv6` from this library.')

  const mdns = /** @type {Mdns} */(createMdns({ loopback: false, noInit: true }))

  try {
    const { txt, srv, a, aaaa } = await query({ ipVersion, mdns })
    return {
      uuid: txt.data.uuid,
      versions: {
        pv: txt.data.pv,
        sv: txt.data.sv,
      },
      address: (
        ipVersion === ipv4 ? a :
        ipVersion === ipv6 ? aaaa :
        null
      ).data,
      ip: txt.data.ipv4address,
      host: srv.data.target,
      port: srv.data.port,
    }
  } finally {
    await new Promise((resolve, reject) => mdns.destroy(e => e ? reject(e) : resolve(undefined)))
  }

}

/** @param {{ ipVersion: Symbol, mdns: Mdns}} o */
async function query({ ipVersion, mdns }) {
  return new Promise((resolve, reject) => {
    mdns.on('response', response => {
      const { ptr, srv, txt, a, aaaa } = parseResponse(response)

      if (!isDirigera(ipVersion, { ptr, srv, txt, a, aaaa })) return

      resolve({ ptr, srv, txt, a, aaaa })
    })

    mdns.on('error', e => {
      reject(e)
    })

    mdns.on('ready', () => {
      mdns.query([ { name: '_ihsp._tcp.local', type: 'ANY' }, ])
    })

    mdns.initServer()
  })
}

function parseResponse(response) {
  return response.answers.reduce(
    ({ ptr, srv, txt, a, aaaa }, x) => ({
      ptr:  x.type === 'PTR'  ? x : ptr,
      srv:  x.type === 'SRV'  ? x : srv,
      txt:  x.type === 'TXT'  ? parseTxt(x) : txt,
      a:    x.type === 'A'    ? x : a,
      aaaa: x.type === 'AAAA' ? x : aaaa,
    }),
      { ptr: null, srv: null, txt: null, a: null, aaaa: null }
  )
}

function isDirigera(ipVersion, { ptr, srv, txt, a, aaaa }) {
  const enoughInformation = ptr && srv && txt && (
    ipVersion === ipv4 ? a :
    ipVersion === ipv6 ? aaaa :
    false
  )
  return enoughInformation && txt.data?.type === 'DIRIGERA'
}

function parseTxt(txt) {
  return {
    ...txt,
    data: Object.fromEntries(
      txt.data.map(x => {
        const string = Buffer.from(x).toString()
        const [k, v] = string.split('=')
        return [k, v]
      })
    )
  }
}
