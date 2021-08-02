const { google } = require('googleapis');
const moment = require('moment-timezone');

const { OAuth2 } = google.auth;
const { GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, GOOGLE_REFRESH_TOKEN, CALENDAR_ID } =
  process.env;

const oAuth2Client = new OAuth2(GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET);

oAuth2Client.setCredentials({ refresh_token: GOOGLE_REFRESH_TOKEN });

const calendar = google.calendar({ version: 'v3', auth: oAuth2Client });

const event = {
  summary: "test",
  description: "Did it work",
  start: {
    dateTime: moment(),
    timeZone: 'America/Denver'
  },
  end: {
    dateTime: moment().add(2, 'hour'),
    timeZone: 'America/Denver'
  },
  colorId: 1
}

calendar.events.insert({calendarId: CALENDAR_ID, resource: event}, console.log)