const {
  createPage,
  queryDatabase,
  updatePage,
  getPageContent,
  updateBlock,
  appendBlock,
  getBlockChildren,
} = require('../../interfaces/notionInterface');

const { ACTION_ITEMS_DATABASE_ID } = process.env;

const TODOIST_DESCRIPTION = 'Todoist Description';

const actionItemsValues = {};

actionItemsValues.routeActionItem = async (item) => {
  const matchingItem = await actionItemsValues.getActionItem(item);

  if (matchingItem) {
    const { id: childBlockId } = await actionItemsValues.getDescriptionBlock(
      matchingItem.id
    );
    if (changesNeededActionItem(matchingItem, item)) {
      actionItemsValues.updateActionItem(matchingItem.id, childBlockId, item);
    }
  } else if (!matchingItem && !item.is_deleted) {
    actionItemsValues.createNewActionItem(item);
  }
};

actionItemsValues.getDescriptionBlock = async (pageId) => {
  const page = await getPageContent(pageId);
  const descriptionToggleBlock = page?.data?.results.find((block) => {
    if (block.type == 'toggle') {
      const isTodoistDescription =
        block.toggle.text[0].plain_text === TODOIST_DESCRIPTION;
      if (isTodoistDescription) {
        return true;
      }
    }
  });
  if (descriptionToggleBlock) {
    const { data } = await getBlockChildren(descriptionToggleBlock.id);
    return (childId = data.results[0]);
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
  const children = [makeDescriptionToggle(item)];
  await createPage(ACTION_ITEMS_DATABASE_ID, properties, children);
};

actionItemsValues.updateActionItem = async (pageId, blockId, item) => {
  if (blockId) {
    await updateBlock(blockId, makeDescriptionText(item));
  } else {
    await appendBlock(pageId, { children: [makeDescriptionToggle(item)] });
  }

  const updates = {
    archived: !!item.is_deleted,
    properties: makeActionItemBody(item),
  };

  await updatePage(pageId, updates);
};

actionItemsValues.setDefaultStatus = async (pageId) => {
  const updates = {
    properties: {
      Status: {
        select: {
          name: "Actionable",
        },
      },
    },
  };

  await updatePage(pageId, updates);
};

const makeDescriptionToggle = (item) => {
  return {
    type: 'toggle',
    toggle: {
      text: [
        {
          type: 'text',
          text: {
            content: TODOIST_DESCRIPTION,
            link: null,
          },
        },
      ],
      children: [makeDescriptionText(item)],
    },
  };
};

const makeDescriptionText = (item) => {
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
            start: item.due.date,
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

  if (properties?.['Todoist Id']?.number !== updatedItem?.id) different = true;

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
