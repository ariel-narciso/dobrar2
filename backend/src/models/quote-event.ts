export type QuoteEventModel = {
  id?: string
  quoteId: string
  quoteEventTypeId: string
  date: Date
  quantity?: number
  value: number
}