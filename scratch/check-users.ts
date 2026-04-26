import "dotenv/config";
import { prisma } from "../lib/prisma";

async function checkUsers() {
  const users = await prisma.user.findMany();
  console.log("Users in DB:", users.map(u => ({ email: u.email, username: u.username })));
}

checkUsers()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
