export interface QuoteCurrentPriceInterface {
  requestedAt: string
  results: QuoteData[]
}

interface QuoteData {
  symbol: string
  regularMarketTime: Date
  regularMarketPrice: number
  logourl: string
}