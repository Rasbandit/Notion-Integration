const {
  createPage,
  queryDatabase,
  updatePage,
  getPageContent,
  updateBlock,
  appendBlock,
} = require('../../interfaces/notionInterface');
const { onlyDate } = require('../momentHelpers');

const { ACTION_ITEMS_DATABASE_ID } = process.env;

actionItemsValues = {};

actionItemsValues.routeActionItem = async (item) => {
  const matchingItem = await actionItemsValues.getActionItem(item);

  if (matchingItem) {
    const page = await getPageContent(matchingItem.id);
    const pageContent =
      page?.data?.results?.[0]?.paragraph?.text[0]?.plain_text || '';
    matchingItem.pageContent = pageContent;
    if (changesNeededActionItem(matchingItem, item)) {
      const blockId = page?.data?.results?.[0]?.id || null;
      actionItemsValues.updateActionItem(matchingItem.id, blockId, item);
    }
  } else if (!matchingItem && !item.is_deleted) {
    actionItemsValues.createNewActionItem(item);
  }
};

actionItemsValues.getActionItem = async (item) => {
  const options = {
    filter: {
      or: [
        {
          property: 'Todoist Id',
          number: {
            equals: item.id,
          },
        },
        {
          property: 'Name',
          text: {
            equals: item.content,
          },
        },
      ],
    },
    page_size: 1,
  };
  result = await queryDatabase(ACTION_ITEMS_DATABASE_ID, options);
  return result.data.results[0];
};

actionItemsValues.createNewActionItem = async (item) => {
  const properties = makeActionItemBody(item);
  const children = [makeChild(item)];
  await createPage(ACTION_ITEMS_DATABASE_ID, properties, children);
};

actionItemsValues.updateActionItem = async (pageId, blockId, item) => {
  if (blockId) {
    await updateBlock(blockId, makeChild(item));
  } else {
    await appendBlock(pageId, { children: [makeChild(item)] });
  }

  const updates = {
    archived: !!item.is_deleted,
    properties: makeActionItemBody(item),
  };

  await updatePage(pageId, updates);
};

const makeChild = (item) => {
  return {
    type: 'paragraph',
    paragraph: {
      text: [{ type: 'text', text: { content: item.description } }],
    },
  };
};

const makeActionItemBody = (item) => {
  return {
    Name: {
      title: [
        {
          type: 'text',
          text: {
            content: item.content,
          },
        },
      ],
    },
    'Due Date': {
      date: item?.due?.date
        ? {
            start: onlyDate(item.due.date),
          }
        : null,
    },
    Context: {
      multi_select: item.labels.map((label) => ({ name: label })),
    },
    Priority: {
      select: {
        name: item.priority,
      },
    },
    Done: {
      checkbox: !!item.date_completed,
    },
    'Todoist Id': {
      number: item.id,
    },
  };
};

const changesNeededActionItem = (existingItem, updatedItem) => {
  const { properties } = existingItem;
  let different = false;

  if (properties?.Done?.checkbox !== !!updatedItem?.date_completed)
    different = true;

  if (properties?.["Todoist Id"]?.number !== updatedItem?.id)
    different = true;

  if (properties?.Priority?.select?.name !== updatedItem?.priority)
    different = true;

  if (properties?.Name?.title?.[0]?.plain_text !== updatedItem?.content)
    different = true;

  if (!areLabelsTheSame(properties?.Context?.multi_select, updatedItem?.labels))
    different = true;

  if (properties?.['Due Date']?.date?.start !== updatedItem?.due?.date)
    different = true;

  if (existingItem?.pageContent !== updatedItem?.description) different = true;

  return different;
};

const areLabelsTheSame = (existingLabels, newLabels) => {
  return (
    existingLabels.length == newLabels.length &&
    existingLabels.every(({ name }) => newLabels.includes(name))
  );
};

module.exports = actionItemsValues;
