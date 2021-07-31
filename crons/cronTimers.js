const CronJob = require('cron').CronJob;
const { setSleepData, createNewWeek, setEatingData } = require('./cronTasks');

const { TIME_ZONE } = process.env.TIME_ZONE;

const crons = {
  sleepDataCron: new CronJob('0 */5 * * * *', setSleepData, null, false, TIME_ZONE),
  eatingDataCron: new CronJob('0 */5 * * * *', setEatingData, null, false, TIME_ZONE),
  createNewWeekCron: new CronJob('0 0 1 * * 6', createNewWeek, null, false, TIME_ZONE)
}

const exportedValues = {};

exportedValues.startAllCrons = () => {
  for(const cron in crons) {
    crons[cron].start();
  }
}

module.exports = exportedValues