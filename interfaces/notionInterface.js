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

exportedValues.createPage = async (database_id, values) => {
  const body = {
    ...values,
    parent: {
      database_id,
    },
  };
  console.log(body);
  return await notionInstance.post('/pages', body);
};

exportedValues.queryDatabase = async (databaseId, options) =>
  notionInstance.post(`/databases/${databaseId}/query`, options);

exportedValues.updatePage = async (pageId, options) =>
  notionInstance.patch(`/pages/${pageId}`, options);

exportedValues.getPage = async (pageId) =>
  notionInstance.get(`/pages/${pageId}`);

exportedValues.getBlock = async (blockId) =>
  notionInstance.get(`/blocks/${blockId}`);

exportedValues.getBlockChildren = async (blockId) =>
  notionInstance.get(`/blocks/${blockId}/children`);

exportedValues.getPageContent = async (pageId) =>
  notionInstance.get(`/blocks/${pageId}/children`);

exportedValues.updateBlock = async (blockId, updates) =>
  notionInstance.patch(`/blocks/${blockId}`, updates);

exportedValues.appendBlock = async (pageId, body) =>
  notionInstance.patch(`/blocks/${pageId}/children`, body);

module.exports = exportedValues;
