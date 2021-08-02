const mfp = require('mfp');
const { getSleepData } = require('../interfaces/ouraRingInterface');
const { updatePage } = require('../interfaces/notionInterface');
const { getDay, createNextWeek } = require('../helpers/notionHelpers');

const { localTime, yearMonthDayFormat } = require('../helpers/momentHelpers');

const exportedValues = {};

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

exportedValues.createNextWeek = createNextWeek;

module.exports = exportedValues;
