import { PrismaClient } from "@prisma/client";
import { OrderInterface } from "../src/utils/interfaces/order";
import { OrderModel } from "../src/models/order";
import { StockInterface } from "../src/utils/interfaces/quote";
import { NoteInterface } from "../src/utils/interfaces/note";
import { QuoteTypeModel } from "../src/models/quote-type";
import { OrderTypeModel } from "../src/models/oder-type";

export class Seed {

  quoteTypes: Array<QuoteTypeModel> = []
  orderTypes: Array<OrderTypeModel> = []
  #prisma = new PrismaClient()

  async #createQuoteTypes() {

    const types: Array<QuoteTypeModel> = [
      {code: 1, name: 'ETF'},
      {code: 2, name: 'Ação'},
      {code: 3, name: 'Fundo Imobiliário'}
    ]
  
    for (const type of types) {
      this.quoteTypes.push(await this.#prisma.quoteType.create({
        data: type
      }))
    }
  }

  async #createOrderTypes() {

    const types: Array<QuoteTypeModel> = [
      {code: 1, name: 'Compra'},
      {code: 2, name: 'Venda'},
    ]
  
    for (const type of types) {
      this.orderTypes.push(await this.#prisma.orderType.create({
        data: type
      }))
    }
  }

  async #createQuotes(stocks: Array<StockInterface>, funds: Array<StockInterface>) {

    const etfTypeId = this.quoteTypes.find(type => type.code == 1)?.id as string
    const stockTypeId = this.quoteTypes.find(type => type.code == 2)?.id as string
    const fiiTypeId = this.quoteTypes.find(type => type.code == 3)?.id as string

    for (const stock of stocks) {
      await this.#prisma.quote.create({
        data: {
          ticker: stock.stock.toLowerCase(),
          name: stock.name,
          quoteTypeId: stockTypeId
        }
      })
    }

    for (const fund of funds) {
      await this.#prisma.quote.create({
        data: {
          ticker: fund.stock.toLowerCase(),
          name: fund.name,
          quoteTypeId: fund.stock != 'ivvb11' ? fiiTypeId : etfTypeId
        }
      })
    }
  }

  async #createNotes(notes: Array<NoteInterface>) {
    for (const note of notes) {
      await this.#prisma.note.create({
        data: {
          date: note.date,
          fees: note.fees,
          irrf: note.irrf,
          Order: {
            create: await this.#getOrdersWithTickerId(note.orders)
          }
        }
      })
    }
  }

  async resetNotes(notes: Array<NoteInterface>) {
    await this.#prisma.$connect()
    await this.#deleteNotes()
    await this.#prisma.orderType.deleteMany()
    await this.#createOrderTypes()
    await this.#createNotes(notes)
    await this.#prisma.$disconnect()
  }

  async resetDataBase(stocks: Array<StockInterface>, funds: Array<StockInterface>, notes: Array<NoteInterface>) {
    await this.#prisma.$connect()
    await this.#deleteDataBase()
    await this.#createQuoteTypes()
    await this.#createQuotes(stocks, funds)
    await this.#createOrderTypes()
    await this.#createNotes(notes)
    await this.#prisma.$disconnect()
  }

  async #getOrdersWithTickerId(orders: Array<OrderInterface>) {

    const buyOrderId = this.orderTypes.find(type => type.code == 1)?.id as string
    const sellOrderId = this.orderTypes.find(type => type.code == 2)?.id as string
    const ans: Array<OrderModel> = []
    for (const order of orders) {
      const stock = await this.#prisma.quote.findUnique({
        where: {
          ticker: order.ticket
        }
      })
      ans.push({
        quoteId: stock!.id,
        orderTypeId: order.type == 'c' ? buyOrderId : sellOrderId,
        quantity: order.quantity,
        price: order.price
      })
    }
    return ans
  }

  async #deleteNotes() {
    await this.#prisma.order.deleteMany()
    await this.#prisma.note.deleteMany()
  }

  async #deleteDataBase() {
    await this.#deleteNotes()
    await this.#prisma.orderType.deleteMany()
    await this.#prisma.quote.deleteMany()
    await this.#prisma.quoteType.deleteMany()
  }
}
