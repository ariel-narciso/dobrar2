import { QuantityPriceModel, QuoteStockModel } from "../../models/transients/variable-income-tab";
import { AssetModel, WalletControlModel } from "../../models/transients/wallet-control";
import { ETF_QUOTE_TYPE_CODE, FII_QUOTE_TYPE_CODE, STOCK_QUOTE_TYPE_CODE } from "../../utils/constants/database-constants";
import { quoteCurrentPrice } from "../../utils/quote-current-price";
import { QuoteService } from "../quote-service";
import { QuoteTypeService } from "../quote-type-service";
import { VariableIncomeTabService } from "./variable-income-tab-service";

export class WalletControlService {

  data: WalletControlModel = { assets: [] }
  #historyService = new VariableIncomeTabService()

  async get() {
    await this.#historyService.get()
    const quoteStock = this.#historyService.quoteStock
    for (const ticker in quoteStock) {
      if (quoteStock[ticker].quantity == 0) {
        delete quoteStock[ticker]
      }
    }
    const currentPrices = await this.#getCurrentPrices(quoteStock)
    for (const quote of currentPrices) {
      this.data.assets.push(
        await this.#initAssets(quote.ticker, quoteStock[quote.ticker], quote.price)
      )
    }
    this.#setGeneralWalletControlInfo(this.data.assets)
    for (let idx = 0; idx < this.data.assets.length; idx++) {
      this.#completeSetAssetInfo(this.data.assets[idx])
    }
  }

  async #getCurrentPrices(quoteStock: QuoteStockModel) {
    let currentPrices: {ticker: string, price: number}[] = []
    for (const ticker in quoteStock) {
      const res = await quoteCurrentPrice(ticker)
      currentPrices.push({
        ticker,
        price: res.results[0].regularMarketPrice
      })
    }
    return currentPrices
  }

  async #initAssets(ticker: string, stock: QuantityPriceModel, currentPrice: number) {
    const quote = await QuoteService.getQuoteByTicker(ticker)
    const quoteType = await QuoteTypeService.getById(quote!.quoteTypeId)
    const obj: AssetModel = {
      quote: quote!,
      quoteType: quoteType!,
      acquisitionPrice: stock.price,
      quantity: stock.quantity,
      currentPrice: currentPrice,
      marketValue: stock.quantity * currentPrice
    }
    const totalCost = obj.quantity * obj.acquisitionPrice
    obj.appreciatePercentage = (obj.marketValue - totalCost) / totalCost
    return obj
  }

  #setGeneralWalletControlInfo(assets: AssetModel[]) {
    this.data.etfQuantity = 0
    this.data.fiiQuantity = 0
    this.data.stockQuantity = 0
    this.data.stockTotal = 0
    this.data.fiiTotal = 0
    this.data.etfTotal = 0
    this.data.total = 0
    for (const asset of assets) {
      switch (asset.quoteType.code) {
        case STOCK_QUOTE_TYPE_CODE:
          this.data.stockQuantity++
          this.data.stockTotal += asset.marketValue
          break
        case FII_QUOTE_TYPE_CODE:
          this.data.fiiQuantity++
          this.data.fiiTotal += asset.marketValue
          break
        case ETF_QUOTE_TYPE_CODE:
          this.data.etfQuantity++
          this.data.etfTotal += asset.marketValue
      }
      this.data.total += asset.marketValue
    }
    this.data.stockPercentage = 100 / this.data.stockQuantity
    this.data.fiiPercentage = 100 / this.data.fiiQuantity
    this.data.etfPercentage = 100 / this.data.etfQuantity
    this.data.stockTarget = this.data.stockTotal / this.data.stockQuantity
    this.data.fiiTarget = this.data.fiiTotal / this.data.fiiQuantity
    this.data.etfTarget = this.data.etfTotal / this.data.etfQuantity
  }

  #completeSetAssetInfo(asset: AssetModel) {
    switch(asset.quoteType.code) {
      case STOCK_QUOTE_TYPE_CODE:
        asset.assetClassPercentage = asset.marketValue / this.data.stockTotal!
        asset.targetDifference = asset.marketValue - this.data.stockTarget!
        asset.targetQuantity = this.data.stockTarget! / asset.currentPrice
        break
      case FII_QUOTE_TYPE_CODE:
        asset.assetClassPercentage = asset.marketValue / this.data.fiiTotal!
        asset.targetDifference = asset.marketValue - this.data.fiiTarget!
        asset.targetQuantity = this.data.fiiTarget! / asset.currentPrice
        break
      case ETF_QUOTE_TYPE_CODE:
        asset.assetClassPercentage = asset.marketValue / this.data.etfTotal!
        asset.targetDifference = asset.marketValue - this.data.etfTarget!
        asset.targetQuantity = this.data.etfTarget! / asset.currentPrice
        break
    }
    asset.quantityAdjustment = asset.targetQuantity! - asset.quantity
    asset.patrimonyPercentage = asset.marketValue / this.data.total!
  }
}
