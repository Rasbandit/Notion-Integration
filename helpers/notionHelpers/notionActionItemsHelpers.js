const {
  createPage,
  queryDatabase,
  updatePage,
  getPageContent,
  getBlockChildren,
} = require('../../interfaces/notionInterface');
const {getProjectByTodoistId} = require('./notionProjectsHelpers');
const {deleteTask} = require('../../interfaces/todoistInterface');

const {ACTION_ITEMS_DATABASE_ID} = process.env;

const TODOIST_DESCRIPTION = 'Todoist Description';

const actionItemsValues = {};

actionItemsValues.routeActionItem = async (item) => {
  if (!item.is_deleted && !item.date_completed) {
    actionItemsValues.createNewActionItem(item);
  }
};

actionItemsValues.getDescriptionBlock = async (pageId) => {
  const page = await getPageContent(pageId);
  const descriptionToggleBlock = page?.data?.results.find((block) => {
    if (block.type === 'toggle') {
      const isTodoistDescription =
        block.toggle.text[0].plain_text === TODOIST_DESCRIPTION;
      if (isTodoistDescription) {
        return true;
      }
    }
    return false;
  });
  if (descriptionToggleBlock) {
    const {data} = await getBlockChildren(descriptionToggleBlock.id);
    return data.results[0];
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
  const result = await queryDatabase(ACTION_ITEMS_DATABASE_ID, options);
  return result.data.results[0];
};

actionItemsValues.createNewActionItem = async (item) => {
  let properties = makeActionItemBody(item);

  if (item.project_id) {
    const project = await getProjectByTodoistId(item.project_id);
    if (project) {
      properties = {
        ...properties,
        Project: {
          relation: [
            {
              id: project.id,
            },
          ],
        },
      };
    }
  }
  await createPage(ACTION_ITEMS_DATABASE_ID, {properties});
  deleteTask(item.id);
};

actionItemsValues.setDefaultStatus = async (pageId) => {
  const updates = {
    properties: {
      Status: {
        select: {
          name: 'Actionable',
        },
      },
    },
  };

  await updatePage(pageId, updates);
};

const makeActionItemBody = (item) => ({
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
  Description: {
    rich_text: [
      {
        text: {
          content: item.description,
        },
      },
    ],
  },
  'Due Date': {
    date: item?.due?.date
      ? {
          start: item.due.date,
        }
      : null,
  },
  Context: {
    multi_select: item.labels.map((label) => ({name: label})),
  },
  Priority: {
    select: {
      name: item.priority,
    },
  },
});

module.exports = actionItemsValues;
