const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const { PrismaClient } = require('@prisma/client');
const app = express();
const winston = require('winston');
const fs = require('fs');
const moment = require('moment-timezone');

const prisma = new PrismaClient();

const expressOasGenerator = require('express-oas-generator');
expressOasGenerator.init(app, {});

// Set the desired timezone
const TIMEZONE = 'Asia/Jakarta'; // Replace with your preferred timezone

// Custom timestamp format function
const timestampFormat = () => moment().tz(TIMEZONE).format('YYYY-MM-DD HH:mm:ss');

const logger = winston.createLogger({
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ filename: 'logfile.log' })
  ],
  format: winston.format.combine(
    winston.format.timestamp({ format: timestampFormat }),
    winston.format.json()
  )
});

app.use((req, res, next) => {
  const { method, url } = req;
  logger.info({ message: `${method} ${url}`, timestamp: timestampFormat() });
  next();
});

app.post('/data', (req, res) => {
  // Simulate data creation/modification
  logger.info({ message: 'Data created/modified', timestamp: timestampFormat() });
  res.send('Data created/modified');
});
var corsOptions = {
    origin: "http://localhost:8081"
};

app.use(cors(corsOptions));

// parse requests of content-type - application/json
app.use(express.json());

// parse requests of content-type - application/x-www-form-urlencoded
app.use(express.urlencoded({ extended: true }));


require("./app/routes/tutorial.routes")(app);
require('./app/routes/auth.routes')(app);
require('./app/routes/user.routes')(app);


// set port, listen for requests
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}.`);
});