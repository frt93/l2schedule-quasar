module.exports = {
  success: {
    emailConfirmed: 'Email address successfully confirmed',
    accountSettings: 'Account details updated',
    passwordChanged: 'Password successfully changed',
    safetySettings: 'Safety settings updated',
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
    'oauth: email already used': email => {
      return `Based on the received data, we assume that you may have logged in earlier using another third-party application, cause the email address ${email} is already linked to an existing account. Check it for the presence of a letter with authorization data or restore access to the account with its help.`;
    },
    'oauth: username is not chosen':
      "Sorry, but we can't choose username for you. Please enter it yourself",
    'Repair key not found': 'The specified key was not found in the database',
    'Wrong repair key': 'Invalid confirmation key pattern',
    'Email confirm key not found':
      'The specified confirmation key was not found in the database. Email address not confirmed',
    'Wrong email confirm key': 'Invalid confirmation key pattern. Email address not confirmed',
    'Wrong password': 'Wrong password',
    'No password':
      'This account has no password. Log in using a third-party application or go through the procedure to restore access',
    'Password change failed': 'Password change failed. Try again',
    FetchError: "Couldn't connect to database. Try again",
    'Username spaces': 'Spaces are prohibited',
    'username length': 'Up to 16 characters',
    'username pattern': 'Only latin letters, numbers and - _ or .',
    'Email spaces': 'Spaces are prohibited',
    'Wrong email pattern': 'Wrong email address pattern',
    'Password min length': 'Password must be at least 7 characters',
    'Password max length': 'Password must be a maximum of 30 characters.',
    'Password spaces': 'Spaces are prohibited',
    'Constraint violation': 'The data you entered already exist in the database',
  },
};
