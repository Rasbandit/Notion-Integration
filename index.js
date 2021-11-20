require('dotenv').config();

const express = require('express');
const {startAllCrons} = require('./crons/cronTimers');
const {taskerWebhook, taskerTimezone} = require('./endpoints/notionEndpoints');

const app = express();
const {PORT} = process.env;

app.use(express.json());
app.use(express.urlencoded({extended: true}));

app.post('/webhook/tasker', taskerWebhook);
app.post('/webhook/timezone', taskerTimezone);

app.listen(PORT, () => {
  startAllCrons();
  console.log(`Running full speed at ${PORT} MPH`);
});
