require('dotenv').config();

const express = require('express');
const { startAllCrons } = require('./crons/cronTimers');
// require('./interfaces/googleCalendarInterface')

const app = express();
const { PORT } = process.env;

app.get('/calendar', function (req, res) {
  console.log('made it');
  res.send('Hello World');
});

app.listen(PORT, () => {
  startAllCrons();
  console.log(`Running full speed at ${PORT} MPH`)
});
