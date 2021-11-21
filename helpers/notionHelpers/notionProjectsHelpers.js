const {updatePage} = require('../../interfaces/notionInterface');
const {queryDatabase} = require('../../interfaces/notionInterface');

const {PROJECT_DATABASE_ID} = process.env;

const values = {};

const makeProjectProperties = (project) => ({
  'Todoist Id': {
    number: project.id,
  },
});

const updateProject = async (pageId, goal) => {
  const updates = {
    archived: !!goal.is_deleted,
    properties: makeProjectProperties(goal),
  };

  await updatePage(pageId, updates);
};

values.getProjectByTodoistId = async (todoistId) => {
  const options = {
    filter: {
      property: 'Todoist Id',
      number: {
        equals: todoistId,
      },
    },
    page_size: 1,
  };
  const result = await queryDatabase(PROJECT_DATABASE_ID, options);
  return result.data.results[0];
};

values.upsertProject = async (project, projectId) => {
  updateProject(projectId, project);
};

module.exports = values;
