import { NoteModel } from "../models/note";
import { OrderModel } from "../models/order";
import { prisma } from "../utils/constants/database-constants";

export class NoteService {

  static async addNote(note: NoteModel, orders: OrderModel[]) {
    note = await prisma.note.create({
      data: {
        ...note,
        Order: {
          create: orders
        }
      }
    })
    return note
  }

  static async getNoteById(id: string): Promise<NoteModel | null> {
    const note = await prisma.note.findUnique({
      where: { id }
    })
    return note
  }

  static async getNotes(sortType?: 'asc' | 'desc'): Promise<NoteModel[]> {
    return await prisma.note.findMany({
      orderBy: { date: sortType }
    })
  }
}
