import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();
async function main(){
  await prisma.asset.upsert({
    where: { ticker: "BBAS3" },
    update: {},
    create: { ticker: "BBAS3", name: "Banco do Brasil" }
  });
}
main().finally(()=>prisma.$disconnect());
