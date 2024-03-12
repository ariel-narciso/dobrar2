export type VariableIncomeTabModel = {
  date: Date
  ticker: string
  quantity: number
  price: number
  fees: number
  irrf: number
  total: number
  totalWithFees: number
  priceWithFees: number
  quantityStock: number
  averagePrice: number
}

export type QuantityPriceModel = {
  quantity: number
  price: number
}

export type QuoteStockModel = {
  [key: string]: QuantityPriceModel
}