import { Module, Global } from "@nestjs/common";
import { prisma } from "./prisma";

@Global()
@Module({
  providers: [
    {
      provide: "PRISMA_CLIENT",
      useValue: prisma,
    },
  ],
  exports: ["PRISMA_CLIENT"],
})
export class PrismaModule {}
