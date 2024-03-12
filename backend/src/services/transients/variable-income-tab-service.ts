import { CostApportionmentOrderModel } from "../../models/transients/cost-apportionment";
import { QuoteStockModel, VariableIncomeTabModel } from "../../models/transients/variable-income-tab";
import { NoteService } from "../note-service";
import { CostApportionmentService } from "./cost-apportionment-service";

export class VariableIncomeTabService {

  #orders: VariableIncomeTabModel[] = []
  #quoteStock: QuoteStockModel = {}

  get quoteStock() {
    return { ...this.#quoteStock }
  }

  get orders() {
    return structuredClone(this.#orders)
  }

  async get() {
    this.#orders = []
    const notes = await NoteService.getNotes('asc')
    for (const note of notes) {
      const apportionment = await CostApportionmentService.get(note.id!)
      const orders = apportionment.orders
      for (const order of orders) {
        this.#addOrder(order, note.date)
      }
    }
  }

  #addOrder(order: CostApportionmentOrderModel, noteDate: Date) {
    const total = order.price * order.quantity
    const totalWithFees = total + order.fees
    const priceWithFees = totalWithFees / Math.abs(order.quantity)
    const obj: VariableIncomeTabModel = {
      date: noteDate,
      ticker: order.ticker,
      quantity: order.quantity,
      price: order.price,
      fees: order.fees,
      irrf: order.irrf,
      total,
      totalWithFees,
      priceWithFees,
      quantityStock: 0,
      averagePrice: 0
    }
    this.#setQuantityPriceStock(obj)
    this.#orders.push(obj)
  }

  #setQuantityPriceStock(obj: VariableIncomeTabModel) {
    if (!(obj.ticker in this.#quoteStock)) {
      obj.quantityStock = obj.quantity
      obj.averagePrice = obj.priceWithFees
    }
    else {
      obj.quantityStock = obj.quantity + this.#quoteStock[obj.ticker].quantity
      if (obj.quantity > 0) {
        obj.averagePrice = (
          this.#quoteStock[obj.ticker].price * this.#quoteStock[obj.ticker].quantity + obj.totalWithFees
        ) / obj.quantityStock
      }
      else {
        obj.averagePrice = this.#quoteStock[obj.ticker].price
      }
    }
    this.#quoteStock[obj.ticker] = {
      quantity: obj.quantityStock,
      price: obj.averagePrice
    }
    /*
    preço médio de aquisição = (
      se venda
        pega o ultimo preco medio
      se compra
        (ultimo preco medio * ultima qtd em estoque + atual montante com corretagem) / atual estoque posição
    )
    */
  }
}