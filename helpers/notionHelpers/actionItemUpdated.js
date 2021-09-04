const {
  updateTask,
  closeTask,
  getAllLabels,
  createTask,
  deleteTask,
} = require('../../interfaces/todoistInterface');
const { getPageContent } = require('../../interfaces/notionInterface');

const { processUpdates } = require('../todoistHelpers.js/todoistNotionProcessor');

const {
  getDescriptionBlock,
} = require('./../notionHelpers/notionActionItemsHelpers');

const actionItemUpdates = {};

actionItemUpdates.processUpdatedItem = async (updatedItem) => {
  const { properties } = updatedItem;

  const todoistId = properties?.['Todoist Id']?.number || null;

  if (todoistId) {
    if (updatedItem.archived) {
      deleteTask(todoistId);
    } else if (properties.Done.checkbox) {
      closeTask(todoistId);
    } else {
      const block = await getDescriptionBlock(updatedItem.id);
      const description = block?.paragraph?.text?.[0]?.plain_text
      const body = await createBody(updatedItem);
      if(description){body.description = description}
      await updateTask(todoistId, body);
    }
  } else {
    const body = await createBody(updatedItem);
    const response = await createTask(body);
    const item = response.data;
    item.labels = item.label_ids;
    processUpdates({ items: [response.data] });
  }
};

const createBody = async (updatedItem) => {
  return {
    content: updatedItem?.properties?.Name?.title?.[0]?.plain_text || '',
    label_ids: await getLabelIds(updatedItem.properties.Context.multi_select),
    priority: formatPriority(
      updatedItem?.properties?.Priority?.select?.name || '3rd Priority'
    ),
    due_datetime: updatedItem.properties?.['Due Date']?.date?.start,
    description: await getDescription(updatedItem.id),
  };
};

const getLabelIds = async (notionLabels) => {
  const { data: labels } = await getAllLabels();
  return notionLabels
    .map(
      ({ name }) =>
        labels.find((label) => label.name === name?.split(' ')?.join('_'))
          ?.id || ''
    )
    .filter((item) => item);
};

const getDescription = async (pageId) => {
  const response = await getPageContent(pageId);
  if (response.data.results.length) {
    return response?.data?.results?.[0]?.paragraph?.text?.[0]?.plain_text;
  }
  return '';
};

const formatPriority = (priority) => {
  if (priority === '3rd Priority') {
    return 1;
  } else if (priority === '2nd Priority') {
    return 2;
  } else if (priority === '1st Priority') {
    return (priority = 3);
  } else if (priority === 'Emergency') {
    return (priority = 4);
  }
  return 1;
};

module.exports = actionItemUpdates;
