const {
  createPage,
  queryDatabase,
  updatePage,
  getPageContent,
  updateBlock
} = require('../../interfaces/notionInterface');

const { BOOKS_DATABASE_ID } = process.env;

const values = {};

values.routeBook = async (book) => {
  const matchingBook = await values.getBook(book);
  if (matchingBook) {
    const page = await getPageContent(matchingBook.id);
    const pageContent = page.data.results[0].paragraph.text[0].plain_text;
    matchingBook.pageContent = pageContent;
    if (changesNeededBook(matchingBook, book)) {
      const blockId = page?.data?.results?.[0]?.id;
      values.updateBook(matchingBook.id, blockId, book);
    }
  } else if (!matchingBook && !book.is_deleted) {
    values.createBook(book);
  }
};

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

const changesNeededBook = ({ properties }, updatedBook) => {
  let different = false;
  if (properties?.Read?.checkbox !== !!updatedBook?.date_completed)
    different = true;
  if (properties?.Priority?.select?.name !== updatedBook?.priority)
    different = true;
  if (properties?.Name?.title?.[0]?.plain_text !== updatedBook?.content)
    different = true;
  if (!areLabelsTheSame(properties?.Tags?.multi_select, updatedBook?.labels))
    different = true;
  if (properties?.pageContent !== updatedBook?.description) different = true;
  return different;
};

const areLabelsTheSame = (existingLabels, newLabels) => {
  return (
    existingLabels.length == newLabels.length &&
    existingLabels.every(({ name }) => newLabels.includes(name))
  );
};

module.exports = values;
