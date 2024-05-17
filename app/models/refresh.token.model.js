const { PrismaClient } = require('@prisma/client');
const { v4: uuidv4 } = require('uuid');
const config = require('../config/auth.config');

const prisma = new PrismaClient();

const createToken = async (user) => {
    let expiredAt = new Date();
    expiredAt.setSeconds(expiredAt.getSeconds() + config.jwtRefreshExpiration);
  
    let existingRefreshToken = await prisma.refreshToken.findFirst({
      where: { userId: user.id }
    });
  
    if (existingRefreshToken) {
      // Update existing refresh token
      await prisma.refreshToken.update({
        where: { id: existingRefreshToken.id },
        data: {
          expiryDate: expiredAt,
        },
      });
  
      return existingRefreshToken.token;
    } else {
      // Create new refresh token
      let refreshToken = await prisma.refreshToken.create({
        data: {
          token: uuidv4(),
          expiryDate: expiredAt,
          user: { connect: { id: user.id } }
        },
      });
  
      return refreshToken.token;
    }
  };

const verifyExpiration = (token) => {
  return token.expiryDate.getTime() < new Date().getTime();
};

module.exports = {
  createToken,
  verifyExpiration,
};