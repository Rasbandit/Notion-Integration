

const axios = require('axios');
const moment = require('moment-timezone');

const ouraInstance = axios.create({
  baseURL: 'https://api.ouraring.com/v1/',
  headers: {
    common: {
      Authorization: `Bearer ${process.env.OURA_ACCESS_TOKEN}`,
    },
  },
});

const values = {}

values.getSleepData = async (date) => {
  const previousDay = date.subtract(1, "days").format("YYYY-MM-DD")
  const response = await ouraInstance.get(`/sleep?start=${previousDay}`)
  const sleepData = response.data.sleep[0]

  if(!sleepData) return;

  const startTime = moment(sleepData.bedtime_start).tz(process.env.TIME_ZONE)
  const endTime = moment(sleepData.bedtime_end).tz(process.env.TIME_ZONE)

  let sleepStartHour = +startTime.format("HH")
  const sleepStartMinute = +startTime.format("m")
  const sleepEndHour = +endTime.format("HH")
  const sleepEndMinute = +endTime.format("m")

  const totalSleepHour = Math.floor(sleepData.total/60/60)
  const totalSleepMinuets = getMinutes(sleepData.total)


  if(sleepStartHour < 12) {
    sleepStartHour += 24
  }

  return {
    sleepStartHour,
    sleepStartMinute,
    sleepEndHour,
    sleepEndMinute,
    score: sleepData.score,
    totalSleepMinuets,
    totalSleepHour
  }
}

const getMinutes = (seconds) => {
  const [hours, minutes] = `${seconds/60/60}`.split(".")
  const percentMinutes = +minutes.substring(0,2)
  return Math.round((percentMinutes/100)*60)
}

module.exports = values