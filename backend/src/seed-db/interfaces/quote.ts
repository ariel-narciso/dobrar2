export interface QuoteInterface {
  indexes: StockInterface[]
  stocks: StockInterface[]
  availableSectors?: string[]
  availableStockTypes?: string[]
}

export interface StockInterface {
  stock: string
  name: string
}