module.exports = {
  errors: {
    'Empty credentials': "You haven't completely filled out the form.",
    'Name already exists': name => {
      return `Party with name ${name} already exist`;
    },
    'Slug already exists': 'This page already exist',
    'You already have party': 'You already have party',
  },
};
