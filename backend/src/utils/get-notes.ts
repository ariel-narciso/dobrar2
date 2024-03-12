import { readdirSync } from 'fs'
import { BrokerageNoteReader } from './brokerage-note-reader'
import { NoteInterface } from './interfaces/note'

const reader = new BrokerageNoteReader()

const renamedTickers: {[key: string]: string} = {
  'bbpo11': 'tvri11'
}

export async function getNotes() {
  const notes: NoteInterface[] = []
  for (const year of readdirSync('docs')) {
    for (const month of readdirSync(`docs/${year}`)) {
      await reader.readPDF(`docs/${year}/${month}`)
      const fees = reader.getFees()
      const orders = reader.getOrders().map(order => ({
        ...order,
        ticket: order.ticket in renamedTickers ? renamedTickers[order.ticket] : order.ticket
      }))
      notes.push({
        date: new Date(usDateFormat(reader.getDate())),
        orders: orders,
        fees: fees.emoluments + fees.settlementFee + fees.iss,
        irrf: fees.irrf,
      })
    }
  }
  return notes
}

function usDateFormat(date: string) {
  const [day, year, month] = date.split('/')
  return `${year}/${day}/${month}`
}