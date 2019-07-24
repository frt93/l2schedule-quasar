export default {
  create: 'create',
  find: 'find',
  eg: 'e.g.',
  or: 'or',
  fb: 'facebook',
  ggl: 'google',
  vk: 'vk.com',
  tg: 'telegram',
  oApp: 'authorization app',
  pl: 'Party leader',
  noResults: 'The search has not given any results',
  oauth: {
    title: 'Third-party authorization apps',
    link: 'You can associate this account with ',
    linked: 'Your account is associated with ',
    googleLinked: '@:oauth.linked @:ggl @:oApp',
    facebookLinked: '@:oauth.linked @:fb @:oApp',
    vkLinked: '@:oauth.linked @:vk @:oApp',
    telegramLinked: '@:oauth.linked @:tg profile',
    link_google: '@:oauth.link @:ggl @:oApp',
    link_facebook: '@:oauth.link @:fb @:oApp',
    link_vk: '@:oauth.link @:vk @:oApp',
    link_telegram: '@:oauth.link @:tg @:oApp',
    updateProvider: 'Update app data',
    lastUpdate: 'Last update',
    connectProvider: 'Connect',
    disconnectProvider: 'Disconnect app',
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
        'To start the process of restoring access to your account, enter the email you provided during registration. An email will be sent with the confirmation key',
      user1:
        'You have been redirected to this page indicating that you have forgotten the password for your account. You can reset the current password and set a new one. Сlick "Next" to continue and we\'ll send a confirmation key to your email',
      2: 'Enter the confirmation key you received through email',
      3: 'Now you can enter your new password. After confirmation, you will be redirected to the login page',
    },
    add: 'Add',
    confirm: 'Confirm',
    save: 'Save',
    next: 'Next',
    back: 'Back',
    change: 'Change',
    update: 'Update',
    timezone: 'Timezone',
    dateFormat: 'Date format',
    noTimezone: 'The specified time zone not found',
    country: 'Country',
    language: 'Language',
    noCountry: 'The specified country not found',
    sending: 'Sending',
    settings: 'Settings',
    confirmEmail: 'Email confirmation key',
    confirm: 'Confirm',
    resendConfirmKey: 'The confirmation key will be resend to the email',
    expand: 'Expand',
    collapse: 'Collapse',
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
    party: {
      main: 'Party',
      all: 'All parties',
      members: 'Party members',
    },
  },
  hints: {
    namePattern: 'Only latin letters, numbers and _ or .',
    length: 'From {from} to {to} characters',
    settings: {
      needPasswordToChange: 'To make changes you need first to set an account password',
      email: 'Email will not be publicly displayed',
      now: 'Current time',
      DST: 'Auto transition to daylight/standard time',
      country: 'Select the country you live in',
      addPassword:
        'For increased security and account control, we recommend you to set a password. In the future, you may need it for performing certain operations (e.g., changing a username, email, etc.)',
      addEmail:
        'To reduce the risk of losing access to this account - link your email to it. \n It will be hidden from other users.',
      safety: {
        email1:
          "It was sent to the email you specified during registration. Check if you entered your email correctly. If you can't find the message - we can ",
        email2: 'send you another one',
      },
    },
    auth: {
      email: 'A confirmation message will be sent to the specified email',
      confirmOperation: 'Enter your account password to confirm the operation',
    },
  },
  tabs: {
    routes: {
      homepage: 'Home',
      rb: 'Raid Bosses',
      forum: 'Forum',
      signup: 'Sign up',
      signin: 'Sign in',
      party: 'Party',
    },
    settings: {
      account: 'Account',
      password: 'Password',
      safety: 'Safety',
    },
  },
  party: {
    notFound: 'Party {name} not found',
    createDialogTitle: 'Name your party',
    labels: {
      name: 'Your party name',
      slug: 'Party page link',
      filterUsers: 'Username or name',
    },
    hints: {
      slug: '@:hints.namePattern \n @:hints.length',
    },
    members: 'Party members',
    invite: 'Invite',
    invites: 'Invited users',
    invited: 'already invited',
    leave: 'Leave party',
    PLleave: "First you must to transfer the party leader's powers",
    sendInvite: 'Invite @{name} to party',
    cancelInvite: 'Cancel invite @{name} to party',
  },
};
