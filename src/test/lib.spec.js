'use strict'

import test from 'ava'
import lib from '../main/lib.js'

test(`helpText`, t => {
  const text = lib.helpText()

  t.truthy(/osx-wifi-cli/.test(text))
  t.truthy(/Usage/.test(text))
  t.truthy(/Options/.test(text))
  t.falsy(/VERSION/.test(text))
})

test(`getVersion`, t => {
  const version = lib.getVersion()

  t.truthy(/\d+\.\d+\.\d+/.test(version))
})

test(`status`, t => {
  t.is(lib.status(``), `You are not connected anywhere`)
  t.is(lib.status(`   `), `You are not connected anywhere`)
  t.is(lib.status(`bAd-WiFi`), `You are connected to bAd-WiFi`)
  t.is(lib.status(` bAd-WiFi  `), `You are connected to bAd-WiFi`)
})

test(`parseConnectCommand`, t => {
  const command = `connect 'NETWORK' 'PASSWORD'`
  t.is(lib.parseConnectCommand(command, `x`, `y`), `connect 'x' 'y'`)
})

test(`parseConnectCommand can handle a network name that includes the pass token`, t => {
  const command = `connect 'NETWORK' 'PASSWORD'`
  t.is(lib.parseConnectCommand(command, `xPASSWORDx`, `y`), `connect 'xPASSWORDx' 'y'`)
})

test(`getInput`, t => {
  t.deepEqual(lib.getInput([]), { args: [], device: `en0` })
  t.deepEqual(lib.getInput([`--device`, `xx3`]), { args: [], device: `xx3` })
  t.deepEqual(lib.getInput([`on`]), { args: [`on`], device: `en0` })
  t.deepEqual(lib.getInput([`ssid`, `pass`]), { args: [`ssid`, `pass`], device: `en0` })
  t.deepEqual(lib.getInput([`ssid`, `pass`, `--device`, `x`]), { args: [`ssid`, `pass`], device: `x` })
  t.deepEqual(lib.getInput([`--device`, `x`, `ssid`, `pass`]), { args: [`ssid`, `pass`], device: `x` })
})

test(`getCommands for supported platforms`, t => {
  const supportedPlatforms = [`darwin`]
  supportedPlatforms.forEach(platform => {
    const commands = lib.getCommands(platform)
    t.deepEqual(Object.keys(commands), [`on`, `off`, `scan`, `connect`, `currentNetwork`])
  })
})

test(`getCommands for unsupported platforms`, t => {
  const name = `aPlatformThatIsNotSupported`
  t.throws(_ => lib.getCommands(name), `osx-wifi-cli does not support the '${name}' platform.`)
})

test(`executeOnDevice`, t => {
  t.plan(4)
  const cp = require(`child_process`)
  const [_exec, _log] = [cp.exec, console.log]
  cp.exec = (cmd, cb) => {
    t.is(cmd, `command dev0`)
    cb(null, `output!`, null)
  }
  const cb = output => {
    t.is(output, `output!`)
    return `toPrint`
  }
  console.log = str => {
    t.is(str, `toPrint`)
    t.deepEqual([console.log, cp.exec] = [_log, _exec], [_log, _exec])
  }
  lib.executeOnDevice(`dev0`, `command DEVICE`, cb)
})
