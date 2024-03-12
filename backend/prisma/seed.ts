import { PrismaClient } from "@prisma/client";
import { StockInterface } from "../src/utils/interfaces/quote";
import { NoteInterface } from "../src/utils/interfaces/note";
import { QuoteTypeModel } from "../src/models/quote-type";
import { OrderTypeModel } from "../src/models/oder-type";
import {
  ETF_QUOTE_TYPE_CODE,
  FII_QUOTE_TYPE_CODE,
  STOCK_QUOTE_TYPE_CODE,
  prisma,
} from "../src/utils/constants/database-constants";
import { OrderService } from "../src/services/order-service";

export class Seed {

  quoteTypes: QuoteTypeModel[] = []
  orderTypes: OrderTypeModel[] = []

  async #createQuoteTypes() {

    const types: QuoteTypeModel[] = [
      {code: 1, name: 'ETF'},
      {code: 2, name: 'Ação'},
      {code: 3, name: 'Fundo Imobiliário'}
    ]
  
    for (const type of types) {
      this.quoteTypes.push(await prisma.quoteType.create({
        data: type
      }))
    }
  }

  async #createOrderTypes() {

    const types: QuoteTypeModel[] = [
      {code: 1, name: 'Compra'},
      {code: 2, name: 'Venda'},
    ]
  
    for (const type of types) {
      this.orderTypes.push(await prisma.orderType.create({
        data: type
      }))
    }
  }

  async #createQuotes(stocks: StockInterface[], funds: StockInterface[]) {

    const etfTypeId = this.quoteTypes
      .find(type => type.code == ETF_QUOTE_TYPE_CODE)?.id as string
    const stockTypeId = this.quoteTypes
      .find(type => type.code == STOCK_QUOTE_TYPE_CODE)?.id as string
    const fiiTypeId = this.quoteTypes
      .find(type => type.code == FII_QUOTE_TYPE_CODE)?.id as string

    for (const stock of stocks) {
      await prisma.quote.create({
        data: {
          ticker: stock.stock.toLowerCase(),
          name: stock.name,
          quoteTypeId: stockTypeId
        }
      })
    }

    for (const fund of funds) {
      await prisma.quote.create({
        data: {
          ticker: fund.stock.toLowerCase(),
          name: fund.name,
          quoteTypeId: fund.stock != 'ivvb11' ? fiiTypeId : etfTypeId
        }
      })
    }
  }

  async #createNotes(notes: NoteInterface[]) {
    for (const note of notes) {
      await prisma.note.create({
        data: {
          date: note.date,
          fees: note.fees,
          irrf: note.irrf,
          Order: {
            create: await OrderService.getOrdersWithTickerId(note.orders, this.orderTypes)
          }
        }
      })
    }
  }

  async resetNotes(notes: NoteInterface[]) {
    await this.#deleteNotes()
    await prisma.orderType.deleteMany()
    await this.#createOrderTypes()
    await this.#createNotes(notes)
  }

  async resetDataBase(stocks: StockInterface[], funds: StockInterface[], notes: NoteInterface[]) {
    await this.#deleteDataBase()
    await this.#createQuoteTypes()
    await this.#createQuotes(stocks, funds)
    await this.#createOrderTypes()
    await this.#createNotes(notes)
  }

  async #deleteNotes() {
    await prisma.order.deleteMany()
    await prisma.note.deleteMany()
  }

  async #deleteDataBase() {
    await this.#deleteNotes()
    await prisma.orderType.deleteMany()
    await prisma.quote.deleteMany()
    await prisma.quoteType.deleteMany()
  }
}
