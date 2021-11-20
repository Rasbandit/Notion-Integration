require('dotenv').config();

const express = require('express');
const {startAllCrons} = require('./crons/cronTimers');
const {taskerEndOfDay, taskerTimezone} = require('./endpoints/notionEndpoints');

const app = express();
const {PORT} = process.env;

app.use(express.json());
app.use(express.urlencoded({extended: true}));

app.post('/webhook/tasker', taskerEndOfDay);
app.post('/webhook/timezone', taskerTimezone);

app.listen(PORT, () => {
  startAllCrons();
  console.log(`Running full speed at ${PORT} MPH`);
});
