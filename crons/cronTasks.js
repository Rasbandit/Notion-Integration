const mfp = require('mfp');
const storage = require('node-persist');
const moment = require('moment');

const {
  getSleepData,
  getActivityData,
} = require('../interfaces/ouraRingInterface');
const {updatePage, queryDatabase} = require('../interfaces/notionInterface');
const {
  getDay,
  createNextWeek,
  createNewDay,
  getWeekOf,
} = require('../helpers/notionHelpers/notionDayAndWeekHelpers');
const {getUpdates} = require('../interfaces/todoistInterface');
const {
  processUpdates,
} = require('../helpers/todoistHelpers.js/todoistNotionProcessor');
const {
  processUpdatedItem,
} = require('../helpers/notionHelpers/projectsUpdated');
const {
  setDefaultStatus,
} = require('../helpers/notionHelpers/notionActionItemsHelpers');

const {localTime, yearMonthDayFormat} = require('../helpers/momentHelpers');

const {ACTION_ITEMS_DATABASE_ID, GOAL_DATABASE_ID, PROJECT_DATABASE_ID} =
  process.env;

const exportedValues = {};

const init = async () => {
  await storage.init();
  if ((await storage.getItem('isFirst')) !== true) {
    await storage.setItem('sync_token', '*');
    await storage.setItem('isFirst', true);
    await storage.setItem('actionItemsLastChecked', moment().seconds(0));
  }
};

init();

exportedValues.ouraData = async () => {
  for (let i = 0; i < 7; i += 1) {
    getAndProcessOuraData(i);
  }
};

const getAndProcessOuraData = async (offset) => {
  const date = localTime().subtract(offset, 'day');
  const {id: pageId} = await getDay(date);
  const sleepData = await getSleepData(date);
  const activityData = await getActivityData(date);

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
        Steps: activityData.steps,
      },
    });
  }
};

exportedValues.setEatingData = async () => {
  for (let i = 0; i < 7; i += 1) {
    getAndSetEatingData(i);
  }
};

const getAndSetEatingData = async (offset) => {
  const date = localTime().subtract(offset, 'day');
  const {id: pageId} = await getDay(date);
  mfp.fetchSingleDate(
    'rasbandit',
    yearMonthDayFormat(date),
    'all',
    (response) => {
      updatePage(pageId, {
        properties: {
          Calories: response.calories,
          Protein: response.protein,
          Carbs: response.carbs,
          Fat: response.fat,
        },
      });
    },
  );
};

exportedValues.createNextDay = async () => {
  const tomorrow = localTime().add(1, 'd');
  const week = await getWeekOf(moment(tomorrow));
  createNewDay(tomorrow, week.id);
};

exportedValues.getUpdatedTodoistItems = async () => {
  const sync_token = await storage.getItem('sync_token');
  const isFirst = await storage.getItem('isFirst');
  const data = await getUpdates(sync_token);
  storage.updateItem('sync_token', data.sync_token);
  if (!isFirst) {
    processUpdates(data);
  } else {
    await storage.setItem('isFirst', false);
  }
};

exportedValues.getUpdatedProjects = async () => {
  const search = {
    sorts: [{property: 'Last Edited', direction: 'descending'}],
    page_size: 60,
  };
  const response = await queryDatabase(PROJECT_DATABASE_ID, search);
  const currentTime = moment().subtract(2, 'minutes').seconds(0);
  response.data.results.forEach((item) => {
    if (moment(item.last_edited_time).isSame(currentTime, 'minutes')) {
      processUpdatedItem(item);
    }
  });
};

exportedValues.setTasksDefaultStatus = async () => {
  const search = {
    sorts: [{property: 'Last Edited', direction: 'descending'}],
    page_size: 15,
  };
  const response = await queryDatabase(ACTION_ITEMS_DATABASE_ID, search);

  response.data.results.forEach((item) => {
    if (!item?.properties?.Status) {
      setDefaultStatus(item.id);
    }
  });
};

exportedValues.getUpdatedNotionGoals = async () => {
  const search = {
    sorts: [{property: 'Last Edited', direction: 'descending'}],
    page_size: 10,
  };
  const response = await queryDatabase(GOAL_DATABASE_ID, search);
  const currentTime = moment().subtract(2, 'minutes').seconds(0);
  response.data.results.forEach((item) => {
    if (moment(item.last_edited_time).isSame(currentTime, 'minutes')) {
      console.log(item);
      // processUpdatedItem(item);
    }
  });
};

exportedValues.createNextWeek = createNextWeek;

module.exports = exportedValues;
