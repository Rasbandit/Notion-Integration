require('dotenv').config();

const CronJob = require('cron').CronJob;

const { setSleepData, createNewWeek, setEatingData } = require('./notion');

new CronJob('0 */5 * * * *', setSleepData, null, true, process.env.TIME_ZONE);
new CronJob('0 */5 * * * *', setEatingData, null, true, process.env.TIME_ZONE);
new CronJob('0 0 1 * * 6', createNewWeek, null, true, process.env.TIME_ZONE);
