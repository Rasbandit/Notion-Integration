const {createPage} = require('../../interfaces/notionInterface');

const {closeTask} = require('../../interfaces/todoistInterface');

const {MEDIA_DATABASE_ID} = process.env;

const values = {};

const makeBody = (media) => ({
  Name: {
    title: [
      {
        type: 'text',
        text: {
          content: media.content,
        },
      },
    ],
  },
  Type: {
    select: {
      name: media.labels[0],
    },
  },
});

const makeChild = (media) => ({
  type: 'paragraph',
  paragraph: {
    text: [{type: 'text', text: {content: media.description}}],
  },
});

const createMedia = async (media) => {
  if (media.date_completed) return;
  const properties = makeBody(media);
  const children = [makeChild(media)];
  createPage(MEDIA_DATABASE_ID, {properties, children});
  closeTask(media.id);
};

values.routeMedia = async (media) => {
  createMedia(media);
};

module.exports = values;
