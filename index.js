require('dotenv').config();

const CronJob = require('cron').CronJob;

const { createNewDay, setSleepData, createNewWeek, setEatingData } = require('./notion');

new CronJob('0 0 20 * * *', createNewDay, null, true, process.env.TIME_ZONE);
new CronJob('0 0 */1 * * *', setSleepData, null, true, process.env.TIME_ZONE);
new CronJob('0 0 */1 * * *', setEatingData, null, true, process.env.TIME_ZONE);
new CronJob('0 0 1 * * 6', createNewWeek, null, true, process.env.TIME_ZONE);
