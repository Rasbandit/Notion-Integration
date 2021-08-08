const { getLabel } = require('../interfaces/todoistInterface');
const {
  routeActionItem,
  getActionItem,
} = require('./notionHelpers/notionActionItemsHelpers');
const { routeBook, getBook } = require('./notionHelpers/notionBooksHelpers');

const exportedValues = {};

exportedValues.processUpdates = async (updates) => {
  updates.items.forEach(async (item) => {
    item.labels = await convertLabelIdToLabelName(item);
    item = formatPriority(item);
    routeOnLabel(item);
  });
};

const convertLabelIdToLabelName = async (item) => {
  if (!item.labels.length) return [];
  const labelPromises = item.labels.map(async (labelId) => {
    const { data } = await getLabel(labelId);
    return data.name.split('_').join(' ');
  });
  const labels = await Promise.all(labelPromises);
  return labels;
};

const routeOnLabel = async (item) => {
  if (item.is_deleted) findItemDatabase(item);
  else if (item.labels.includes('Book')) {
    routeBook(item);
  } else if (item.labels.includes('Media')) {
  } //Media
  else {
    routeActionItem(item);
  }
};

const findItemDatabase = async (item) => {
  if (await getActionItem(item)) {
    return routeActionItem(item);
  } else if (await getBook(item)) {
    return routeBook(item);
  }
};

const formatPriority = (item) => {
  if (item.priority === 1) {
    item.priority = '3rd Priority';
  } else if (item.priority === 2) {
    item.priority = '2nd Priority';
  } else if (item.priority === 3) {
    item.priority = '1st Priority';
  } else if (item.priority === 4) {
    item.priority = 'Emergency';
  }
  return item;
};

module.exports = exportedValues;
