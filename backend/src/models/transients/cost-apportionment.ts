export type CostApportionmentModel = {
  orders: CostApportionmentOrderModel[]
  fees: number // soma das taxas = total sem irrf
  irrf: number
  feesWithIRRF: number // fees + irrf
  totalPurchases: number
  totalSales: number
  net: number // valor liquido sem irrf
  netWithIrrf: number // valor liquido com irrf
}

export type CostApportionmentOrderModel = {
  ticker: string
  quantity: number
  price: number
  value: number
  percentage: number
  fees: number
  irrf: number
}