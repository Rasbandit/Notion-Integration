const axios = require('axios');
const storage = require('node-persist');

const todoistSyncInterface = axios.create({
  baseURL: 'https://api.todoist.com/sync/v8/sync',
  headers: {
    common: {
      Authorization: `Bearer ${process.env.TODOIST_API_TOKEN}`,
    },
  },
});

const todoistRestInterface = axios.create({
  baseURL: 'https://api.todoist.com/rest/v1',
  headers: {
    common: {
      Authorization: `Bearer ${process.env.TODOIST_API_TOKEN}`,
    },
  },
});

const exportedValues = {};

const resource_types = `["items", "projects", "sections", "reminders"]`;

exportedValues.getUpdates = async (sync_token) => {
  const { data } = await todoistSyncInterface.post('', {
    sync_token,
    resource_types,
  });
  return data;
};

exportedValues.getLabel = async (labelId) =>
  await todoistRestInterface.get(`/labels/${labelId}`);

module.exports = exportedValues;
