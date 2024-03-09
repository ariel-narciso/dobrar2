import { PDFExtract, PDFExtractResult } from "pdf.js-extract";
import { OrderInterface } from "./interfaces/order";
import { FeeInterface } from "./interfaces/fee";

export class BrokerageNoteReader {
  
  #pdfExtract = new PDFExtract()
  #data?: PDFExtractResult
  #pages: string[][] = []
  #document: string[] = []

  async readPDF(filename: string) {
    this.#data = await this.#pdfExtract.extract(filename, {})
    this.#pages = this.#data!.pages.map(page => page.content.map(c => c.str.toLowerCase()).filter(c => c.trim()))
    this.#document = this.#pages.reduce((previous, next) => {
      previous.push(...next)
      return previous
    })
  }

  getOrders() {
    const orders: Array<OrderInterface> = []
    for (const page of this.#pages) {
      orders.push(...this.#extractOrders(page))
    }
    return orders
  }

  getFees() {
    const fee: FeeInterface = {} as FeeInterface
    
    let index = this.#document.indexOf('taxa de liquidação')
    if (index == -1) {
      throw new Error("Taxa de liquidação não encontrada")
    }
    fee['settlementFee'] = -currencyBrToUs(this.#document[index + 1])
    
    index = this.#document.indexOf('emolumentos')
    if (index == -1) {
      throw new Error("Emolummentos não encontrado")
    }
    fee['emoluments'] = -currencyBrToUs(this.#document[index + 1])
    
    index = this.#document.indexOf('iss (são paulo)')
    if (index == -1) {
      throw new Error("iss não encontrado")
    }
    fee['iss'] = -currencyBrToUs(this.#document[index + 1])

    index = this.#document.indexOf('i.r.r.f. s/ operações. base 0,00')
    if (index == -1) {
      throw new Error("irrf não encontrado")
    }
    fee['irrf'] = -currencyBrToUs(this.#document[index + 1])
    
    return fee
  }

  getDate() {
    let index = this.#document.indexOf("data pregão")
    if (index == -1) {
      throw new Error("Data do pregão não encontrada")
    }
    return this.#document[index + 1]
  }

  #extractOrders(pdfContent: string[]) {
    const orders: Array<OrderInterface> = []
    let first = pdfContent.indexOf("bovespa")
    let last = pdfContent.indexOf("bovespa", first + 1)
    while (last != -1) {
      orders.push(this.#orderFilter(pdfContent.slice(first, last)))
      first = last
      last = pdfContent.indexOf("bovespa", first + 1)
    }
    if (first != -1) {
      last = pdfContent.indexOf("mercado", first + 1)
      if (last == -1) {
        last = pdfContent.indexOf("nuinvest corretora de valores s.a", first + 1)
      }
      if (last == -1) {
        throw new Error("Final das ordens não encontrado")
      }
      orders.push(this.#orderFilter(pdfContent.slice(first, last - 1)))
    }
    return orders
  }

  #orderFilter(order: string[]) {
    let filteredOrder: OrderInterface = {} as OrderInterface
    filteredOrder['type'] = order[1] as ('c'|'v')
    filteredOrder['ticket'] = order[3].split(' ')[0]
    if (order[2] == 'fracionario') {
      filteredOrder['ticket'] = filteredOrder['ticket'].substring(0, filteredOrder['ticket'].length - 1)
    }
    let quantityIndex = 4
    while (isNaN(currencyBrToUs(order[quantityIndex])) && quantityIndex < order.length) {
      quantityIndex++
    }
    if (quantityIndex == order.length) {
      throw new Error("Quantidade não encontrada")
    }
    filteredOrder['quantity'] = currencyBrToUs(order[quantityIndex])
    filteredOrder['price'] = currencyBrToUs(order[quantityIndex + 1])
    return filteredOrder
  }
}

function currencyBrToUs(value: string) {
  return +value.replace('.', '').replace(',', '.')
}
