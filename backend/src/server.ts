import { inspect } from 'node:util'
import { WalletControlService } from './services/transients/wallet-control-service'
import { Seed } from '../prisma/seed'
import { getStocks } from './utils/get-stocks'
import { getNote, getNotes } from './utils/get-notes'

inspect.defaultOptions.maxArrayLength = null
inspect.defaultOptions.maxStringLength = null

async function main() {
  const seed = new Seed()
  // const stocks = await getStocks('stock')
  // const funds = await getStocks('fund')
  const notes = await getNotes()
  await seed.resetNotesAndEvents(notes)
  const service = new WalletControlService()
  service.get().then(() => console.log(service.data.assets.sort((a, b) => {
  const ret = a.quote.ticker < b.quote.ticker
  return ret ? -1 : 1
})))
}
main().then(() => console.log('ok'))

// getNote('docs/2023/06.1.pdf').then(res => {})

/*
  TODO
    desdobramento / agrupamento
    bonificação / subscrição
    incorporação
    ------------------
    incluir taxa de corretagem nos calculos
    --------------------------
    bonificacao
    slce3 11/05/2023
    1 23,54

    desdobramento 1:10
    cpts11 26/09/2023

    desdobramento 1:2
    kepl3 05/04/2023

    x to tvri11 (problema)
 */