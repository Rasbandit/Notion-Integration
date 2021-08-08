const CronJob = require('cron').CronJob;
const { setSleepData, createNextWeek, setEatingData, getUpdatedTodoistItems } = require('./cronTasks');

const { TIME_ZONE } = process.env.TIME_ZONE;

const crons = {
  sleepDataCron: new CronJob(
    '0 */5 * * * *',
    setSleepData,
    null,
    false,
    TIME_ZONE
  ),
  eatingDataCron: new CronJob(
    '0 */5 * * * *',
    setEatingData,
    null,
    false,
    TIME_ZONE
  ),
  createNextWeekCron: new CronJob(
    '0 0 1 * * 6',
    createNextWeek,
    null,
    false,
    TIME_ZONE
  ),
  syncTodoist: new CronJob(
    '*/5 * * * * *',
    getUpdatedTodoistItems,
    null,
    false,
    TIME_ZONE
  )
};

const exportedValues = {};

exportedValues.startAllCrons = () => {
  for (const cron in crons) {
    exportedValues.startCron(cron);
  }
};

exportedValues.stopAllCrons = () => {
  for (const cron in crons) {
    exportedValues.stopCron(cron);
  }
};

exportedValues.startCron = (cronName) => {
  crons[cronName].start();
};
exportedValues.stopCron = (cronName) => {
  crons[cronName].stop();
};

module.exports = exportedValues;
