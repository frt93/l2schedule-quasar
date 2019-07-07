export default {
  phrases: {
    eg: 'e.g.',
  },
  labels: {
    username: 'Username',
    email: 'Email',
    password: 'Password',
    currentPassword: 'Your current password',
    newPassword: 'Desired new password',
    signup: 'Sign up',
    login: 'Your username or email',
    signin: 'Sign in',
    forgot: 'Forgot?',
    restoreAccess: 'Restore access',
    logout: 'Log out',
    haveKey: 'Already have a key?',
    repair: {
      guest1:
        'To start the process of restoring access to your account, enter the email you provided during registration. An email will be sent with the transaction confirmation key',
      user1:
        'You have been redirected to this page indicating that you have forgotten the password for your account. You can reset the current password and set a new one. Сlick "Next" to continue and we\'ll send a confirmation key to your email',
      2: 'Enter the confirmation key from the message that came to your email',
      3: 'Now you can enter your new password. After confirmation, you will be redirected to the login page',
    },
    add: 'Add',
    confirm: 'Confirm',
    save: 'Save',
    next: 'Next',
    back: 'Back',
    language: 'Language',
    timezone: 'Timezone',
    noTimezone: 'The specified time zone not found',
    country: 'Country',
    noCountry: 'The specified country not found',
    sending: 'Sending',
    settings: 'Settings',
    confirmEmail: 'Email confirmation key',
    confirm: 'Confirm',
    resendConfirmKey: 'The confirmation key will be resend to the email',
  },
  errors: {
    spaces: 'Spaces are prohibited',
    network: 'Failed to contact the server. Check your internet connection and try again.',
    authError: 'Authorization error',
    chooseUsername: 'Enter your username',
  },
  titles: {
    mainPage: 'Homepage',
    rbPage: 'Raid Bosses',
    forum: 'Forum',
    authRepair: 'Reset password',
    authSignin: 'Sign in',
    authSignup: 'Sign up',
    confirmPage: 'Confirm',
    settings: {
      main: 'Settings',
      account: 'Account',
      password: 'Password',
      safety: 'Safety',
    },
  },
  hints: {
    settings: {
      username: 'Name under which other users are see you. Can be used for authorization',
      email: 'Email will not be publicly displayed',
      password:
        'If you change your nickname or email, you must enter your current account password to confirm the operation',
      now: 'Current time',
      DST: 'Auto transition to daylight/standard time',
      country: 'Select the country you live in',
      addPassword:
        'For increased security and account control, we recommend you to set a password. In the future, you may need it for performing certain operations (e.g., changing a username, email, etc.)',
      addEmail:
        'To reduce the risk of losing access to this account - link your email to it. \n It will be hidden from other users.',
      safety: {
        email1:
          "It was sent to the email you specified during registration. If you can't find the message - we can ",
        email2: 'resend it',
        email3: ". If that didn't help either - ",
        email4: 'check',
        email5: '  if you entered your email correctly',
      },
    },
    auth: {
      username: 'Only latin letters, numbers and - _ or .',
      email: 'A confirmation message will be sent to the specified email',
      password: 'From 7 to 30 characters',
    },
  },
  tabs: {
    routes: {
      homepage: 'Home',
      rb: 'Raid Bosses',
      forum: 'Forum',
      signup: 'Sign up',
      signin: 'Sign in',
    },
    settings: {
      account: 'Account',
      password: 'Password',
      safety: 'Safety',
    },
  },
};
