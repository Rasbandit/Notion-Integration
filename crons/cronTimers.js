const {CronJob} = require('cron');
const storage = require('node-persist');
const {
  ouraData,
  createNextWeek,
  setEatingData,
  getUpdatedTodoistItems,
  createNextDay,
  getUpdatedProjects,
} = require('./cronTasks');

const crons = {
  ouraData: (offset) =>
    new CronJob(
      '0 */5 * * * *',
      ouraData,
      null,
      false,
      null,
      null,
      false,
      offset,
    ),
  eatingDataCron: (offset) =>
    new CronJob(
      '0 */5 * * * *',
      setEatingData,
      null,
      false,
      null,
      null,
      false,
      offset,
    ),
  createNewWeekCron: (offset) =>
    new CronJob(
      '0 0 1 * * 6',
      createNextWeek,
      null,
      false,
      null,
      null,
      false,
      offset,
    ),
  createNewDayCron: (offset) =>
    new CronJob(
      '0 21 * * *',
      createNextDay,
      null,
      false,
      null,
      null,
      false,
      offset,
    ),
  // syncTodoist: (offset) =>
  //   new CronJob(
  //     '*/5 * * * * *',
  //     getUpdatedTodoistItems,
  //     null,
  //     false,
  //     null,
  //     null,
  //     false,
  //     offset,
  //   ),
  notionProjects: (offset) =>
    new CronJob(
      '0 */1 * * * *',
      getUpdatedProjects,
      null,
      false,
      null,
      null,
      false,
      offset,
    ),
  // notionActionItemsDefaults: (offset) =>
  //   new CronJob(
  //     '*/5 * * * * *',
  //     setTasksDefaultStatus,
  //     null,
  //     false,
  //     null,
  //     null,
  //     false,
  //     offset,
  //   ),
  // notionGoalsItems: new CronJob(
  //   '*/5 * * * * *',
  //   getUpdatedNotionGoals,
  //   null,
  //   false,
  //   TIME_ZONE
  // ),
};

const exportedValues = {};

const activeCrons = {};

exportedValues.startAllCrons = async () => {
  await storage.init();
  const timeZoneOffset = +(await storage.get('timeZoneOffset'));
  Object.keys(crons).forEach((key) => {
    activeCrons[key] = crons[key](timeZoneOffset);
    activeCrons[key].start();
  });
};

exportedValues.stopAllCrons = () => {
  Object.keys(crons).forEach((key) => {
    activeCrons[key].stop();
  });
};

module.exports = exportedValues;
