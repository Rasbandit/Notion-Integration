const {
  createPage,
  queryDatabase,
  updatePage
} = require('../../interfaces/notionInterface');

const { GOAL_DATABASE_ID } = process.env;

const upsertGoal = async (goal) => {
  const matchingGoal = await getGoal(goal);

  if (matchingGoal) {
    if (changesNeededGoal(matchingGoal, goal)) {
      updateGoal(matchingGoal.id, goal);
    }
  } else if (!matchingGoal && !goal.is_deleted) {
    createGoal(goal);
  }
};

const getGoal = async (goal) => {
  const options = {
    filter: {
      or: [
        {
          property: 'Todoist Id',
          number: {
            equals: goal.id,
          },
        },
        {
          property: 'Name',
          text: {
            equals: goal.name,
          },
        },
      ],
    },
    page_size: 1,
  };
  result = await queryDatabase(GOAL_DATABASE_ID, options);
  return result.data.results[0];
};

const createGoal = async (goal) => {
  const properties = makeGoalProperties(goal);
  await createPage(GOAL_DATABASE_ID, properties);
};

const updateGoal = async (pageId, goal) => {
  const updates = {
    archived: !!goal.is_deleted,
    properties: makeGoalProperties(goal),
  };

  await updatePage(pageId, updates);
};

const makeGoalProperties = (goal) => {
  return {
    Name: {
      title: [
        {
          type: 'text',
          text: {
            content: goal.name,
          },
        },
      ],
    },
    Status: {
      select: {
        name: determineStatus(goal),
      },
    },
    'Todoist Id': {
      number: goal.id,
    },
  };
};

const changesNeededGoal = (existingItem, updatedItem) => {
  const { properties } = existingItem;
  let different = false;

  if (properties?.Name?.title?.[0]?.plain_text !== updatedItem?.name)
    different = true;

  if (properties?.Status?.select?.name !== determineStatus(updatedItem))
    different = true;

  return different;
};

const determineStatus = (goal) => {
  if(goal.is_archived) return "Completed";
  return goal.is_favorite ? "Active" : "Inactive"
}

module.exports = upsertGoal;
