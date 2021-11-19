const {createPage} = require('../../interfaces/notionInterface');

const {closeTask} = require('../../interfaces/todoistInterface');

const {BOOKS_DATABASE_ID} = process.env;

const values = {};

values.routeBook = async (book) => {
  createBook(book);
};

const createBook = async (book) => {
  if (book.date_completed) return;
  const properties = makeBody(book);
  const children = [makeChild(book)];
  createPage(BOOKS_DATABASE_ID, {properties, children});
  closeTask(book.id);
};

const makeChild = (book) => ({
  type: 'paragraph',
  paragraph: {
    text: [{type: 'text', text: {content: book.description}}],
  },
});

const makeBody = (book) => ({
  Name: {
    title: [
      {
        type: 'text',
        text: {
          content: book.content,
        },
      },
    ],
  },
  Priority: {
    select: {
      name: book.priority,
    },
  },
});

module.exports = values;
