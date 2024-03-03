export interface OrderInterface {
  type: 'c' | 'v'
  ticket: string
  quantity: number
  price: number
}
