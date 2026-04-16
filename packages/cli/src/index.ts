#!/usr/bin/env node

import { Command } from 'commander'
import { initCommand } from './commands/init'
import { loginCommand } from './commands/login'
import { connectCommand } from './commands/connect'
import { indexCommand } from './commands/index'
import { serveCommand } from './commands/serve'
import { statusCommand } from './commands/status'

const program = new Command()

program.name('brainbridge').description('Connect your local brain folder to ChatGPT').version('0.1.0')

program
  .command('init')
  .description('Initialize Brain Bridge')
  .action(() => initCommand())

program
  .command('login <apiKey>')
  .description('Login with API key')
  .action((apiKey) => loginCommand(apiKey))

program
  .command('connect <folder>')
  .description('Connect a local vault folder')
  .action((folder) => connectCommand(folder))

program
  .command('index')
  .description('Rebuild the search index')
  .action(() => indexCommand())

program
  .command('serve')
  .description('Start the local agent server')
  .action(() => serveCommand())

program
  .command('status')
  .description('Show Brain Bridge status')
  .action(() => statusCommand())

program.parse()
