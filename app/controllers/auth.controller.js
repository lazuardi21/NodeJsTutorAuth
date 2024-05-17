const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const config = require('../config/auth.config');
const db = require("../models");
const { user: User, role: Role, refreshToken: RefreshToken } = db;
const { createToken } = require("../models/refresh.token.model");

exports.signup = async (req, res) => {
  try {
    const { username, email, password, roles } = req.body;

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 8);

    // Create the user with connectOrCreate for roles
    const user = await prisma.user.create({
      data: {
        username,
        email,
        password: hashedPassword,
        userRoles: {
          create: roles.map(role => ({
            role: {
              connectOrCreate: {
                where: { name: role },
                create: { name: role }
              }
            }
          }))
        }
      }
    });

    res.send({ message: "User was registered successfully!" });
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
};

exports.signin = async (req, res) => {
  const { username, password } = req.body;

  try {
    const user = await prisma.user.findUnique({
      where: { username }
    });

    if (!user) {
      return res.status(404).send({ message: "User Not found." });
    }

    const passwordIsValid = bcrypt.compareSync(password, user.password);

    if (!passwordIsValid) {
      return res.status(401).send({
        accessToken: null,
        message: "Invalid Password!"
      });
    }

    const token = jwt.sign({ id: user.id }, config.secret, {
      expiresIn: config.jwtExpiration
    });

    const refreshToken = await createToken(user);

    const roles = await prisma.userRole.findMany({
      where: { userId: user.id },
      select: { role: true }
    });

    const authorities = roles.map(role => {
      let data = Object.values(role)[0];
      if (data.name) {
        return `ROLE_${data.name.toUpperCase()}`;
      } else {
        return ''; // or any other default value you want to assign
      }
    });
    

    res.status(200).send({
      id: user.id,
      username: user.username,
      email: user.email,
      roles: authorities,
      accessToken: token,
      refreshToken,
    });
  } catch (err) {
    res.status(500).send({ message: err.message });
  }
};

exports.refreshToken = async (req, res) => {
  const { refreshToken: requestToken } = req.body;

  if (!requestToken) {
    return res.status(403).json({ message: "Refresh Token is required!" });
  }

  try {
    const refreshToken = await prisma.refreshToken.findUnique({
      where: { token: requestToken },
      include: { user: true }
    });

    if (!refreshToken) {
      return res.status(403).json({ message: "Refresh token is not in database!" });
    }

    if (refreshToken.expiryDate.getTime() < new Date().getTime()) {
      await prisma.refreshToken.delete({
        where: { id: refreshToken.id }
      });

      return res.status(403).json({
        message: "Refresh token was expired. Please make a new signin request",
      });
    }

    const newAccessToken = jwt.sign({ id: refreshToken.userId }, config.secret, {
      expiresIn: config.jwtExpiration,
    });

    return res.status(200).json({
      accessToken: newAccessToken,
      refreshToken: refreshToken.token,
    });
  } catch (err) {
    return res.status(500).send({ message: err });
  }
};
