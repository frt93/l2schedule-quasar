/**
 * Валидируем никнейм пользователя
 *
 * @param {String} username   Указанный пользователем никнейм
 */
module.exports.validateUsername = username => {
  let message = '',
    charsToRemove = '',
    chars;

  // Выражение ищет пробелы в начале и конце никнейма. Пробелы между буквами в никнейме разрешены
  const spaces = /^\s|\s$/g.test(username);
  if (spaces) {
    message += 'Пробелы в начале и конце никнейма запрещены\n';
  }

  // Запрещенные символы
  const forbiddenChars = /@|~|`|'|"|\/|\\|\|/g;

  // Проверяем строку на наличие запрещенных символов. Проверка длится до конца строки
  while ((chars = forbiddenChars.exec(username))) {
    // Найденный символ дописываем в переменную charsToRemove только в том случае, если конкретно его там еще нет.
    if (charsToRemove.indexOf(chars[0]) === -1) {
      charsToRemove += `${chars[0]} `;
    }
  }

  // Меньше трех (т.е. 2 символа) так как в строку символ добавляется с пробелом
  if (charsToRemove.length && charsToRemove.length < 3)
    message += `Символ ${charsToRemove}запрещен`;
  else if (charsToRemove.length >= 3) {
    message += `Символы ${charsToRemove}запрещены`;
  }

  if (spaces || charsToRemove.length) {
    return message;
  }

  return;
};

/**
 * Валидируем email адрес пользователя. В email адресе запрещены только пробелы
 *
 * @param {String} email    Указанный пользователем email
 */
module.exports.validateEmail = email => {
  let message = '';
  const spaces = /\s/g.test(email);
  if (spaces) {
    message += 'Пробелы запрещены\n';
  }

  const pattern = /@+\w{1,}\.\w{2,}/g.test(email);
  if (!pattern) {
    message += 'Неверный формат email адреса';
  }

  if (spaces || !pattern) {
    return message;
  }

  return;
};

/**
 * Валидируем пароль пользователя. Запрещены только пробелы. Длина от 7 до 30 символов
 *
 * @param {String} password   Указанный пользователем пароль
 */
module.exports.validatePassword = password => {
  let message = '';
  const spaces = /\s/g.test(password);

  if (password.length < 7) {
    message += 'Пароль должен состоять минимум из 7 символов\n';
  }
  if (password.length > 30) {
    message += 'Пароль должен состоять максимум из 30 символов\n';
  }
  if (spaces) {
    message += 'Пробелы запрещены';
  }
  if (message.length) {
    return message;
  }

  return;
};

/**
 * Проверяем переданный объект пользователя (email, username, password или все вместе) на наличие нарушений правил валидации.
 * Эта проверка проводится на случай, если по каким-то причинам аналогичная валидация на клиенте не сработала или ее удалось обойти
 *
 *  @param {String} user     Экземпляр пользователя
 *  @param res               Объект ответа сервера
 */
module.exports.validateUser = (user, res) => {
  let error = {},
    usernameError,
    emailError,
    passwordError;

  // Следующие конструкции if проверяют какие данные переданы для валидации, т.к. наборы эти данных при передачи с разных роутов отличаются
  if (user.username) {
    usernameError = this.validateUsername(user.username);
  }
  if (user.email) {
    emailError = this.validateEmail(user.email);
  }

  if (user.password) {
    passwordError = this.validatePassword(user.password);
  }

  if (usernameError) {
    error.username = true;
    error.usernameErrorMessage = usernameError;
  }
  if (emailError) {
    error.email = true;
    error.emailErrorMessage = emailError;
  }
  if (passwordError) {
    error.password = true;
    error.passwordErrorMessage = passwordError;
  }

  if (usernameError || emailError || passwordError) {
    res.status(500).send(error);
    return false;
  }

  return true;
};

/**
 * Валидируем ключ подтверждения для восстановления пользователю доступа к аккаунту.
 * Эта проверка проводится на случай, если по каким-то причинам аналогичная валидация на клиенте не сработала или ее удалось обойти
 *
 * @param {String} key        Указанный пользователем никнейм
 * @param res                 Объект ответа сервера
 */
module.exports.validateRepairKey = (key, res) => {
  const pattern = /[0-9a-z]{8}-[0-9a-z]{4}-[0-9a-z]{4}-[0-9a-z]{4}-[0-9a-z]{12}/gi.test(key);
  if (!pattern) {
    res.status(500).send({ name: 'Invalid repair key', message: 'Неверный формат ключа' });
  }

  return true;
};

/**
 * Обрабатываем ошибки, возникшие в результате запросов к GraphQL движку
 *
 * @param {Error} e           Экземпляр ошибки
 * @param res                 Объект ответа сервера
 */
module.exports.handleErrors = (e, res) => {
  let error = {};

  // Ошибка подключения к hasura
  if (e.name === 'FetchError') {
    error.name = 'Database connection failed';
    error.message = 'Не удалось связаться с базой данных. Попробуйте снова';
  }

  // Неправильный формат uuid идентификатора в запросе в методе repairConfirm
  if (
    e.message.indexOf('invalid input syntax for type uuid') !== -1 &&
    e.message.indexOf('repairKey:') !== -1
  ) {
    error.name = 'Invalid repair key';
    error.message = 'Неверный формат ключа';
  }

  res.status(500).send(error);
};
