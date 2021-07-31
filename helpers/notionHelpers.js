const axios = require('axios');
const { createPage, queryDatabase } = require('../interfaces/notionInterface');
const {
  localTime,
  onlyDate,
  yearMonthDayFormat,
  formatDayTitle
} = require('./momentHelpers');

const { DAY_DATABASE_ID, WEEK_DATABASE_ID, SECTION_DATABASE_ID } = process.env;

const notionInstance = axios.create({
  baseURL: 'https://api.notion.com/v1',
  headers: {
    common: {
      Authorization: `Bearer ${process.env.NOTION_AUTH_TOKEN}`,
      'Notion-Version': `2021-05-13`,
    },
  },
});

values = {};

values.createWeeksWorthOfDays = async () => {
  for (i = 2; i < 9; i++) {
    const date = localTime().add(i, 'Days');
    values.createNewDay(date);
  }
};

values.createNewDay = async (date) => {
  const unmutatedDate = moment(date);
  const { id: weekId } = await values.getWeekOf(unmutatedDate);
  const properties = {
    Title: {
      title: [
        {
          text: {
            content: formatDayTitle(date),
          },
        },
      ],
    },
    Date: {
      date: {
        start: onlyDate(date),
      },
    },
    Week: {
      relation: [
        {
          id: weekId,
        },
      ],
    },
  };
  await createPage(DAY_DATABASE_ID, properties);
};

values.createNewWeek = async () => {
  const startDate = localTime().add(2, 'days').weekday(1);
  const endDate = localTime().add(2, 'days').weekday(7);
  const startDateTitle = startDate.format('MMM D');
  const endDateTitle = endDate.format('MMM D');

  const title = `${startDateTitle}-${endDateTitle}`;

  let { id: sectionId } = await values.getLatestSection();
  const properties = {
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
  };
  await createPage(WEEK_DATABASE_ID, properties);
  values.createWeeksWorthOfDays();
};

values.getWeekOf = async (date) => {
  const unmutatedDate = moment(date);
  startOfWeek = unmutatedDate.startOf('isoWeek');
  const options = {
    filter: {
      property: 'Date',
      date: {
        equals: startOfWeek.weekday(1),
      },
    },
    sorts: [{ property: 'Date', direction: 'descending' }],
    page_size: 1,
  };
  const result = await queryDatabase(WEEK_DATABASE_ID, options);
  return result.data.results[0];
};

values.getLatestSection = async () => {
  const options = {
    sorts: [{ property: 'Date', direction: 'descending' }],
    page_size: 1,
  };
  result = await queryDatabase(SECTION_DATABASE_ID, options);
  return result.data.results[0];
};

values.getDay = async (date) => {
  const options = {
    filter: {
      property: 'Date',
      date: {
        equals: yearMonthDayFormat(date),
      },
    },
    sorts: [{ property: 'Date', direction: 'descending' }],
    page_size: 1,
  };
  result = await queryDatabase(DAY_DATABASE_ID, options);
  return result.data.results[0];
};

module.exports = values;
