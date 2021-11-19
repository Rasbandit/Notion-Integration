const moment = require('moment');
const {getDay} = require('../helpers/notionHelpers/notionDayAndWeekHelpers');
const {updatePage} = require('../interfaces/notionInterface');

const exportedValues = {};

exportedValues.taskerWebhook = async (req, res) => {
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

module.exports = exportedValues;
