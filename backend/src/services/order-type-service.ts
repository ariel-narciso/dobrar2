import { OrderTypeModel } from "../models/oder-type";
import { prisma } from "../utils/constants/database-constants";

export class OrderTypeService {
  
  static async get(): Promise<OrderTypeModel[]> {
    const orderTypes = await prisma.orderType.findMany()
    return orderTypes
  }

  static async getById(id: string): Promise<OrderTypeModel | null> {
    const orderType = await prisma.orderType.findUnique({
      where: { id }
    })
    return orderType
  }
}
