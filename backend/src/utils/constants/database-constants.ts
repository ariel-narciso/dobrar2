import { PrismaClient } from "@prisma/client"

export const prisma = new PrismaClient()

export const ETF_QUOTE_TYPE_CODE = 1
export const STOCK_QUOTE_TYPE_CODE = 2
export const FII_QUOTE_TYPE_CODE = 3

export const PURCHASE_ORDER_TYPE_CODE = 1
export const SALE_ORDER_TYPE_CODE = 2

export const SPLIT_QUOTE_EVENT_TYPE_CODE = 1
export const GROUP_QUOTE_EVENT_TYPE_CODE = 2
export const BONUS_QUOTE_EVENT_TYPE_CODE = 3
export const SUBSCRIPTION_QUOTE_EVENT_TYPE_CODE = 4
