module.exports = {
  success: {
    'Username changed': 'Username successfully changed',
    'Email saved': 'Email successfully saved',
    'Email changed': 'Email successfully changed',
    'Password saved': 'Password successfully saved',
    'Password changed': 'Password successfully changed',
    emailConfirmed: 'Email successfully confirmed',
    'confirmation key resended': 'Done. Check your email',
    'email already confirmed': 'Seems your email already confirmed',
    accountSettings: 'Account details updated',
    safetySettings: 'Safety settings updated',
    'google data updated': 'Google account information updated',
    'facebook data updated': 'Facebook account information updated',
    'vk data updated': 'VK account information updated',
    'telegram data updated': 'Telegram account information updated',
    'google application disconnected': 'Google application disconnected',
    'google application connected': 'Google application connected',
    'facebook application disconnected': 'Facebook application disconnected',
    'facebook application connected': 'Facebook application connected',
    'vk application disconnected': 'VK application disconnected',
    'vk application connected': 'VK application connected',
    'telegram application disconnected': 'Telegram application disconnected',
    'telegram application connected': 'Telegram application connected',
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
      return `User with email ${email} not found in database`;
    },
    'Email already exists': email => {
      return `Email ${email} is already being used by another user.`;
    },
    'oauth: email already used': email => {
      return `Based on the received data, we assume that you may have logged in earlier using another third-party application, cause the email ${email} is already linked to an existing account. Check it for the presence of a message with authorization data or restore access to the account with its help.`;
    },
    'oauth: username is not chosen':
      "Sorry, but we can't choose username for you. Please enter it yourself to complete registration",
    'Repair key not found': 'The specified key was not found in the database',
    'Wrong repair key': 'Invalid confirmation key pattern',
    'Email confirm key not found':
      'The specified confirmation key was not found in the database. Email not confirmed',
    'Wrong email confirm key': 'Invalid confirmation key pattern. Email not confirmed',
    'Wrong password': 'Wrong password',
    'No password':
      'This account has no password. Log in using a third-party application or go through the restore access procedure',
    'Password change failed': 'Password change failed. Try again',
    FetchError: "Couldn't connect to database. Try again",
    'Username spaces': 'Spaces are prohibited',
    'username length': 'Up to 16 characters',
    'username pattern': 'Only latin letters, numbers and _ or .',
    'Special characters location':
      "Characters _ and . shouldn't be at the beginning or end of username",
    'Email spaces': 'Spaces are prohibited',
    'Wrong email pattern': 'Wrong email pattern',
    'Password min length': 'Password must be at least 7 characters',
    'Password max length': 'Password must be a maximum of 30 characters.',
    'Password spaces': 'Spaces are prohibited',
    'Constraint violation': 'The data you entered already exist in the database',
    'Wrong provider account': providerName => {
      return `Received ${providerName} ID is differs from that\'s assosiated with your account. If you want to connect another ${providerName} profile, first disconnect the current one.`;
    },
    'Oauth profile already connected': providerName => {
      return `Recieved ${providerName} profile ID already linked with another account`;
    },
  },
};
