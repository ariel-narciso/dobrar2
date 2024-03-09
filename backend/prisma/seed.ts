import { PrismaClient } from "@prisma/client";
import { getStocks } from "../src/utils/get-stocks";
import { getNotes } from "../src/utils/get-notes";
import { OrderInterface } from "../src/utils/interfaces/order";
import { OrderTypeModel, QuoteTypeModel } from "../src/models/type";
import { OrderModel } from "../src/models/order";

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

  async createQuotes() {

    await this.#prisma.$connect()

    await this.#createQuoteTypes()

    const etfTypeId = this.quoteTypes.find(type => type.code == 1)?.id as string
    const stockTypeId = this.quoteTypes.find(type => type.code == 2)?.id as string
    const fiiTypeId = this.quoteTypes.find(type => type.code == 3)?.id as string

    const stocks = await getStocks('stock')
    for (const stock of stocks) {
      await this.#prisma.quote.create({
        data: {
          ticker: stock.stock.toLowerCase(),
          name: stock.name,
          quoteTypeId: stockTypeId
        }
      })
    }
    const funds = await getStocks('fund')
    for (const fund of funds) {
      await this.#prisma.quote.create({
        data: {
          ticker: fund.stock.toLowerCase(),
          name: fund.name,
          quoteTypeId: fund.stock != 'ivvb11' ? fiiTypeId : etfTypeId //'fund' : 'etf'
        }
      })
    }

    await this.#prisma.$disconnect()
  }

  async createNotes() {

    await this.#prisma.$connect()

    await this.#createOrderTypes()

    const notes = await getNotes()
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

  async deleteDb() {
    
    await this.#prisma.order.deleteMany()
    await this.#prisma.note.deleteMany()
    await this.#prisma.quote.deleteMany()
    await this.#prisma.quoteType.deleteMany()
    await this.#prisma.orderType.deleteMany()
  }
}

const seed = new Seed()
seed.deleteDb().then(async () => {
  await seed.createQuotes()
  await seed.createNotes()
  console.log('ok')
})