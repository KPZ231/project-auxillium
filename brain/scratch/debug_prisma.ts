import { prisma } from "../../lib/prisma";

async function main() {
  console.log("Prisma keys:", Object.keys(prisma));
  console.log("documentTemplate:", (prisma as any).documentTemplate);
  console.log("DocumentTemplate:", (prisma as any).DocumentTemplate);
}

main().catch(console.error);
