const {
  createPage,
  queryDatabase,
  updatePage,
  getPageContent,
  updateBlock
} = require('../../interfaces/notionInterface');

const { BOOKS_DATABASE_ID } = process.env;

values = {};

values.createBook = async (book) => {
  const properties = makeBody(book);
  const children = [makeChild(book)];
  await createPage(BOOKS_DATABASE_ID, properties, children);
};

values.getBook = async (book) => {
  const options = {
    filter: {
      property: 'Todoist Id',
      number: {
        equals: book.id,
      },
    },
    page_size: 1,
  };
  result = await queryDatabase(BOOKS_DATABASE_ID, options);
  return result.data.results[0];
};

values.updateBook = async (pageId, blockId, book) => {
  await updateBlock(blockId, makeChild(book));

  const updates = {
    archived: !!book.is_deleted,
    properties: makeBody(book)
  }
  await updatePage(pageId, updates);
};

const makeChild = (book) => {
  return {
    type: 'paragraph',
    paragraph: {
      text: [{ type: 'text', text: { content: book.description } }],
    },
  };
};

const makeBody = (book) => {
  return {
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
    'Todoist Id': {
      number: book.id,
    },
  };
};

module.exports = values;
