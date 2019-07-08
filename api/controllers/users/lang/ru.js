module.exports = {
  success: {
    'Username changed': 'Никнейм изменен',
    'Email saved': 'Email адрес сохранен',
    'Email changed': 'Email адрес изменен',
    'Password saved': 'Пароль успешно сохранен',
    'Password changed': 'Пароль успешно изменен',
    emailConfirmed: 'Email адрес успешно подтвержден',
    'confirmation key resended': 'Отправлено. Проверьте ваш email',
    'email already confirmed': 'Похоже, что ваш email уже подтвержден',
    accountSettings: 'Данные учетной записи обновлены',
    safetySettings: 'Настройки безопасности обновлены',
  },
  errors: {
    'Empty credentials': 'Вы неполностью заполнили форму',
    'Username not found': username => {
      return `Пользователь с никнеймом ${username} не найден в базе данных`;
    },
    'Username already exists': username => {
      return `Никнейм ${username} уже используется другим пользователем`;
    },
    'Email not found': email => {
      return `Пользователь с email адресом ${email} не найден в базе данных`;
    },
    'Email already exists': email => {
      return `Email адрес ${email} уже используется другим пользователем`;
    },
    'oauth: email already used': email => {
      return `На основании полученных данных мы пологаем, что вы авторизовались ранее с помощью другого стороннего приложения, так как email адрес ${email} уже привязан к существующему аккаунту. Проверьте его на наличие письма с авторизационными данными или восстановите с его помощью доступ к аккаунту.`;
    },
    'oauth: username is not chosen':
      'Извините, но мы не можем подобрать для вас никнейм. Пожалуйста, укажите его самостоятельно',
    'Repair key not found': 'Указанный ключ не найден в базе данных',
    'Wrong repair key': 'Неверный формат ключа подтверждения',
    'Email confirm key not found':
      'Указанный ключ подтверждения не найден в базе данных. Email адрес не подтвержден',
    'Wrong email confirm key': 'Неверный формат ключа подтверждения. Email адрес не подтвержден',
    'Wrong password': 'Неверный пароль',
    'No password':
      'У этого аккаунта нет пароля. Авторизуйтесь с помощью стороннего приложения или пройдите процедуру восстановления доступа',
    'Password change failed': 'Cмена пароля не удалась. Попробуйте снова',
    FetchError: 'Не удалось связаться с базой данных. Попробуйте снова',
    'Username spaces': 'Пробелы запрещены',
    'username length': 'Не более 16 символов',
    'username pattern': 'Только латинские буквы, числа, а также - _ и .',
    'Email spaces': 'Пробелы в email адресе запрещены',
    'Wrong email pattern': 'Неверный формат email адреса',
    'Password min length': 'Пароль должен состоять минимум из 7 символов',
    'Password max length': 'Пароль должен состоять максимум из 30 символов',
    'Password spaces': 'Пробелы в пароле запрещены',
    'Constraint violation': 'Введенные вами данные уже существуют в базе данных',
  },
};
