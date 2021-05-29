require('dotenv').config();

// const express = require('express');
const CronJob = require('cron').CronJob;

// const app = express();

const { createNewDay, setSleepData, createNewWeek, setEatingData } = require('./notion');
// const {refreshAccessToken, initiateFitbitAuthFlow} = require('./fitbit')

// app.get('/fitbit', getAccessToken);

new CronJob('0 0 1 * * *', createNewDay, null, true, process.env.TIME_ZONE);
new CronJob('0 0 */1 * * *', setSleepData, null, true, process.env.TIME_ZONE);
new CronJob('0 0 */6 * * *', setEatingData, null, true, process.env.TIME_ZONE);
new CronJob('0 0 1 * * 6', createNewWeek, null, true, process.env.TIME_ZONE);
// new CronJob('0 0 */7 * * *', refreshAccessToken, null, true, process.env.TIME_ZONE);

// app.listen(443);
