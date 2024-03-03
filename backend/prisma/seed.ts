import { PrismaClient } from "@prisma/client";
import { getStocks } from "../src/seed-db/get-stocks";

const prisma = new PrismaClient()

async function main() {
  await stocks()
}

async function stocks() {
  await prisma.stock.deleteMany()
  
  const stocks = await getStocks('stock')
  for (const stock of stocks) {
    await prisma.stock.create({
      data: {
        ticker: stock.stock.toLowerCase(),
        name: stock.name,
        type: 'stock'
      }
    })
  }

  const funds = await getStocks('fund')
  for (const fund of funds) {
    await prisma.stock.create({
      data: {
        ticker: fund.stock.toLowerCase(),
        name: fund.name,
        type: fund.stock != 'ivvb11' ? 'fund' : 'etf'
      }
    })
  }
}

console.log('Connection database started...')
main()
  .then(async () => {
    await prisma.$disconnect()
    console.log('Connection database ended')
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })