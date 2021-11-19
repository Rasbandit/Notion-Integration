module.exports = {
  linters: {
    '**/*.+(js|json)': ['eslint --fix .', 'git add .'],
  },
};
