const processTaskUpdates = require('./todoistProcessTasks');
const processProjectUpdates = require('./todoistNotionProcessGoals');

const exportedValues = {};

exportedValues.processUpdates = async (updates) => {
  updates.items.forEach(processTaskUpdates);
  updates.projects.forEach(processProjectUpdates);
};

module.exports = exportedValues;
