require('dotenv').config();
const axios = require('axios');

const express = require('express');
const {startAllCrons} = require('./crons/cronTimers');
const {taskerWebhook} = require('./endpoints/notionEndpoints');
// require('./interfaces/googleCalendarInterface')

const app = express();
const {PORT} = process.env;

app.use(express.json());
app.use(express.urlencoded({extended: true}));

app.post('/webhook/tasker', taskerWebhook);

app.listen(PORT, () => {
  startAllCrons();
  console.log(`Running full speed at ${PORT} MPH`);
});
