const moment = require('moment');
const storage = require('node-persist');
const {getDay} = require('../helpers/notionHelpers/notionDayAndWeekHelpers');
const {updatePage} = require('../interfaces/notionInterface');
const {startAllCrons, stopAllCrons} = require('../crons/cronTimers');
const {updateOffset} = require('../helpers/momentHelpers');

storage.init();

const exportedValues = {};

exportedValues.taskerEndOfDay = async (req, res) => {
  const {date, secondsInCar} = req.body;
  const formattedDate = moment(date, 'MM-DD-YY');

  let minutesDrove = Math.round(secondsInCar / 60);
  const hoursDrove = Math.floor(minutesDrove / 60);
  minutesDrove -= hoursDrove * 60;

  const {id: pageId} = await getDay(formattedDate);
  await updatePage(pageId, {
    properties: {'Drove Minutes': minutesDrove, 'Drove Hours': hoursDrove},
  });

  res.sendStatus(200);
};

exportedValues.taskerTimezone = async (req, res) => {
  const {offset: newOffset} = req.body;

  const currentOffset = await storage.get('timeZoneOffset');
  if (+currentOffset !== newOffset) {
    await storage.setItem('timeZoneOffset', `${newOffset}`);
    await updateOffset();
    stopAllCrons();
    await startAllCrons();
  }

  res.send(200);
};

module.exports = exportedValues;
