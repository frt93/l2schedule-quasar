export default {
  phrases: {
    eg: 'Например',
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
    save: 'Сохранить',
    next: 'Далее',
    back: 'Назад',
    language: 'Язык',
    timezone: 'Часовой пояс',
    sending: 'Отправка',
    settings: 'Настройки',
    confirmKey: 'Ключ подтверждения',
    confirm: 'Подтвердите',
    resendConfirmKey: 'Ключ подтверждения будет снова отправлен на электронный адрес',
  },
  errors: {
    spaces: 'Пробелы запрещены',
    char: 'Уберите символ',
    chars: 'Уберите символы',
    wrongEmail: 'Неверный формат email адреса',
    network:
      'Не удалось связаться с сервером. Проверьте свое соединение с интернетом и попробуйте снова',
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
  },
  hints: {
    settings: {
      username:
        'Имя под которым вас видят остальные пользователи. Можно использовать для авторизации',
      email: 'Ваш адрес электронный почты',
      password:
        'При изменении никнейма или email адреса необходимо ввести ваш текущий пароль от аккаунта для подтверждения процедуры',
      safety: {
        email1:
          'Был отправлен на указанный вами при регистрации email адрес. Если не можете найти письмо - мы можем ',
        email2: 'выслать вам код повторно',
        email3: '. Если и это не помогло - ',
        email4: 'проверьте',
        email5: ' правильно ли вы указали свой email адрес',
      },
    },
    auth: {
      username: 'Максимум 16 символов',
      email: 'На указанный адрес придет письмо для подтверждения',
      password: 'От 7 до 30 символов',
    },
  },
  tabs: {
    routes: {
      homepage: 'Главная',
      rb: 'Рейдовые боссы',
      forum: 'Форум',
      signup: 'Регистрация',
      signin: 'Войти',
    },
    settings: {
      account: 'Учетная запись',
      password: 'Пароль',
      safety: 'Безопасность',
    },
  },
};
