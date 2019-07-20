export default {
  create: 'create',
  find: 'find',
  eg: 'Например',
  or: 'или',
  fb: 'facebook',
  ggl: 'google',
  vk: 'vk.com',
  tg: 'telegram',
  pl: 'Пати лидер',
  oauth: {
    title: 'Сторонние приложения авторизации',
    link: 'Вы можете подключить к своему аккаунту приложение авторизации ',
    linked: 'К вашему аккаунту подключено приложение авторизации',
    googleLinked: '@:oauth.linked @:ggl',
    facebookLinked: '@:oauth.linked @:fb',
    vkLinked: '@:oauth.linked @:vk',
    telegramLinked: '@:oauth.linked @:tg',
    link_google: '@:oauth.link @:ggl',
    link_facebook: '@:oauth.link @:fb',
    link_vk: '@:oauth.link @:vk',
    link_telegram: '@:oauth.link @:tg',
    updateProvider: 'Update data',
    lastUpdate: 'Last update',
    connectProvider: 'Connect',
    disconnectProvider: 'Disconnect',
  },
  labels: {
    username: 'Никнейм',
    email: 'Email',
    password: 'Пароль',
    currentPassword: 'Ваш текущий пароль',
    newPassword: 'Желаемый новый пароль',
    signup: 'Зарегистрироваться',
    login: 'Ваш никнейм или email адрес',
    signin: 'Войти',
    forgot: 'Забыли пароль?',
    restoreAccess: 'Восстановить доступ',
    logout: 'Выйти',
    haveKey: 'Уже есть ключ?',
    repair: {
      guest1:
        'Для запуска процесса восстановления доступа к своему аккаунту введите email адрес, который вы указывали при регистрации. На него будет отправлено письмо с ключом подтверждения операции',
      user1:
        'Вы были переадресованы на эту страницу указав, что забыли пароль от своего аккаунта. Вы можете сбросить текущий пароль и установить новый. Чтобы продолжить - нажмите кнопку "Далее" и мы отправим на ваш email адрес ключ подтверждения',
      2: 'Введите ключ подтверждения из письма, которое пришло на ваш электронный адрес',
      3: 'Теперь можете указать ваш новый пароль. После подтверждения вы будете перенаправлены на страницу авторизации',
    },
    add: 'Добавить',
    confirm: 'Подтвердить',
    save: 'Сохранить',
    next: 'Далее',
    back: 'Назад',
    change: 'Сменить',
    update: 'Обновить',
    timezone: 'Часовой пояс',
    dateFormat: 'Формат дат',
    noTimezone: 'Указанный часовой пояс не найден',
    country: 'Страна',
    language: 'Язык',
    noCountry: 'Указанная страна не найдена',
    sending: 'Отправка',
    settings: 'Настройки',
    confirmEmail: 'Ключ подтверждения email адреса',
    confirm: 'Подтвердить',
    resendConfirmKey: 'Ключ подтверждения будет снова отправлен на электронный адрес',
    expand: 'Развернуть',
    collapse: 'Свернуть',
  },
  errors: {
    spaces: 'Пробелы запрещены',
    network:
      'Не удалось связаться с сервером. Проверьте свое соединение с интернетом и попробуйте снова',
    authError: 'Ошибка авторизации',
    chooseUsername: 'Укажите никнейм',
  },
  titles: {
    mainPage: 'Главная',
    rbPage: 'РБшки',
    forum: 'Форум',
    authRepair: 'Сбросить пароль',
    authSignin: 'Авторизация',
    authSignup: 'Регистрация',
    confirmPage: 'Подтверждение',
    settings: {
      main: 'Настройки',
      account: 'Учетные данные',
      password: 'Пароль',
      safety: 'Безопасность',
    },
    party: {
      main: 'Пати',
      all: 'Пати лист',
      members: 'Пати мемберы',
    },
  },
  hints: {
    pattern: 'Только латинские буквы, числа, а также',
    settings: {
      needPasswordToChange:
        'Для внесения изменений вам необходимо сначала установить пароль от аккаунта',
      email: 'Скрыт от остальных пользователей',
      password:
        'При изменении никнейма или email адреса необходимо ввести ваш текущий пароль от аккаунта для подтверждения процедуры',
      now: 'Текущее время',
      DST: 'Автоматический переход на летнее/зимнее время',
      country: 'Выберите страну, в которой вы живете',
      addPassword:
        'Для увеличения безопасности и контроля над аккаунтом рекомендуем вам установить пароль. В дальнейшем он вам может понадобится при совершении некоторых операций (например, смены никнейма, email и пр.)',
      addEmail:
        'Чтобы снизить риск потери доступа к данному аккаунту - привяжите к нему ваш адрес электронной почты. \n Он будет скрыт от других пользователей',
      safety: {
        email1:
          'Был отправлен на указанный вами при регистрации email. Проверьте, правильно ли вы его указали. Если не можете найти сообщение - мы можем ',
        email2: 'отправить вам новый ключ',
      },
    },
    auth: {
      username: '@:hints.pattern - _ и .',
      email: 'На указанный адрес придет письмо для подтверждения',
      password: 'От 7 до 30 символов',
      confirmOperation: 'Укажите ваш пароль от аккаунта для подтверждения операции',
    },
  },
  tabs: {
    routes: {
      homepage: 'Главная',
      rb: 'Рейдовые боссы',
      forum: 'Форум',
      signup: 'Регистрация',
      signin: 'Войти',
      party: 'Пати',
    },
    settings: {
      account: 'Учетная запись',
      password: 'Пароль',
      safety: 'Безопасность',
    },
  },
  party: {
    notFound: 'Пати {name} не найдена',
    createDialogTitle: 'Назовите свою пати',
    labels: {
      name: 'Название',
      slug: 'Адрес страницы',
    },
    hints: {
      slug: '@:hints.pattern {and}',
    },
  },
};
