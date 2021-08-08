const mfp = require('mfp');
const storage = require('node-persist');

const { getSleepData } = require('../interfaces/ouraRingInterface');
const { updatePage } = require('../interfaces/notionInterface');
const { getDay, createNextWeek } = require('../helpers/notionHelpers/notionDayAndWeekHelpers');
const { getUpdates } = require('../interfaces/todoistInterface');
const { processUpdates } = require('../helpers/todoistNotionProcessor');

const { localTime, yearMonthDayFormat } = require('../helpers/momentHelpers');

const exportedValues = {};

const init = async () => {
  if (!storage.getItem) {
    await storage.init();
    await storage.setItem('sync_token', '*');
    await storage.setItem('isFirst', true);
  }
};

init();

exportedValues.setSleepData = async () => {
  for (let i = 0; i < 7; i++) {
    let date = localTime().subtract(i, 'day');
    const { id: pageId } = await getDay(date);
    let sleepData = await getSleepData(date);

    await updatePage(pageId, {
      properties: {
        'Sleep Start Hour': sleepData.sleepStartHour,
        'Sleep Start Minute': sleepData.sleepStartMinute,
        'Awake Hour': sleepData.sleepEndHour,
        'Awake Minute': sleepData.sleepEndMinute,
        'Total Sleep Hour': sleepData.totalSleepHour,
        'Total Sleep Minute': sleepData.totalSleepMinuets,
        'Sleep Score': sleepData.score,
      },
    });
  }
};

exportedValues.setEatingData = async () => {
  for (let i = 0; i < 7; i++) {
    let date = localTime().subtract(i, 'day');
    let { id: pageId } = await getDay(date);
    mfp.fetchSingleDate(
      'rasbandit',
      yearMonthDayFormat(date),
      'all',
      function (response) {
        updatePage(pageId, {
          properties: {
            Calories: response.calories,
            Protein: response.protein,
            Carbs: response.carbs,
            Fat: response.fat,
          },
        });
      }
    );
  }
};

exportedValues.getUpdatedTodoistItems = async () => {
  const sync_token = await storage.getItem('sync_token');
  const isFirst = await storage.getItem('isFirst');
  let data = await getUpdates(sync_token);
  storage.updateItem('sync_token', data.sync_token);
  if (!isFirst) {
    processUpdates(data);
  } else {
    await storage.setItem('isFirst', false);
  }
};

exportedValues.createNextWeek = createNextWeek;

module.exports = exportedValues;
