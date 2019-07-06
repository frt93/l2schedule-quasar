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
    login: 'Your username or email address',
    signin: 'Sign in',
    forgot: 'Forgot?',
    restoreAccess: 'Restore access',
    logout: 'Log out',
    haveKey: 'Already have a key?',
    repair: {
      guest1:
        'To start the process of restoring access to your account, enter the email address you provided during registration. An email will be sent with the transaction confirmation key',
      user1:
        'You have been redirected to this page indicating that you have forgotten the password for your account. You can reset the current password and set a new one. Сlick "Next" to continue and we\'ll send a confirmation key to your email address',
      2: 'Enter the confirmation key from the letter that came to your email address',
      3: 'Now you can enter your new password. After confirmation, you will be redirected to the login page',
    },
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
    confirmKey: 'Confirmation key',
    confirm: 'Confirm',
    resendConfirmKey: 'The confirmation key will be resend to the email address',
  },
  errors: {
    spaces: 'Spaces are prohibited',
    network: 'Failed to contact the server. Check your internet connection and try again.',
    authError: 'Authorization error',
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
        'If you change your nickname or email address, you must enter your current account password to confirm the operation',
      now: 'Current time',
      DST: 'Auto transition to daylight/standard time',
      country: 'Select the country you live in',
      safety: {
        email1:
          "Was sent to the email address you specified during registration. If you can't find the letter - we can ",
        email2: 'resend it',
        email3: ". If that didn't help either - ",
        email4: 'check',
        email5: '  if you entered your email address correctly',
      },
    },
    auth: {
      username: 'Up to 16 characters',
      email: 'A confirmation email will be sent to the specified address',
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
