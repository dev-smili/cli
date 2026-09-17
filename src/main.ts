#!/usr/bin/env node
import { defineCommand, runMain } from 'citty'
import cleanGit from './commands/clean-git.ts'
import freePort from './commands/free-port.ts'
import loginGh from './commands/login-gh.ts'

const main = defineCommand({
  meta: {
    name: 'smili',
    description: 'Everyday developer utilities',
  },
  subCommands: {
    'clean-git': cleanGit,
    'free-port': freePort,
    'login-gh': loginGh,
  },
})

runMain(main)
