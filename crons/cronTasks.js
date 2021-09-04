const mfp = require('mfp');
const storage = require('node-persist');
const moment = require('moment');

const { getSleepData } = require('../interfaces/ouraRingInterface');
const { updatePage, queryDatabase } = require('../interfaces/notionInterface');
const {
  getDay,
  createNextWeek,
  createNewDay,
  getWeekOf,
} = require('../helpers/notionHelpers/notionDayAndWeekHelpers');
const { getUpdates } = require('../interfaces/todoistInterface');
const { processUpdates } = require('../helpers/todoistHelpers.js/todoistNotionProcessor');
const {
  processUpdatedItem,
} = require('../helpers/notionHelpers/actionItemUpdated');
const {
  setDefaultStatus,
} = require('./../helpers/notionHelpers/notionActionItemsHelpers');

const { localTime, yearMonthDayFormat } = require('../helpers/momentHelpers');

const { ACTION_ITEMS_DATABASE_ID, GOAL_DATABASE_ID } = process.env;

const exportedValues = {};

const init = async () => {
  if (!storage.getItem) {
    await storage.init();
    await storage.setItem('sync_token', '*');
    await storage.setItem('isFirst', true);
    await storage.setItem('actionItemsLastChecked', moment().seconds(0));
  }
};

init();

exportedValues.setSleepData = async () => {
  for (let i = 0; i < 7; i++) {
    let date = localTime().subtract(i, 'day');
    const { id: pageId } = await getDay(date);
    let sleepData = await getSleepData(date);

    if (sleepData) {
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

exportedValues.createNextDay = async () => {
  const tomorrow = moment().add(1, 'd');
  const week = await getWeekOf(moment(tomorrow));
  createNewDay(tomorrow, week.id);
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

exportedValues.getUpdatedNotionActionItems = async () => {
  let search = {
    sorts: [{ property: 'Last Edited', direction: 'descending' }],
    page_size: 100,
  };
  let response = await queryDatabase(ACTION_ITEMS_DATABASE_ID, search);
  const currentTime = moment().subtract(2, 'minutes').seconds(0);
  response.data.results.forEach((item) => {
    if (moment(item['last_edited_time']).isSame(currentTime, 'minutes')) {
      processUpdatedItem(item);
    }
  });
};

exportedValues.setTasksDefaultStatus = async () => {
  let search = {
    sorts: [{ property: 'Last Edited', direction: 'descending' }],
    page_size: 15
  };
  let response = await queryDatabase(ACTION_ITEMS_DATABASE_ID, search);

  response.data.results.forEach((item) => {
    if (!item?.properties?.Status) {
      setDefaultStatus(item.id);
    }
  });
};

exportedValues.getUpdatedNotionGoals = async () => {
  let search = {
    sorts: [{ property: 'Last Edited', direction: 'descending' }],
    page_size: 10,
  };
  let response = await queryDatabase(GOAL_DATABASE_ID, search);
  const currentTime = moment().subtract(2, 'minutes').seconds(0);
  response.data.results.forEach((item) => {
    if (moment(item['last_edited_time']).isSame(currentTime, 'minutes')) {
      console.log(item);
      // processUpdatedItem(item);
    }
  });
};

exportedValues.createNextWeek = createNextWeek;

module.exports = exportedValues;
