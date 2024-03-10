import { inspect } from 'node:util'
import { Seed } from '../prisma/seed'
import { getNotes } from './utils/get-notes'

inspect.defaultOptions.maxArrayLength = null
inspect.defaultOptions.maxStringLength = null

const seed = new Seed()
getNotes().then(notes => seed.resetNotes(notes))