'use strict'

const join = require(`path`).join

const getVersion = _ => require(`../../package.json`).version
const readFile = f => require(`fs`).readFileSync(f, `UTF-8`)
const addVersion = t => t.replace(`VERSION`, getVersion())
const helpText = _ => addVersion(readFile(join(__dirname, `help-text.txt`)))
const status = SSID => SSID.trim() ? `You are connected to ${SSID.trim()}` : `You are not connected anywhere`
const parseConnectCommand = (com, ssid, pass) => com.replace(/NETWORK|PASSWORD/g, m => ({ NETWORK: ssid, PASSWORD: pass })[m])

const getInput = args => {
  let device = `en0`
  const deviceAt = args.indexOf(`--device`)
  if (deviceAt !== -1) [, device] = args.splice(deviceAt, 2)
  return { args, device }
}

const getCommands = platform => {
  const commands = require(`../../commands.json`)[platform]
  if (!commands) throw new Error(`osx-wifi-cli does not support the '${platform}' platform.`)
  return commands
}

const executeOnDevice = (device, cmd, cb) => {
  require(`child_process`).exec(cmd.replace(/DEVICE/g, device), (err, strout, strerr) => {
    if (err) throw new Error(err)
    else if (strerr) throw new Error(strerr)
    else if (strout) console.log(cb ? cb(strout) : strout)
  })
}

module.exports = {
  helpText,
  getVersion,
  status,
  parseConnectCommand,
  getInput,
  getCommands,
  executeOnDevice
}
