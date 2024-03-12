import { BRAPI_URL } from "./constants/api-url-constants"
import { QuoteCurrentPriceInterface } from "./interfaces/quote-current-price"
import { config } from 'dotenv'

config()

export async function quoteCurrentPrice(quote: string) {
  const params = new URLSearchParams({
    token: process.env.BRAPI_TOKEN!,
  })
  const url = `${BRAPI_URL}/${quote}?${params}`
  const response = await fetch(url)
  const data: QuoteCurrentPriceInterface = await response.json()
  return data
}

export async function quoteCurrentPriceBatch(tickers: string[]) {
  const quotes: QuoteCurrentPriceInterface[] = []
  for (const ticker of tickers) {
    quotes.push(await quoteCurrentPrice(ticker))
  }
  return quotes
}
