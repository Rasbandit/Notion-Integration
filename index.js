require('dotenv').config();

const CronJob = require('cron').CronJob

const {createNewDay, setSleepData, createNewWeek} = require('./notion');

new CronJob('* * 1 * * *', createNewDay, null, true, process.env.TIME_ZONE);
new CronJob('* * 12 * * *', setSleepData, null, true, process.env.TIME_ZONE);
new CronJob('* * 1 * * 6', createNewWeek, null, true, process.env.TIME_ZONE);
