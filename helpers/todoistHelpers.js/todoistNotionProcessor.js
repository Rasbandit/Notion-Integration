const processTaskUpdates = require('./todoistProcessTasks');

const exportedValues = {};

exportedValues.processUpdates = async (updates) => {
  updates.items.forEach(processTaskUpdates);
};

module.exports = exportedValues;
