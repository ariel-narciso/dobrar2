import { QuoteInterface, StockInterface } from './quote'
import 'dotenv/config'

export async function getStocks(type: 'stock' | 'fund'): Promise<StockInterface[]> {
  const params = new URLSearchParams({
    token: process.env.BRAPI_TOKEN as string,
    type: type
  })
  const response = await fetch(`https://brapi.dev/api/quote/list?${params}`)
  const quotes = await response.json() as QuoteInterface
  return quotes.stocks
    .filter(stock => !stock.stock.endsWith("F"))
    .map(stock => ({
      stock: stock.stock.toLowerCase(),
      name: stock.name
    }))
}