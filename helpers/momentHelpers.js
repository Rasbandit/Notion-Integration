const moment = require('moment-timezone');

const exportedValues = {};

exportedValues.localTime = (date) => moment(date).utcOffset(-6);
exportedValues.onlyDate = (date) => moment(date).format().split('T')[0];
exportedValues.yearMonthDayFormat = (date) => moment(date).format('YYYY-MM-DD');
exportedValues.formatDayTitle = (date) => moment(date).format('MMM D, YYYY')

module.exports = exportedValues;
