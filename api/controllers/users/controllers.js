const bcrypt = require('bcryptjs'),
  jwt = require('jsonwebtoken'),
  uuid = require('uuid');

const { GraphQLClient } = require('api/config/graphql'),
  { jwtKey } = require('api/config/auth'),
  { replaceSpaces } = require('api/utils/filters'),
  { validateUser } = require('api/utils/auth');

/**
 * Создаем нового пользователя.
 * Перед записью в БД хэшируем пароль и генерируем ключ подтверждения email адреса
 * В случае успешной регистрации - сразу авторизуем пользователя
 * @todo Написать функция отправки письма после регистрации
 *
 * @param req               Объект запроса сервера
 * @param res               Объект ответа сервера
 * @return Promise          Экземпляр созданного пользователя, токен авторизации
 */

module.exports.create = async (req, res) => {
  let user = req.body;

  await validateUser(user, res);

  const unhashedPassword = user.password;
  const hashedPassword = await this.hashPassword(unhashedPassword);
  user.password = hashedPassword;

  const { key } = await this.generateToken();
  const metadata = {
    data: {
      emailVerification: key,
    },
  };
  user = { ...user, metadata };

  const { mutation, variable, response } = require('api/controllers/users/mutations/create');
  user = variable(user);

  GraphQLClient.request(mutation, user)
    .then(async data => {
      const createdUser = response(data);
      const { token } = await this.generateToken(createdUser.id);

      res.send({ user: createdUser, token });
    })
    .catch(e => {
      res.status(500).send(e);
    });
};

/**
 * Авторизуем пользователя
 * @param req               Объект запроса сервера
 * @param res               Объект ответа сервера
 * @param credentials       Данные, с помощью которых пользователь пытается авторизовать. Это никнейм/email и пароль
 *
 * @return Object           Экземпляр пользователя
 */
module.exports.signin = async (req, res, credentials) => {
  let user;
  let errorMessage;

  if (credentials.username) {
    // Если пользователь авторизуется с помощью никнейма
    user = await findByUsername(db, credentials.username);
    errorMessage = `Пользователь с никнеймом ${credentials.username} не найден`;
  } else if (credentials.email) {
    // Если пользователь авторизуется с помощью email-адреса
    user = await findcByEmail(db, credentials.email);
    errorMessage = `Пользователь с email-адресом ${credentials.email} не найден`;
  }
};

/**
 * Проверяем свободен ли указанный при регистрации пользователем никнейм
 * @param req               Объект запроса сервера
 * @param res               Объект ответа сервера

 * @return String           Никнейм пользователя, если он уже существует
 */
module.exports.checkUsername = (req, res) => {
  let username = req.body.username;

  const { mutation, variable, response } = require('api/controllers/users/query/checkUsername');
  username = replaceSpaces(username);
  username = variable(username);

  GraphQLClient.request(mutation, username)
    .then(data => {
      const user = response(data);
      res.send(user);
    })
    .catch(e => {
      res.status(500).send(e);
    });
};

/**
 * Проверяем свободен ли указанный при регистрации пользователем email адрес
 * @param req               Объект запроса сервера
 * @param res               Объект ответа сервера

 * @return String           Email адрес пользователя, если он уже существует
 */
module.exports.checkEmail = (req, res) => {
  let email = req.body.email;

  const { mutation, variable, response } = require('api/controllers/users/query/checkemail');

  email = variable(email);

  GraphQLClient.request(mutation, email)
    .then(data => {
      const user = response(data);
      res.send(user);
    })
    .catch(e => {
      res.status(500).send(e);
    });
};

/**
 * Хэшируем пароль пользователя
 * @param password          Пароль пользователя
 * @return String
 */
module.exports.hashPassword = password => {
  const hash = bcrypt.hash(password, 10);
  return hash;
};

/**
 * Проверяем совпадение указанного пароля с хэшированным паролем, сохраненным в БД
 * @param unhashed          Пароль, указанный пользователем
 * @param hashed            Пароль, сохраненный в базе данных в виде хэша
 * @return Boolean
 */
module.exports.comparePassword = async (unhashed, hashed) => {
  const compare = await bcrypt.compare(unhashed, hashed);
  return compare;
};

/**
 * Составляем токен для подтверждения email адреса, смены пароля или других операций
 * @param id                Уникальный идентификатор пользователя, для которого генерируется токен
 * @return String
 */
module.exports.generateToken = async (id, key) => {
  if (key === undefined) {
    key = await uuid();
  }

  const token = await jwt.sign({ id, key }, jwtKey);
  return { key, token };
};
