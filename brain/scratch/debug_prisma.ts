import { prisma } from "../../lib/prisma";

async function main() {
  console.log("Prisma keys:", Object.keys(prisma));
  console.log("documentTemplate:", (prisma as unknown as { documentTemplate?: unknown }).documentTemplate);
  console.log("DocumentTemplate:", (prisma as unknown as { DocumentTemplate?: unknown }).DocumentTemplate);
}

main().catch(console.error);
