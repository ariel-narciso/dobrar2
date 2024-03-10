import { OrderModel } from "../../models/order";
import { CostApportionmentModel, CostApportionmentOrderModel } from "../../models/transients/cost-apportionment";
import { PURCHASE_ORDER_TYPE_CODE } from "../../utils/constants/database-constants";
import { NoteService } from "../note-service";
import { OrderService } from "../order-service";
import { OrderTypeService } from "../order-type-service";
import { QuoteService } from "../quote-service";

export class CostApportionmentService {

  static async get(noteId: string) {
    const note = await NoteService.getNoteById(noteId)
    const orders = await OrderService.getOrdersByNoteId(noteId)
    const [purchases, sales] = await this.#getTotalPurchasesAndSales(orders)
    const costApportionment: CostApportionmentModel = {
      fees: note!.fees,
      irrf: note!.irrf,
      feesWithIRRF: note!.fees + note!.irrf,
      totalPurchases: purchases,
      totalSales: sales,
      net: purchases - sales + note!.fees,
      netWithIrrf: purchases - sales + note!.fees + note!.irrf,
      orders: []
    }
    await this.#setcostApportionmentOrders(costApportionment, orders)
    return costApportionment
  }

  static async #setcostApportionmentOrders(costApportionment: CostApportionmentModel, orders: Array<OrderModel>) {
    for (const order of orders) {
      const quote = await QuoteService.getQuoteById(order.quoteId)
      const obj: CostApportionmentOrderModel = {
        ticker: quote!.ticker,
        quantity: order.quantity,
        price: order.price,
        value: Math.abs(order.price * order.quantity),
        percentage: 0,
        fees: 0,
        irrf: 0,
      }
      obj.percentage = obj.value / (costApportionment.totalPurchases + costApportionment.totalSales)
      obj.fees = obj.percentage * costApportionment.fees
      obj.irrf = obj.quantity < 0 ? obj.value / costApportionment.totalSales * costApportionment.irrf : 0
      costApportionment.orders.push(obj)
    }
  }
  
  static async #getTotalPurchasesAndSales(orders: Array<OrderModel>) {
    let purchases = 0
    let sales = 0
    const orderTypes = await OrderTypeService.getOrderTypes()
    for (const [idx, order] of orders.entries()) {
      const type = orderTypes.find(type => type.id == order.orderTypeId)
      if (type?.code == PURCHASE_ORDER_TYPE_CODE) {
        purchases += order.price * order.quantity
      } else {
        sales += order.price * order.quantity
        orders[idx].quantity = -orders[idx].quantity
      }
    }
    return [purchases, sales]
  }
}