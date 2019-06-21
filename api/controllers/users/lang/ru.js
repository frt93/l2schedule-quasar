module.exports = {
  success: {
    emailConfirmed: 'Email адрес успешно подтвержден',
    accountSettings: 'Данные учетной записи обновлены',
    passwordChanged: 'Пароль успешно изменен',
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
    'Repair key not found': 'Указанный ключ не найден в базе данных',
    'Wrong repair key': 'Неверный формат ключа подтверждения',
    'Email confirm key not found':
      'Указанный ключ подтверждения не найден в базе данных. Email адрес не подтвержден',
    'Wrong email confirm key': 'Неверный формат ключа подтверждения. Email адрес не подтвержден',
    'Wrong password': 'Неверный пароль',
    'Password change failed': 'Cмена пароля не удалась. Попробуйте снова',
    FetchError: 'Не удалось связаться с базой данных. Попробуйте снова',
    'Username spaces': 'Пробелы в никнейме запрещены\n',
    'Disallowed char': char => {
      return `Символ ${char}запрещен`;
    },
    'Disallowed chars': chars => {
      return `Символы ${chars}запрещены`;
    },
    'Email spaces': 'Пробелы в email адресе запрещены\n',
    'Wrong email pattern': 'Неверный формат email адреса',
    'Password min length': 'Пароль должен состоять минимум из 7 символов\n',
    'Password max length': 'Пароль должен состоять максимум из 30 символов\n',
    'Password spaces': 'Пробелы в пароле запрещены\n',
    'Constraint violation': 'Введенные вами данные уже существуют в базе данных',
  },
};
