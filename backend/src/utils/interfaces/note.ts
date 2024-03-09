import { OrderInterface } from "./order"

export interface NoteInterface {
  date: Date
  fees: number
  irrf: number
  orders: Array<OrderInterface>
}