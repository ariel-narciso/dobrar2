export type OrderModel = {
  id?: string
  noteId?: string
  quoteId: string
  orderTypeId: string
  price: number
  quantity: number
}