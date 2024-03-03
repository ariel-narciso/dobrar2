import fs, { readdirSync } from 'fs'
import { BrokerageNoteReader } from './brokerage-note-reader'
import { NoteInterface } from './interfaces/note'

const reader = new BrokerageNoteReader()

const renamedTickers: {[key: string]: string} = {
  'bbpo11': 'tvri11'
}

export async function getNotes() {
  const notes: Array<NoteInterface> = []
  for (const year of fs.readdirSync('notes')) {
    for (const month of readdirSync(`notes/${year}`)) {
      await reader.readPDF(`notes/${year}/${month}`)
      const fees = reader.getFees()
      let orders = reader.getOrders()
      orders = orders.map(order => ({
        ...order,
        ticket: order.ticket in renamedTickers ? renamedTickers[order.ticket] : order.ticket
      }))
      if (orders.findIndex(order => order.ticket == 'bbpo11') >= 0) {
        console.log(orders)
      }
      notes.push({
        date: new Date(usDateFormat(reader.getDate())),
        orders: orders,
        fees: fees.emoluments + fees.settlementFee + fees.iss,
        withholdingIncomeTax: fees.irrf
      })
    }
  }
  return notes
}

function usDateFormat(date: string) {
  const [day, year, month] = date.split('/')
  return `${year}/${day}/${month}`
}