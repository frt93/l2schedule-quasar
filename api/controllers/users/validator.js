const messages = require('./lang');

/**
 * Генерируем ошибки
 *
 * @param {String} name       Имя ошибки
 * @param res                 Объект ответа сервера
 * @param params              Переменная (или объект с несколькими переменными) для детализации сообщения ошибки
 */
module.exports.throwErrors = (name, res, params) => {
  if (name === 'Empty credentials') {
    return res.status(400).send({
      type: 'Empty credentials',
      message: messages(res.lang).errors[name],
    });
  }
  if (name === 'Username not found') {
    return res.status(404).send({
      type: 'usernameError',
      msgType: 'usernameErrorMessage',
      message: messages(res.lang).errors[name](params), // Тут возвращается функция
    });
  }

  if (name === 'Username already exists') {
    return res.status(403).send({
      type: 'usernameError',
      msgType: 'usernameErrorMessage',
      message: messages(res.lang).errors[name](params), // Тут возвращается функция
    });
  }

  if (name === 'Email not found') {
    return res.status(404).send({
      type: 'emailError',
      msgType: 'emailErrorMessage',
      message: messages(res.lang).errors[name](params),
    });
  }

  if (name === 'Email already exists') {
    return res.status(403).send({
      type: 'emailError',
      msgType: 'emailErrorMessage',
      message: messages(res.lang).errors[name](params),
    });
  }

  if (name === 'Repair key not found') {
    return res.status(404).send({
      type: 'repairKeyError',
      msgType: 'repairKeyErrorMessage',
      message: messages(res.lang).errors[name],
    });
  }

  if (name === 'Wrong repair key') {
    return res.status(400).send({
      type: 'repairKeyError',
      msgType: 'repairKeyErrorMessage',
      message: messages(res.lang).errors[name],
    });
  }

  if (name === 'Wrong email confirm key') {
    return res.status(400).send({
      type: 'confirmKeyError',
      msgType: 'confirmKeyErrorMessage',
      message: messages(res.lang).errors[name],
    });
  }

  if (name === 'Email confirm key not found') {
    return res.status(404).send({
      type: 'confirmKeyError',
      msgType: 'confirmKeyErrorMessage',
      message: messages(res.lang).errors[name],
    });
  }

  if (name === 'Wrong password') {
    return res.status(401).send({
      type: 'passwordError',
      msgType: 'passwordErrorMessage',
      message: messages(res.lang).errors[name],
    });
  }

  if (name === 'Password change failed') {
    return res.status(500).send({
      message: messages(res.lang).errors[name],
    });
  }

  if (name === 'Constraint violation') {
    return res.status(500).send({
      message: messages(res.lang).errors[name],
    });
  }
};

/**
 * Обрабатываем ошибки, возникшие в результате запросов к GraphQL движку
 *
 * @param {Error} e           Экземпляр ошибки
 * @param res                 Объект ответа сервера
 * @param params              Переменная (или объект с несколькими переменными) для детализации сообщения ошибки
 */
module.exports.handleErrors = (e, res, params) => {
  // Ошибка подключения к hasura
  if (e.name === 'FetchError') {
    return res.status(503).send({
      type: 'Connection Error',
      message: messages(res.lang).errors[name],
    });
  }

  // Неправильный формат uuid идентификатора в запросе в методе confirmRepair
  else if (
    e.message.indexOf('invalid input syntax for type uuid') != -1 &&
    e.message.indexOf('repairKey:') != -1
  ) {
    return this.throwErrors('Wrong repair key', res);
  } else if (
    e.message.indexOf('Uniqueness violation') != -1 &&
    e.message.indexOf('users_username_key') != -1
  ) {
    return this.throwErrors('Username already exists', res, params.username);
  } else if (
    e.message.indexOf('Uniqueness violation') != -1 &&
    e.message.indexOf('users_email_key') != -1
  ) {
    return this.throwErrors('Email already exists', res, params.email);
  } else {
    res.status(500).send(e);
  }
};

/**
 * Валидируем никнейм пользователя
 *
 * @param {String} username   Указанный пользователем никнейм
 * @param res                 Экземпляр ответа сервера
 */
module.exports.validateUsername = (username, res) => {
  let message = '',
    charsToRemove = '',
    chars;

  // Выражение ищет пробелы в никнейме
  const spaces = /\s/g.test(username);
  if (spaces) {
    message += messages(res.lang).errors['Username spaces'];
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
    message += messages(res.lang).errors['Prohibited char'](charsToRemove);
  else if (charsToRemove.length >= 3) {
    message += messages(res.lang).errors['Prohibited chars'](charsToRemove);
  }

  if (message.length) {
    res.status(400).send({
      type: 'usernameError',
      msgType: 'usernameErrorMessage',
      message,
    });
    return false;
  }

  return true;
};

/**
 * Валидируем email адрес пользователя. В email адресе запрещены только пробелы
 *
 * @param {String} email    Указанный пользователем email
 * @param res               Экземпляр ответа сервера
 */
module.exports.validateEmail = (email, res) => {
  let message = '';

  const spaces = /\s/g.test(email);
  if (spaces) {
    message += messages(res.lang).errors['Email spaces'];
  }

  const pattern = /@+\w{1,}\.\w{2,}/g.test(email);
  if (!pattern) {
    message += messages(res.lang).errors['Wrong email pattern'];
  }

  if (message.length) {
    res.status(400).send({
      type: 'emailError',
      msgType: 'emailErrorMessage',
      message,
    });
    return false;
  }

  return true;
};

/**
 * Валидируем пароль пользователя. Запрещены только пробелы. Длина от 7 до 30 символов
 *
 * @param {String} password   Указанный пользователем пароль
 * @param res                 Экземпляр ответа сервера
 */
module.exports.validatePassword = (password, res) => {
  let message = '';

  const spaces = /\s/g.test(password);

  if (password.length < 7) {
    message += messages(res.lang).errors['Password min length'];
  }
  if (password.length > 30) {
    message += messages(res.lang).errors['Password max length'];
  }
  if (spaces) {
    message += messages(res.lang).errors['Password spaces'];
  }
  if (message.length) {
    res.status(400).send({
      type: 'passwordError',
      msgType: 'passwordErrorMessage',
      message,
    });
    return false;
  }

  return true;
};

/**
 * Валидируем ключ подтверждения для восстановления пользователю доступа к аккаунту.
 * Эта проверка проводится на случай, если по каким-то причинам аналогичная валидация на клиенте не сработала или ее удалось обойти
 *
 * @param {String} key        Указанный пользователем ключ
 * @param res                 Объект ответа сервера
 */
module.exports.validateRepairKey = (key, res) => {
  const pattern = /[0-9a-z]{8}-[0-9a-z]{4}-[0-9a-z]{4}-[0-9a-z]{4}-[0-9a-z]{12}/gi.test(key);
  if (!pattern) {
    this.throwErrors('Wrong repair key', res);
    return false;
  }

  return true;
};

/**
 * Валидируем ключ подтверждения email адреса пользователя.
 *
 * @param {String} key        Указанный пользователем никнейм
 * @param res                 Объект ответа сервера
 */
module.exports.validateEmailConfirmationKey = (key, res) => {
  const pattern = /[0-9a-z]{8}-[0-9a-z]{4}-[0-9a-z]{4}-[0-9a-z]{4}-[0-9a-z]{12}/gi.test(key);
  if (!pattern) {
    this.throwErrors('Wrong email confirm key', res);
    return false;
  }

  return true;
};

/**
 * Валидируем данные формы регистрации
 *
 *  @param {Object} credentials   Регистрационные данные
 *  @param res                    Экземпляр ответа сервера
 *
 */
module.exports.signupValidation = async (credentials, res) => {
  if (!credentials.username || !credentials.email || !credentials.password) {
    // Форма заполнена неполностью - выбрасываем ошибку
    this.throwErrors('Empty credentials', res);
    return false;
  }

  let valid;

  valid = await this.validateUsername(credentials.username, res);
  if (!valid) return false;

  valid = await this.validateEmail(credentials.email, res);
  if (!valid) return false;

  valid = await this.validatePassword(credentials.password, res);
  if (!valid) return false;

  return true;
};

/**
 * Валидируем данные формы авторизации
 *
 *  @param {Object} credentials   Авторизационные данные
 *  @param res                    Экземпляр ответа сервера
 *
 */
module.exports.signinValidation = async (credentials, res) => {
  const username = credentials.username;
  const email = credentials.email;
  const password = credentials.password;

  if ((!username && !email) || !password) {
    // Форма заполнена неполностью - выбрасываем ошибку
    this.throwErrors('Empty credentials', res);
    return false;
  }

  let valid;

  valid = await this.validatePassword(password, res);
  if (!valid) return false;

  if (username) {
    // Если пользователь авторизуется с помощью никнейма
    valid = await this.validateUsername(username, res);
    if (!valid) return false;
  } else if (email) {
    // Если пользователь авторизуется с помощью email-адреса
    valid = await this.validateEmail(email, res);
    if (!valid) return false;
  }

  return true;
};

/**
 * Валидируем данные формы смены пароля по итогам процесса восстановления доступа к аккаунту
 *
 *  @param {Object} credentials   Авторизационные данные
 *  @param res                    Экземпляр ответа сервера
 *
 */
module.exports.repairPasswordValidation = async (credentials, res) => {
  const email = credentials.email;
  const password = credentials.password;
  const key = credentials.key;

  if (!email || !password || !key) {
    // Форма заполнена неполностью - выбрасываем ошибку
    this.throwErrors('Empty credentials', res);
    return false;
  }

  valid = await this.validateEmail(email, res);
  if (!valid) return false;

  valid = await this.validatePassword(password, res);
  if (!valid) return false;

  valid = await this.validateRepairKey(key, res);
  if (!valid) return false;

  return true;
};

module.exports.accountSettingsValidation = async (credentials, password, res) => {
  if (!credentials.username || !credentials.email || !password) {
    // Форма заполнена неполностью - выбрасываем ошибку
    this.throwErrors('Empty credentials', res);
    return false;
  }

  let valid;

  valid = await this.validateUsername(credentials.username, res);
  if (!valid) return false;

  valid = await this.validateEmail(credentials.email, res);
  if (!valid) return false;

  valid = await this.validatePassword(password, res);
  if (!valid) return false;

  return true;
};
