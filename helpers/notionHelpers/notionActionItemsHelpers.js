const {
  createPage,
  queryDatabase,
  updatePage,
  getPageContent,
  updateBlock,
} = require('../../interfaces/notionInterface');
const { onlyDate } = require('../momentHelpers');

const { ACTION_ITEMS_DATABASE_ID } = process.env;

values = {};

values.getActionItem = async (item) => {
  const options = {
    filter: {
      property: 'Todoist Id',
      number: {
        equals: item.id,
      },
    },
    page_size: 1,
  };
  result = await queryDatabase(ACTION_ITEMS_DATABASE_ID, options);
  return result.data.results[0];
};

values.createNewActionItem = async (item) => {
  const properties = makeActionItemBody(item);
  const children = [makeChild(item)];
  await createPage(ACTION_ITEMS_DATABASE_ID, properties, children);
};

values.updateActionItem = async (pageId, blockId, item) => {
  await updateBlock(blockId, makeChild(item));

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

module.exports = values;
