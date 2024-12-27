// global.d.ts
import { PrismaClient } from '@prisma/client'

declare global {
  // Declare the global variable without using var
  namespace NodeJS {
    interface Global {
      cachePrisma: PrismaClient | undefined // Declare the global variable
    }
  }
}

export {} // This makes the file a module
