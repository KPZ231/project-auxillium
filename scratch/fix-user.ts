import "dotenv/config";
import { prisma } from "../lib/prisma";

async function fixUser() {
  const result = await prisma.user.update({
    where: { username: "kapieksperimental@gmail.com" },
    data: { email: "kapieksperimental@gmail.com" }
  });
  console.log("Updated user:", result);
}

fixUser()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
