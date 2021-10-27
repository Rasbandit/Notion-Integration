const upsertGoal = require('../notionHelpers/notionGoalsHelpers');

const processProjectUpdates = async (project) => {
  upsertGoal(project);
};

module.exports = processProjectUpdates;
