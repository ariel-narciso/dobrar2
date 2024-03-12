import { BRAPI_URL } from './constants/api-url-constants'
import { QuoteInterface, StockInterface } from './interfaces/quote'
import { config } from 'dotenv'

config()

export async function getStocks(type: 'stock' | 'fund'): Promise<StockInterface[]> {
  const params = new URLSearchParams({
    token: process.env.BRAPI_TOKEN!,
    type: type
  })
  const url = `${BRAPI_URL}/list?${params}`
  const response = await fetch(url)
  const quotes = await response.json() as QuoteInterface
  return quotes.stocks
    .filter(stock => !stock.stock.endsWith("F"))
    .map(stock => ({
      stock: stock.stock.toLowerCase(),
      name: stock.name
    }))
}
