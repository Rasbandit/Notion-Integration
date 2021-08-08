const { getLabel } = require('../interfaces/todoistInterface');
const { getPageContent } = require('../interfaces/notionInterface');
const {
  createNewActionItem,
  getActionItem,
  updateActionItem,
} = require('./notionHelpers/notionActionItemsHelpers');
const {
  createBook,
  getBook,
  updateBook,
} = require('./notionHelpers/notionBooksHelpers');

const exportedValues = {};

exportedValues.processUpdates = async (updates) => {
  updates.items.forEach(async (item) => {
    item.labels = await convertLabelIdToLabelName(item);
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
  if (item.labels.includes('Book')) {
    routeBook(item);
  } else if (item.labels.includes('Media')) {
  } //Media
  else {
    routeActionItem(item);
  }
};

const routeBook = async (book) => {
  const matchingBook = await getBook(book);
  book = formatActionItemPriority(book);
  if (matchingBook) {
    const page = await getPageContent(matchingBook.id);
    const pageContent = page.data.results[0].paragraph.text[0].plain_text;
    matchingBook.pageContent = pageContent;
    if (changesNeededBook(matchingBook, book)) {
      const blockId = page?.data?.results?.[0]?.id;
      updateBook(matchingBook.id, blockId, book);
    }
  } else if (!matchingBook && !book.is_deleted) {
    createBook(book);
  }
};

const routeActionItem = async (item) => {
  const matchingItem = await getActionItem(item);
  item = formatActionItemPriority(item);

  if (matchingItem) {
    const page = await getPageContent(matchingItem.id);
    const pageContent = page.data.results[0].paragraph.text[0].plain_text;
    matchingItem.pageContent = pageContent;
    if (changesNeededActionItem(matchingItem, item)) {
      const blockId = page?.data?.results?.[0]?.id;
      updateActionItem(matchingItem.id, blockId, item);
    }
  } else if (!matchingItem && !item.is_deleted) {
    createNewActionItem(item);
  }
};

const formatActionItemPriority = (item) => {
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

const changesNeededActionItem = ({ properties }, updatedItem) => {
  let different = false;
  if (properties?.Done?.checkbox !== !!updatedItem?.date_completed)
    different = true;
  if (properties?.Priority?.select?.name !== !!updatedItem?.priority)
    different = true;
  if (properties?.Name?.title?.[0]?.plain_text !== updatedItem?.content)
    different = true;
  if (!areLabelsTheSame(properties?.Context?.multi_select, updatedItem?.labels))
    different = true;
  if (properties?.['Due Date']?.date?.start !== updatedItem?.due?.date)
    different = true;
  if (properties?.pageContent !== updatedItem?.description) different = true;
  return different;
};

const changesNeededBook = ({ properties }, updatedBook) => {
  let different = false;
  if (properties?.Read?.checkbox !== !!updatedBook?.date_completed)
    different = true;
  if (properties?.Priority?.select?.name !== !!updatedBook?.priority)
    different = true;
  if (properties?.Name?.title?.[0]?.plain_text !== updatedBook?.content)
    different = true;
  if (!areLabelsTheSame(properties?.Tags?.multi_select, updatedBook?.labels))
    different = true;
  if (properties?.pageContent !== updatedBook?.description) different = true;
  return different;
};

const areLabelsTheSame = (existingLabels, newLabels) => {
  return (
    existingLabels.length == newLabels.length &&
    existingLabels.every(({ name }) => newLabels.includes(name))
  );
};

module.exports = exportedValues;
