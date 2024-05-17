const jwt = require('jsonwebtoken');
const config = require('../config/auth.config.js');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const { TokenExpiredError } = jwt;

const catchError = (err, res) => {
  if (err instanceof TokenExpiredError) {
    return res.status(401).send({ message: "Unauthorized! Access Token was expired!" });
  }

  return res.sendStatus(401).send({ message: "Unauthorized!" });
}

const verifyToken = (req, res, next) => {
  let token = req.headers['x-access-token'];

  if (!token) {
    return res.status(403).send({
      message: 'No token provided!',
    });
  }

  jwt.verify(token, config.secret, (err, decoded) => {
    if (err) {
      return catchError(err, res);
    }
    req.userId = decoded.id;
    next();
  });

  // jwt.verify(token, config.secret, (err, decoded) => {
  //   if (err) {
  //     return res.status(401).send({
  //       message: 'Unauthorized!',
  //     });
  //   }
  //   req.userId = decoded.id;
  //   next();
  // });
};

const isAdmin = async (req, res, next) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.userId },
      include: { userRoles: { include: { role: true } } },
    });

    if (user && user.userRoles.some(userRole => userRole.role.name === 'admin')) {
      next();
      return;
    }

    res.status(403).send({
      message: 'Require Admin Role!',
    });
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
};

const isModerator = async (req, res, next) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.userId },
      include: { userRoles: { include: { role: true } } },
    });

    if (user && user.userRoles.some(userRole => userRole.role.name === 'moderator')) {
      next();
      return;
    }

    res.status(403).send({
      message: 'Require Moderator Role!',
    });
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
};

const isModeratorOrAdmin = async (req, res, next) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.userId },
      include: { userRoles: { include: { role: true } } },
    });

    if (user && user.userRoles.some(userRole => userRole.role.name === 'moderator' || userRole.role.name === 'admin')) {
      next();
      return;
    }

    res.status(403).send({
      message: 'Require Moderator or Admin Role!',
    });
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
};



const authJwt = {
  verifyToken,
  isAdmin,
  isModerator,
  isModeratorOrAdmin,
};

module.exports = authJwt;
