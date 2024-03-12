import { QuoteModel } from "../quote"
import { QuoteTypeModel } from "../quote-type"

export type WalletControlModel = {
  assets: AssetModel[]
  total?: number
  stockQuantity?: number
  fiiQuantity?: number
  etfQuantity?: number
  stockPercentage?: number
  etfPercentage?: number
  fiiPercentage?: number
  stockTotal?: number
  fiiTotal?: number
  etfTotal?: number
  stockTarget?: number
  fiiTarget?: number
  etfTarget?: number
}

export type AssetModel = {
  quote: QuoteModel
  quoteType: QuoteTypeModel
  quantity: number
  acquisitionPrice: number
  currentPrice: number
  marketValue: number
  targetQuantity?: number
  quantityAdjustment?: number
  assetClassPercentage?: number
  appreciatePercentage?: number
  patrimonyPercentage?: number
  targetDifference?: number
}