import { QuoteTypeModel } from "../models/quote-type";
import { prisma } from "../utils/constants/database-constants";

export class QuoteTypeService {

  static async get(): Promise<QuoteTypeModel[]> {
    return await prisma.quoteType.findMany()
  }

  static async getById(id: string): Promise<QuoteTypeModel | null> {
    return await prisma.quoteType.findUnique({
      where: { id }
    })
  }
}