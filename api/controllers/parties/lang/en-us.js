module.exports = {
  success: {
    'Invite send': username => {
      return `You sent @${username} party invite`;
    },
  },
  errors: {
    'Empty credentials': "You haven't completely filled out the form.",
    'Name already exists': name => {
      return `Party with name ${name} already exist`;
    },
    'Slug already exists': 'This page already exist',
    'You already have party': 'You already have party',
    'Party name length': 'Name length must be from 3 to 30 characters',
    'Party slug length': 'Length must be from 3 to 20 characters',
    'Party slug spaces': 'Spaces are prohibited',
    'Party slug pattern': 'Only latin letters, numbers and _ or .',
    'Special characters location': "Characters _ and . shouldn't be at the beginning or end",
    'Already invited': username => {
      return `@${username} already invited to your party`;
    },
    'Self invite': "You can't invite yourself",
    'User already in your party': username => {
      return `User @${username} already is a member of your party`;
    },
  },
};
