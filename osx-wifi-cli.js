#!/usr/bin/env node

'use strict'

const lib = require(`./src/main/lib.js`)

const help = _ => console.log(lib.helpText())
const commands = lib.getCommands(process.platform)
const { args, device } = lib.getInput(process.argv.slice(2))
const execute = lib.executeOnDevice.bind(null, device)

const oneWordActions = {
  on: _ => execute(commands.on),
  off: _ => execute(commands.off),
  restart: _ => execute(`${commands.off} && ${commands.on}`),
  scan: _ => execute(commands.scan),
  version: _ => console.log(`osx-wifi-cli version ${lib.getVersion()}`)
}

const actionByNumOfArgs = {
  0: _ => execute(commands.currentNetwork, lib.status),
  1: _ => (oneWordActions[args[0]] || help)(),
  2: _ => execute(lib.parseConnectCommand(commands.connect, ...args))
}

;(actionByNumOfArgs[args.length] || help)()
