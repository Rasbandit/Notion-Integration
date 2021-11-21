const moment = require('moment-timezone');
const storage = require('node-persist');

const exportedValues = {};

let offset = -6;

const init = async () => {
  await storage.init();
  if (!(await storage.get('timeZoneOffset'))) {
    await storage.setItem('timeZoneOffset', '-6');
  }
  offset = await storage.getItem('timeZoneOffset');
};

init();

exportedValues.updateOffset = async () => {
  offset = await storage.getItem('timeZoneOffset');
};

exportedValues.localTime = () => moment.utc().add(+offset, 'hour');
exportedValues.onlyDate = (date) => moment(date).format().split('T')[0];
exportedValues.yearMonthDayFormat = (date) => moment(date).format('YYYY-MM-DD');
exportedValues.formatDayTitle = (date) => moment(date).format('MMM D, YYYY');

module.exports = exportedValues;
