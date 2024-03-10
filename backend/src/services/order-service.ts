import { OrderModel } from "../models/order"
import { PURCHASE_ORDER_TYPE_CODE, SALE_ORDER_TYPE_CODE, prisma } from "../utils/constants/database-constants"
import { OrderInterface } from "../utils/interfaces/order"
import { OrderTypeModel } from "../models/oder-type"
import { OrderTypeService } from "./order-type-service"

export class OrderService {

  static async getOrdersByNoteId(noteId: string): Promise<Array<OrderModel>> {
    const orders = await prisma.order.findMany({
      where: { noteId }
    })
    return orders
  }
  
  static async getOrdersWithTickerId(orders: Array<OrderInterface>, orderTypes?: Array<OrderTypeModel>) {
  
    if (!orderTypes) {
      orderTypes = await OrderTypeService.getOrderTypes()
    }
    
    const buyOrderId = orderTypes.find(type => type.code == PURCHASE_ORDER_TYPE_CODE)?.id || ""
    const sellOrderId = orderTypes.find(type => type.code == SALE_ORDER_TYPE_CODE)?.id || ""
  
    const ans: Array<OrderModel> = []
    for (const order of orders) {
      const stock = await prisma.quote.findUnique({
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
}

