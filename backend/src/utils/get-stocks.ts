import { QuoteInterface, StockInterface } from './interfaces/quote'
// import 'dotenv/config' // DANDO ERRO

export async function getStocks(type: 'stock' | 'fund'): Promise<StockInterface[]> {
  const params = new URLSearchParams({
    token: 'auhauha' as string,
    type: type
  })
  const url = `https://brapi.dev/api/quote/list?${params}`
  const response = await fetch(url)
  const quotes = await response.json() as QuoteInterface
  return quotes.stocks
    .filter(stock => !stock.stock.endsWith("F"))
    .map(stock => ({
      stock: stock.stock.toLowerCase(),
      name: stock.name
    }))
}
