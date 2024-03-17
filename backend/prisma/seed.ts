import { StockInterface } from "../src/utils/interfaces/quote";
import { NoteInterface } from "../src/utils/interfaces/note";
import { QuoteTypeModel } from "../src/models/quote-type";
import { OrderTypeModel } from "../src/models/oder-type";
import {
  BONUS_QUOTE_EVENT_TYPE_CODE,
  ETF_QUOTE_TYPE_CODE,
  FII_QUOTE_TYPE_CODE,
  GROUP_QUOTE_EVENT_TYPE_CODE,
  PURCHASE_ORDER_TYPE_CODE,
  SALE_ORDER_TYPE_CODE,
  SPLIT_QUOTE_EVENT_TYPE_CODE,
  STOCK_QUOTE_TYPE_CODE,
  SUBSCRIPTION_QUOTE_EVENT_TYPE_CODE,
  prisma,
} from "../src/utils/constants/database-constants";
import { OrderService } from "../src/services/order-service";
import { QuoteEventTypeModel } from "../src/models/quote-event-type";
import { QuoteEventModel } from "../src/models/quote-event";
import { QuoteService } from "../src/services/quote-service";
import { usDateFormat } from "../src/utils/date-format";

export class Seed {

  quoteTypes: QuoteTypeModel[] = []
  orderTypes: OrderTypeModel[] = []
  quoteEventTypes: QuoteEventTypeModel[] = []

  async #createQuoteTypes() {

    const types: QuoteTypeModel[] = [
      {code: ETF_QUOTE_TYPE_CODE, name: 'ETF'},
      {code: STOCK_QUOTE_TYPE_CODE, name: 'Ação'},
      {code: FII_QUOTE_TYPE_CODE, name: 'Fundo Imobiliário'}
    ]
  
    for (const type of types) {
      this.quoteTypes.push(await prisma.quoteType.create({
        data: type
      }))
    }
  }

  async #createOrderTypes() {

    const types: QuoteTypeModel[] = [
      {code: PURCHASE_ORDER_TYPE_CODE, name: 'Compra'},
      {code: SALE_ORDER_TYPE_CODE, name: 'Venda'},
    ]
  
    for (const type of types) {
      this.orderTypes.push(await prisma.orderType.create({
        data: type
      }))
    }
  }

  async #createQuoteEventTypes() {

    const types: QuoteEventTypeModel[] = [
      {code: SPLIT_QUOTE_EVENT_TYPE_CODE, name: 'Desdobramento'},
      {code: GROUP_QUOTE_EVENT_TYPE_CODE, name: 'Agrupamento'},
      {code: BONUS_QUOTE_EVENT_TYPE_CODE, name: 'Bonificação'},
      {code: SUBSCRIPTION_QUOTE_EVENT_TYPE_CODE, name: 'Subscrição'},
    ]

    for (const type of types) {
      this.quoteEventTypes.push(await prisma.quoteEventType.create({
        data: type
      }))
    }
  }

  async #createQuotes(stocks: StockInterface[], funds: StockInterface[]) {

    const etfTypeId = this.quoteTypes
      .find(type => type.code == ETF_QUOTE_TYPE_CODE)?.id
    const stockTypeId = this.quoteTypes
      .find(type => type.code == STOCK_QUOTE_TYPE_CODE)?.id
    const fiiTypeId = this.quoteTypes
      .find(type => type.code == FII_QUOTE_TYPE_CODE)?.id

    for (const stock of stocks) {
      await prisma.quote.create({
        data: {
          ticker: stock.stock.toLowerCase(),
          name: stock.name,
          quoteTypeId: stockTypeId!
        }
      })
    }

    for (const fund of funds) {
      await prisma.quote.create({
        data: {
          ticker: fund.stock.toLowerCase(),
          name: fund.name,
          quoteTypeId: fund.stock != 'ivvb11' ? fiiTypeId! : etfTypeId!
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
            create: await OrderService.getOrderModels(note.orders, this.orderTypes)
          }
        }
      })
    }
  }

  async #createQuoteEvents() {

    const bonusTypeId = this.quoteEventTypes
      .find(type => type.code == BONUS_QUOTE_EVENT_TYPE_CODE)?.id!
    const splitTypeId = this.quoteEventTypes
      .find(type => type.code == SPLIT_QUOTE_EVENT_TYPE_CODE)?.id!

    const quoteTickers = ['slce3', 'cpts11', 'kepl3']
    const quoteids: string[] = []
    for (const ticker of quoteTickers) {
      const quote = await QuoteService.getByTicker(ticker)  
      quoteids.push(quote?.id!)
    }

    for (const event of this.#getEvents(quoteids, bonusTypeId, splitTypeId)) {
      await prisma.quoteEvent.create({
        data: event
      })
    }
  }

  #getEvents(quotes: string[], bonusTypeId: string, splitTypeId: string): QuoteEventModel[] {
    return [
      {
        date: new Date(usDateFormat('11/05/2023')),
        quantity: 1,
        value: 23.54,
        quoteId: quotes[0],
        quoteEventTypeId: bonusTypeId!,
      },
      {
        date: new Date(usDateFormat('26/09/2023')),
        value: 10,
        quoteId: quotes[1],
        quoteEventTypeId: splitTypeId!,
      },
      {
        date: new Date(usDateFormat('05/04/2023')),
        value: 2,
        quoteId: quotes[2],
        quoteEventTypeId: bonusTypeId!,
      },
    ]
  }

  async resetNotesAndEvents(notes: NoteInterface[]) {
    this.quoteEventTypes = await prisma.quoteEventType.findMany()
    this.orderTypes = await prisma.orderType.findMany()
    await this.#deleteNotesAndEvents()
    await this.#createNotes(notes)
    await this.#createQuoteEvents()
  }

  async resetDataBase(stocks: StockInterface[], funds: StockInterface[], notes: NoteInterface[]) {
    await this.#deleteDataBase()
    await this.#createQuoteTypes()
    await this.#createQuoteEventTypes()
    await this.#createQuotes(stocks, funds)
    await this.#createOrderTypes()
    await this.#createNotes(notes)
    await this.#createQuoteEvents()
  }

  async #deleteNotesAndEvents() {
    await prisma.order.deleteMany()
    await prisma.note.deleteMany()
    await prisma.quoteEvent.deleteMany()
  }

  async #deleteDataBase() {
    await this.#deleteNotesAndEvents()
    await prisma.orderType.deleteMany()
    await prisma.quoteEventType.deleteMany
    await prisma.quote.deleteMany()
    await prisma.quoteType.deleteMany()
  }
}
