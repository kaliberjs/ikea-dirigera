const { authorize } = require('./src/authorize')
const { createClient } = require('./src/client')
const { discover, ipv6, ipv4 } = require('./src/discover')
const WebSocket = require('ws')
const { agent } = require('./src/machinery/fetch')

run(async () => {

  // const x = await discover({ interface: 'enp0s31f6' })
  // const info = await discover({ ipVersion: ipv6 })
  // console.log(info)

  // const { ip, port } = info

  // const authorization = await authorize({ ip, port, name: 'test' })
  // console.log(authorization)

  // const { accessToken } = authorization



  // const {ip, port} = { ip: '192.168.0.100', port: 8443 }
  // const accessToken = '...'

  // const client = createClient({ ip, port, accessToken })
  // const devices = await client.listDevices()
  // console.log(devices)
  // return

  // const red = [
  //   { colorTemperature: 2702, },
  //   { colorHue: 0, colorSaturation: 1, },
  // ]

  // const blue = [
  //   { colorTemperature: 4000, },
  //   { colorHue: 239.996337890625, colorSaturation: 1, },
  // ]

  // const on = [{ isOn: true }]
  // const off = [{ isOn: false }]

  // const light = devices.find(x => x.attributes.customName === 'light6')

  // const x = await client.patchDeviceAttributes(light.id, red)
  // console.log(x)

  // const button = devices.find(x => x.attributes.customName === 'remote1')
  // console.log(button)

  // console.log(devices.map(x => x.attributes.customName))
  // const ws = new WebSocket(
  //   `wss://${ip}:${port}/v1`, {
  //     agent,
  //     headers: { 'Authorization': `Bearer ${accessToken}` }
  //   }
  // )

  // ws.on('open', () => {
  //   console.log('socket open')
  // })

  // ws.on('error', e => {
  //   console.error(e)
  // })

  // ws.on('message', data => {
  //   console.log(JSON.parse(data, null, 2))
  // })

  // await new Promise(_ => {})

})

function run(f) {
  f()
    .then(_ => { console.log('Done'); process.exit(0) })
    .catch(e => { console.error(e); process.exit(1) })
}
