import { QuoteModel } from "../models/quote";
import { prisma } from "../utils/constants/database-constants";

export class QuoteService {

  static async addQuote(quote: QuoteModel) {
    quote = await prisma.quote.create({
      data: quote
    })
    return quote
  }
  
  static async getQuoteByTicker(ticker: string): Promise<QuoteModel | null> {
    const quote = await prisma.quote.findUnique({
      where: { ticker }
    })
    return quote
  }
  
  static async getQuoteById(id: string): Promise<QuoteModel | null> {
    const quote = await prisma.quote.findUnique({
      where: { id }
    })
    return quote
  }
}
