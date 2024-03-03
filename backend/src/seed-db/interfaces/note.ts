import { OrderInterface } from "./order"

export interface NoteInterface {
  date: Date
  fees: number
  withholdingIncomeTax: number
  orders: Array<OrderInterface>
}