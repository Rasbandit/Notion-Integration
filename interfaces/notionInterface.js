const axios = require('axios');

const notionInstance = axios.create({
  baseURL: 'https://api.notion.com/v1',
  headers: {
    common: {
      Authorization: `Bearer ${process.env.NOTION_AUTH_TOKEN}`,
      'Notion-Version': `2021-05-13`,
    },
  },
});

const exportedValues = {};

exportedValues.createPage = async (database_id, properties, children = []) => {
  const body = {
    parent: {
      database_id,
    },
    properties,
    children,
  };
  return await notionInstance.post('/pages', body);
};

exportedValues.queryDatabase = async (databaseId, options) =>
  await notionInstance.post(`/databases/${databaseId}/query`, options);

exportedValues.updatePage = async (pageId, options) =>
  await notionInstance.patch(`/pages/${pageId}`, options);

module.exports = exportedValues;
