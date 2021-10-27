const { createPage } = require('../../interfaces/notionInterface');

const { closeTask } = require('../../interfaces/todoistInterface');

const { MEDIA_DATABASE_ID } = process.env;

const values = {};

values.routeMedia = async (media) => {
  createMedia(media);
};

createMedia = async (media) => {
  if(media.date_completed) return
  const properties = makeBody(media);
  const children = [makeChild(media)];
  createPage(MEDIA_DATABASE_ID, properties, children);
  closeTask(media.id);
};

const makeChild = (media) => {
  return {
    type: 'paragraph',
    paragraph: {
      text: [{ type: 'text', text: { content: media.description } }],
    },
  };
};

const makeBody = (media) => {
  return {
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
  };
};

module.exports = values;
