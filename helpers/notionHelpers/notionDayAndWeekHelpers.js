const moment = require('moment-timezone');

const {
  createPage,
  queryDatabase,
  getPageContent,
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
  PERIOD_DATABASE_ID
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
  const year = moment(startDate).format('YYYY')

  const title = `${year} ${startDateTitle} - ${endDateTitle}`;

  let section = await values.getLatestSection();
  if (section.properties.Weeks.relation.length >= 4) {
    section = await values.createNewSection(startDate);
  }

  let { id: sectionId } = section;
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

values.createNewSection = async (startDate) => {
  let period = await values.getLatestPeriod();
  if (period.properties.Sections.relation.length >= 3) {
    period = await values.createPeriod(startDate);
  }
  const endDate = moment(startDate).add(4, 'Weeks').weekday(0);
  const startDateTitle = moment(startDate).format('MMM D');
  const endDateTitle = moment(endDate).format('MMM D');
  const year = moment(startDate).format('YYYY')

  const title = `${year}, ${startDateTitle} - ${endDateTitle}`;
  let { id: periodId } = period;

  const properties = {
    Name: {
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
    Period: {
      relation: [
        {
          id: periodId,
        },
      ],
    },
  };
  const results = await createPage(SECTION_DATABASE_ID, properties);
  return results.data;
};

values.createPeriod = async (startDate) => {
  const endDate = moment(startDate).add(12, 'Weeks').weekday(0);

  const startDateTitle = moment(startDate).format('MMM');
  const endDateTitle = moment(endDate).format('MMM');
  const year = moment(startDate).format('YYYY')

  const title = `${year}, ${startDateTitle} - ${endDateTitle}`;
  const properties = {
    Name: {
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
  };
  const result = await createPage(PERIOD_DATABASE_ID, properties);
  return result.data
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

values.getLatestPeriod = async () => {
  const options = {
    sorts: [{ property: 'Date', direction: 'descending' }],
    page_size: 1,
  };
  result = await queryDatabase(PERIOD_DATABASE_ID, options);
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
