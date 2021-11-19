const {getLabel} = require('../../interfaces/todoistInterface');
const {
  routeActionItem,
  getActionItem,
} = require('../notionHelpers/notionActionItemsHelpers');
const {routeBook} = require('../notionHelpers/notionBooksHelpers');
const {routeMedia} = require('../notionHelpers/notionMediaHelpers');

const MEDIA_TYPES = ['Movie', 'Game', 'Podcast', 'Show'];

const processTaskUpdates = async (item) => {
  item.labels = await convertLabelIdToLabelName(item);
  item = formatPriority(item);
  routeOnLabel(item);
};

const convertLabelIdToLabelName = async (item) => {
  if (!item.labels.length) return [];
  const labelPromises = item.labels.map(async (labelId) => {
    const {data} = await getLabel(labelId);
    return data.name.split('_').join(' ');
  });
  const labels = await Promise.all(labelPromises);
  return labels;
};

const routeOnLabel = async (item) => {
  if (item.labels.includes('Book')) {
    routeBook(item);
  } else if (item.labels.some((label) => MEDIA_TYPES.includes(label))) {
    routeMedia(item);
  } else {
    routeActionItem(item);
  }
};

const formatPriority = (item) => {
  if (item.priority === 1) {
    item.priority = '3rd';
  } else if (item.priority === 2) {
    item.priority = '2nd';
  } else if (item.priority === 3) {
    item.priority = '1st';
  } else if (item.priority === 4) {
    item.priority = '!!';
  }
  return item;
};

module.exports = processTaskUpdates;
