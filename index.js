require('dotenv').config();

const express = require('express');
const { startAllCrons } = require('./crons/cronTimers');
// require('./interfaces/googleCalendarInterface')

const app = express();
const { PORT } = process.env;

app.listen(PORT, () => {
  startAllCrons();
  console.log(`Running full speed at ${PORT} MPH`)
});
