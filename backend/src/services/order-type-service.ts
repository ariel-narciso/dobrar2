import { OrderTypeModel } from "../models/oder-type";
import { prisma } from "../utils/constants/database-constants";

export class OrderTypeService {
  
  static async getOrderTypes(): Promise<Array<OrderTypeModel>> {
    const orderTypes = await prisma.orderType.findMany()
    return orderTypes
  }

  static async getOrderTypeById(id: string): Promise<OrderTypeModel | null> {
    const orderType = await prisma.orderType.findUnique({
      where: { id }
    })
    return orderType
  }
}
