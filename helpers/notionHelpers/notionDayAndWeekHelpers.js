const moment = require('moment-timezone');

const {
  createPage,
  queryDatabase
} = require('../../interfaces/notionInterface');
const {
  localTime,
  onlyDate,
  yearMonthDayFormat,
  formatDayTitle,
} = require('../momentHelpers');

const {
  DAY_DATABASE_ID,
  WEEK_DATABASE_ID,
  SECTION_DATABASE_ID,
} = process.env;

const values = {};

values.createDaysForWeek = async (startDate, EndDate, weekId) => {
  const formattedEndDate = moment(EndDate);
  const currentDay = moment(startDate);
  while (currentDay.isSameOrBefore(formattedEndDate)) {
    values.createNewDay(currentDay, weekId);
    currentDay.add(1, 'Day');
  }
};

values.createNewDay = async (date, weekId, children = []) => {
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
  await createPage(DAY_DATABASE_ID, properties, children);
};

values.createNextWeek = async () => {
  const startDate = localTime().add(2, 'days').weekday(1);
  const endDate = localTime().add(2, 'days').weekday(7);
  const startDateTitle = startDate.format('MMM D');
  const endDateTitle = endDate.format('MMM D');

  const title = `${startDateTitle}-${endDateTitle}`;

  console.log(values)
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
  const { data } = await createPage(WEEK_DATABASE_ID, properties);
  const { start, end } = data.properties.Date.date;
  const weekId = data.id;
  values.createDaysForWeek(start, end, weekId);
};

values.getWeekOf = async (date) => {
  date = date.startOf('isoWeek');
  const options = {
    filter: {
      property: 'Date',
      date: {
        equals: onlyDate(date.weekday(1)),
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
