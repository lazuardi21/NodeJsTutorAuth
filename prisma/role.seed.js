const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function initial() {
  try {
    await prisma.role.createMany({
      data: [
        { id: 1, name: 'user' },
        { id: 2, name: 'moderator' },
        { id: 3, name: 'admin' }
      ]
    });
    console.log('Roles created successfully.');
  } catch (error) {
    console.error('Error creating roles:', error);
  } finally {
    await prisma.$disconnect(); // Disconnect Prisma Client
  }
}

initial();