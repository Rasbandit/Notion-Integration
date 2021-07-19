const axios = require('axios');
const moment = require('moment-timezone');
var mfp = require('mfp');

const { getSleepData } = require('./ouraRingApi');

const notionInstance = axios.create({
  baseURL: 'https://api.notion.com/v1',
  headers: {
    common: {
      Authorization: `Bearer ${process.env.NOTION_AUTH_TOKEN}`,
      "Notion-Version": `2021-05-13`
    },
  },
});

values = {};

const localTime = (date) => moment(date).utcOffset(-6);
const onlyDate = (date) => date.format().split('T')[0];

values.createWeeksWorthOfDays = async () => {
  for(i = 2 ; i < 9; i++) {
    const date = localTime().add(i, "Days");
    values.createNewDay(date)
  }
}

values.createNewDay = async (date) => {
  const specificDate = onlyDate(date);
  const title = date.format('MMM D, YYYY');
  const { id: weekId } = await values.getWeekOf(date);
  const body = {
    parent: {
      database_id: process.env.DAY_DATABASE_ID,
    },
    properties: {
      Title: {
        title: [
          {
            text: {
              content: title,
            },
          },
        ],
      },
      Date: {
        date: {
          start: specificDate,
        },
      },
      Week: {
        relation: [
          {
            id: weekId,
          },
        ],
      },
    },
  };
  await notionInstance.post('/pages', body);
};

values.createNewWeek = async () => {
  const startDate = localTime().add(2, "days").weekday(1);
  const endDate = localTime().add(2, "days").weekday(7);
  const startDateTitle = startDate.format('MMM D');
  const endDateTitle = endDate.format('MMM D');

  const title = `${startDateTitle}-${endDateTitle}`;

  let { id: sectionId } = await values.getLatestSection();
  const body = {
    parent: {
      database_id: process.env.WEEK_DATABASE_ID,
    },
    properties: {
      Dates: {
        title: [
          {
            text: {
              content: title,
            },
          },
        ],
      },
      Date: {
        date: {
          start: onlyDate(startDate),
          end: onlyDate(endDate),
        },
      },
      Section: {
        relation: [
          {
            id: sectionId,
          },
        ],
      },
    },
  };
  await notionInstance.post('/pages', body);
  values.createWeeksWorthOfDays();
};

values.getWeekOf = async (date) => {
  date = date.startOf('isoWeek');
  const result = await notionInstance.post(
    `/databases/${process.env.WEEK_DATABASE_ID}/query`,
    {
      filter: {
        property: 'Date',
        date: {
          equals: date.weekday(1),
        },
      },
      sorts: [{ property: 'Date', direction: 'descending' }],
      page_size: 1,
    }
  );
  return result.data.results[0];
};

values.getLatestSection = async () => {
  const result = await notionInstance.post(
    `/databases/${process.env.SECTION_DATABASE_ID}/query`,
    {
      sorts: [{ property: 'Date', direction: 'descending' }],
      page_size: 1,
    }
  );
  return result.data.results[0];
};

values.getDay = async (date) => {
  const result = await notionInstance.post(
    `/databases/${process.env.DAY_DATABASE_ID}/query`,
    {
      filter: {
        property: 'Date',
        date: {
          equals: date.format('YYYY-MM-DD'),
        },
      },
      sorts: [{ property: 'Date', direction: 'descending' }],
      page_size: 1,
    }
  );
  return result.data.results[0];
};

values.setSleepData = async () => {
  for (let i = 0; i < 7; i++) {
    let date = localTime().subtract(i, 'day');
    const { id } = await values.getDay(date);
    let sleepData = await getSleepData(date);

    await notionInstance.patch(`/pages/${id}`, {
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

values.setEatingData = async () => {
  for (let i = 0; i < 7; i++) {
    let date = localTime().subtract(i, 'day');
    let { id: dayId } = await values.getDay(date);
    mfp.fetchSingleDate(
      'rasbandit',
      date.format('YYYY-MM-DD'),
      'all',
      function (response) {
        notionInstance.patch(`/pages/${dayId}`, {
          properties: {
            // Water: response.water,
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

module.exports = values;