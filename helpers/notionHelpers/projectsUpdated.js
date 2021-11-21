const {
  updateProject,
  createProject,
  deleteProject,
} = require('../../interfaces/todoistInterface');

const {upsertProject} = require('./notionProjectsHelpers');

const actionItemUpdates = {};

actionItemUpdates.processUpdatedItem = async (updatedItem) => {
  const {properties} = updatedItem;

  const todoistId = properties?.['Todoist Id']?.number || null;

  if (todoistId) {
    if (updatedItem.archived || properties.Status.select.name === 'Completed') {
      deleteProject(todoistId);
    } else {
      const body = {name: properties?.Project?.title?.[0]?.plain_text || ''};
      await updateProject(todoistId, body);
    }
  } else {
    const body = {name: properties?.Project?.title?.[0]?.plain_text || ''};
    const response = await createProject(body);
    upsertProject(response.data, updatedItem.id);
  }
};

module.exports = actionItemUpdates;
