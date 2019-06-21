module.exports = {
  success: {
    emailConfirmed: 'Email address successfully confirmed',
    accountSettings: 'Account details updated',
    passwordChanged: 'Password successfully changed',
  },
  errors: {
    'Empty credentials': "You haven't completely filled out the form.",
    'Username not found': username => {
      return `User with username ${username} not found in the database`;
    },
    'Username already exists': username => {
      return `Username ${username} is already being used by another user.`;
    },
    'Email not found': email => {
      return `User with email address ${email} not found in database`;
    },
    'Email already exists': email => {
      return `Email address ${email} is already being used by another user.`;
    },
    'Repair key not found': 'The specified key was not found in the database',
    'Wrong repair key': 'Invalid confirmation key pattern',
    'Email confirm key not found':
      'The specified confirmation key was not found in the database. Email address not confirmed',
    'Wrong email confirm key': 'Invalid confirmation key pattern. Email address not confirmed',
    'Wrong password': 'Wrong password',
    'Password change failed': 'Cмена пароля не удалась. Попробуйте снова',
    FetchError: "Couldn't connect to database. Try again",
    'Username spaces': 'Spaces in the username are prohibited\n',
    'Prohibited char': char => {
      return `Character ${char}is prohibited`;
    },
    'Prohibited chars': chars => {
      return `Characters ${chars}are prohibited`;
    },
    'Email spaces': 'Spaces in the email address are prohibited\n',
    'Wrong email pattern': 'Wrong email address pattern',
    'Password min length': 'Password must be at least 7 characters\n',
    'Password max length': 'Password must be a maximum of 30 characters.\n',
    'Password spaces': 'Spaces in the password are prohibited\n',
    'Constraint violation': 'The data you entered already exist in the database',
  },
};
