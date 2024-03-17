import { readdirSync } from 'fs'
import { BrokerageNoteReader } from './brokerage-note-reader'
import { NoteInterface } from './interfaces/note'
import { usDateFormat } from './date-format'

const reader = new BrokerageNoteReader()

const renamedTickers: {[key: string]: string} = {
  'bbpo11': 'tvri11'
}

export async function getNotes() {
  const notes: NoteInterface[] = []
  for (const year of readdirSync('docs')) {
    for (const month of readdirSync(`docs/${year}`)) {
      notes.push(await getNote(`docs/${year}/${month}`))
    }
  }
  return notes
}

export async function getNote(filename: string): Promise<NoteInterface> {
  await reader.readPDF(filename)
  const fees = reader.getFees()
  const orders = reader.getOrders().map(order => ({
    ...order,
    ticket: order.ticket in renamedTickers ? renamedTickers[order.ticket] : order.ticket
  }))
  return {
    date: new Date(usDateFormat(reader.getDate())),
    orders: orders,
    fees: fees.emoluments + fees.settlementFee + fees.iss,
    irrf: fees.irrf,
  }
}