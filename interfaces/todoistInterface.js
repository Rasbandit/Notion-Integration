const axios = require('axios');

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
  const {data} = await todoistSyncInterface.post('', {
    sync_token,
    resource_types,
  });
  return data;
};

exportedValues.getLabel = (labelId) =>
  todoistRestInterface.get(`/labels/${labelId}`);

exportedValues.updateTask = async (taskId, body) =>
  todoistRestInterface.post(`/tasks/${taskId}`, body);

exportedValues.createTask = async (body) =>
  todoistRestInterface.post(`/tasks`, body);

exportedValues.closeTask = async (taskId) =>
  todoistRestInterface.post(`/tasks/${taskId}/close`);

exportedValues.deleteTask = async (taskId) =>
  todoistRestInterface.delete(`/tasks/${taskId}`);

exportedValues.deleteProject = async (projectId) =>
  todoistRestInterface.delete(`/projects/${projectId}`);

exportedValues.createProject = async (body) =>
  todoistRestInterface.post(`/projects`, body);

exportedValues.updateProject = async (projectId, body) =>
  todoistRestInterface.post(`/projects/${projectId}`, body);

exportedValues.getAllLabels = async () => todoistRestInterface.get(`/labels`);

module.exports = exportedValues;
