const {getLabel} = require('../../interfaces/todoistInterface');
const {routeActionItem} = require('../notionHelpers/notionActionItemsHelpers');
const {routeBook} = require('../notionHelpers/notionBooksHelpers');
const {routeMedia} = require('../notionHelpers/notionMediaHelpers');

const MEDIA_TYPES = ['Movie', 'Game', 'Podcast', 'Show'];

const formatPriority = (item) => {
  const copyItem = {...item};
  if (item.priority === 1) {
    copyItem.priority = '3rd';
  } else if (item.priority === 2) {
    copyItem.priority = '2nd';
  } else if (item.priority === 3) {
    copyItem.priority = '1st';
  } else if (item.priority === 4) {
    copyItem.priority = '!!';
  }
  return copyItem;
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

const processTaskUpdates = async (item) => {
  let copyItem = {...item};
  copyItem.labels = await convertLabelIdToLabelName(item);
  copyItem = formatPriority(copyItem);
  routeOnLabel(copyItem);
};

module.exports = processTaskUpdates;
