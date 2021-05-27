const axios = require('axios');
const moment = require('moment-timezone');
const {getSleepData} = require('./ouraRingApi')

const notionInstance = axios.create({
  baseURL: 'https://api.notion.com/v1',
  headers: {
    common: {
      Authorization: `Bearer ${process.env.NOTION_AUTH_TOKEN}`,
    },
  },
});

values = {};

const localTime = (date) => moment(date).utcOffset(-6);
const onlyDate = (date) => date.format().split('T')[0];

values.createNewDay = async () => {
  const todaysDate = localTime();
  const date = onlyDate(todaysDate);
  const title = todaysDate.format('MMM D, YYYY');
  const { id: weekId } = await values.getWeekOf(todaysDate);
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
          start: date,
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
  const startDate = localTime().weekday(1);
  const endDate = localTime().weekday(7);
  const startDateTitle = startDate.format('MMM D');
  const endDateTitle = endDate.format('MMM D');
  
  const title = `${startDateTitle}-${endDateTitle}`

  let {id: sectionId } = await values.getLatestSection()
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
          end: onlyDate(endDate)
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
};

values.getWeekOf = async (date) => {
  const result = await notionInstance.post(
    `/databases/${process.env.WEEK_DATABASE_ID}/query`,
    {
      filters: {
        and: [
          {
            property: 'Date',
            date: {
              on_or_after: date.weekday(1),
            },
          },
          {
            property: 'Date',
            date: {
              on_or_before: date.weekday(7),
            },
          },
        ],
      },
      sorts: [{ property: 'Date', direction: 'descending' }],
      page_size: 1,
    },
  );
  return result.data.results[0];
};

values.getLatestSection = async () => {
  const result = await notionInstance.post(
    `/databases/${process.env.SECTION_DATABASE_ID}/query`,
    {
      sorts: [{ property: 'Date', direction: 'descending' }],
      page_size: 1,
    },
  );
  return result.data.results[0];
};

values.getDay = async (date) => {
  const result = await notionInstance.post(
    `/databases/${process.env.DAY_DATABASE_ID}/query`,
    {
      filters: {
        and: [
          {
            property: 'Date',
            date: {
              equal: date.format("YYYY-MM-DD"),
            },
          },
        ],
      },
      sorts: [{ property: 'Date', direction: 'descending' }],
      page_size: 1,
    },
  );
  return result.data.results[0];
}

values.setSleepData = async () => {
  const {id} = await values.getDay(localTime())
  let sleepData = await getSleepData(moment());
  
  await notionInstance.patch(`/pages/${id}`, {
    properties: {
      "Sleep Start Hour": sleepData.sleepStartHour,
      "Sleep Start Minute": sleepData.sleepStartMinute,
      "Awake Hour": sleepData.sleepEndHour,
      "Awake Minute": sleepData.sleepEndMinute,
      "Total Sleep Hour": sleepData.totalSleepHour,
      "Total Sleep Minute": sleepData.totalSleepMinuets,
      "Sleep Score": sleepData.score
    }
  })
}

module.exports = values;
