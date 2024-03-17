import { OrderModel } from "../models/order"
import { PURCHASE_ORDER_TYPE_CODE, SALE_ORDER_TYPE_CODE, prisma } from "../utils/constants/database-constants"
import { OrderInterface } from "../utils/interfaces/order"
import { OrderTypeModel } from "../models/oder-type"
import { OrderTypeService } from "./order-type-service"
import { QuoteService } from "./quote-service"

export class OrderService {

  static async getByNoteId(noteId: string): Promise<OrderModel[]> {
    const orders = await prisma.order.findMany({
      where: { noteId }
    })
    return orders
  }
  
  static async getOrderModels(orders: OrderInterface[], orderTypes?: OrderTypeModel[]) {
  
    if (!orderTypes) {
      orderTypes = await OrderTypeService.get()
    }
    
    const buyOrderId = orderTypes.find(type => type.code == PURCHASE_ORDER_TYPE_CODE)?.id || ""
    const sellOrderId = orderTypes.find(type => type.code == SALE_ORDER_TYPE_CODE)?.id || ""
  
    const ans: OrderModel[] = []
    for (const order of orders) {
      const stock = await QuoteService.getByTicker(order.ticket)
      ans.push({
        quoteId: stock!.id!,
        orderTypeId: order.type == 'c' ? buyOrderId : sellOrderId,
        quantity: order.quantity,
        price: order.price
      })
    }
  
    return ans
  }
}

