import { PrismaClient } from "@prisma/client";
import { getStocks } from "../src/seed-db/get-stocks";
import { getNotes } from "../src/seed-db/get-notes";
import { OrderInterface } from "../src/seed-db/interfaces/order";
import { OrderModelInterface } from "../src/seed-db/interfaces/order-model";

const prisma = new PrismaClient()

async function main() {

  await prisma.order.deleteMany()
  await prisma.note.deleteMany()
  await prisma.stock.deleteMany()

  console.log('... Inserting stocks on the database ...')
  await stocks()

  console.log('... Inserting notes and orders on the database ...')
  await notes()

  console.log('... Insertion complete ...')
}

async function stocks() {
  
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

async function notes() {

  const notes = await getNotes()
  for (const note of notes) {
    await prisma.note.create({
      data: {
        date: note.date,
        fees: note.fees,
        withholdingIncomeTax: note.withholdingIncomeTax,
        Order: {
          create: await getOrdersWithTickerId(note.orders)
        }
      }
    })
  }
}

async function getOrdersWithTickerId(orders: Array<OrderInterface>) {
  const ans: Array<OrderModelInterface> = []
  for (const order of orders) {
    const stock = await prisma.stock.findUnique({
      where: {
        ticker: order.ticket
      }
    })
    ans.push({
      stockId: stock!.id,
      type: order.type == 'c',
      quantity: order.quantity,
      price: order.price
    })
  }
  return ans
}

console.log('... Connection database started ...')
main()
  .then(async () => {
    await prisma.$disconnect()
    console.log('... Connection database ended ...')
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })
