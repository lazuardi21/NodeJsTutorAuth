// Assuming your Prisma models are defined in the schema.prisma file
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const db = {};

db.prisma = prisma;

db.user = prisma.user;
db.role = prisma.role;
db.refreshToken = prisma.refreshToken;

db.ROLES = ["user", "admin", "moderator"];
// Define Prisma models
// Note: Prisma models are defined in schema.prisma file

// Define model relationships
// Note: Prisma handles model relationships internally

module.exports = db;