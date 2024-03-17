import { PDFExtract, PDFExtractResult } from "pdf.js-extract";
import { OrderInterface } from "./interfaces/order";
import { FeeInterface } from "./interfaces/fee";

export class BrokerageNoteReader {
  
  #pdfExtract = new PDFExtract()
  #data?: PDFExtractResult
  #document: string[] = []

  async readPDF(filename: string) {
    this.#data = await this.#pdfExtract.extract(filename, {})
    const pages = this.#data!.pages.map(page => page.content.map(c => c.str.toLowerCase()).filter(c => c.trim()))
    this.#document = pages.reduce((previous, current) => {
      previous.push(...current)
      return previous
    })
  }

  getOrders() {
    return this.#extractOrders(this.#document)
  }

  #getFee(searchKey: string) {
    let index = this.#document.indexOf(searchKey)
    if (index == -1) {
      throw new Error(`${searchKey} não encontrado(a)`)
    }
    return this.#document[index + 1]
  }

  getFees(): FeeInterface {
    return {
      settlementFee: -currencyBrToUs(this.#getFee('taxa de liquidação')),
      emoluments: -currencyBrToUs(this.#getFee('emolumentos')),
      iss: -currencyBrToUs(this.#getFee('iss (são paulo)')),
      irrf: -currencyBrToUs(this.#getFee('i.r.r.f. s/ operações. base 0,00')),
      brokerageFee: -currencyBrToUs(this.#getFee('corretagem')),
    }
  }

  getDate() {
    let index = this.#document.indexOf("data pregão")
    if (index == -1) {
      throw new Error("Data do pregão não encontrada")
    }
    return this.#document[index + 1]
  }

  #extractOrders(pdfContent: string[]) {
    const orders: OrderInterface[] = []
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
