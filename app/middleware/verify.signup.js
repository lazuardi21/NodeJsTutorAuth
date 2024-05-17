const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const ROLES = ["user", "admin", "moderator"]; // Example roles array, adjust as needed

const checkDuplicateUsernameOrEmail = async (req, res, next) => {
  try {
    // Check for duplicate username
    const userWithSameUsername = await prisma.user.findUnique({
      where: {
        username: req.body.username,
      },
    });

    if (userWithSameUsername) {
      return res.status(400).send({
        message: "Failed! Username is already in use!",
      });
    }

    // Check for duplicate email
    const userWithSameEmail = await prisma.user.findUnique({
      where: {
        email: req.body.email,
      },
    });

    if (userWithSameEmail) {
      return res.status(400).send({
        message: "Failed! Email is already in use!",
      });
    }

    next();
  } catch (error) {
    return res.status(500).send({
      message: "Error occurred while checking for duplicates.",
    });
  }
};

const checkRolesExisted = (req, res, next) => {
  if (req.body.roles) {
    for (let i = 0; i < req.body.roles.length; i++) {
      if (!ROLES.includes(req.body.roles[i])) {
        return res.status(400).send({
          message: "Failed! Role does not exist = " + req.body.roles[i],
        });
      }
    }
  }
  next();
};

const verifySignUp = {
  checkDuplicateUsernameOrEmail,
  checkRolesExisted,
};

module.exports = verifySignUp;
