const {updatePage} = require('../../interfaces/notionInterface');

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

const upsertProject = async (project, projectId) => {
  updateProject(projectId, project);
};

module.exports = upsertProject;
