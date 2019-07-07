const jwt = require('jsonwebtoken'),
  uuid = require('uuid'),
  bcrypt = require('bcryptjs');

const redis = require('api/config/redis').redisUsersDB,
  { GraphQLClient } = require('api/config/graphql'),
  { jwtKey } = require('api/config/auth'),
  { replaceSpaces } = require('api/utils/filters'),
  validator = require('./validator'),
  messages = require('./lang');

/**
 * Получаем экземпляр пользователя из хранилища Redis
 *
 * @param {String} id         Идентификатор пользователя
 */
module.exports.getUserFromRedis = async id => {
  let user;
  await redis.get(`user:${id}`, (err, result) => {
    user = result;
  });

  return user;
};

/**
 * Сохраняем экземпляр пользователя в хранилище Redis
 *
 * @param {Object} user       Экземпляр пользователя
 */
module.exports.saveUserInRedis = user => {
  redis.set(`user:${user.id}`, JSON.stringify(user), 'EX', 172800);
};

/**
 * Создаем экземпляр пользователя в базе данных
 *
 * @param {Object} credentials   Экземпляр регистрационных данных пользователя
 */
module.exports.createUser = async (credentials, res) => {
  if (credentials.email) {
    // Если есть email - сгенерируем ключ подтверждения
    const { key } = await this.generateToken();
    credentials.metadata.data.emailVerification = key;
  }

  const { mutation, variable, response } = require('api/controllers/users/mutations/create');
  user = variable(credentials);

  GraphQLClient.request(mutation, user)
    .then(async data => {
      let createdUser = response(data);
      const { token } = await this.generateToken(createdUser.id);

      this.saveUserInRedis(createdUser); // Сохраняем пользователя в Redis
      createdUser = await this.cutPassword(createdUser);

      res.send({ user: createdUser, token });

      if (credentials.email) {
        //@todo посылаем письмо с подтверждением регистрации
      }
    })
    .catch(e => {
      validator.handleErrors(e, res, credentials);
    });
};

/**
 * Попытаемся подобрать никнейм пользователю, который регистрируется при помощи oauth провайдера.
 *
 * @param {String} credentials   Данные пользователя
 * @param res                    Экземпляр ответа сервера
 */
module.exports.oauthChooseUsername = async (credentials, res) => {
  let username = '';

  if (credentials.username) {
    // Если в данных, полученных от oauth провайдера, присутствует никнейм - попробуем воспользоваться им
    username = credentials.username;
    // Проверим его на валидность
    const isValid = await validator.validateUsername(username, res, (doRespond = false));

    if (isValid) {
      // Никнейм валиден. Проверим не занят ли он?
      const { isExist } = await this.findUsername(username, res);
      if (isExist === null) {
        // Не занят. Возвращаем и продолжаем регистрацию
        return { username };
      }
    }
  }

  if (credentials.email) {
    username = '';
    // Если не удалось получить никнейм - воспользуемся email адресом (если удалось получить его).
    // Обрежем часть адреса до символа @ и отправим ее на валидацию
    username = credentials.email.split('@')[0];
    const isValid = await validator.validateUsername(username, res, (doRespond = false));

    if (isValid) {
      // Валидно. Проверяем, не занят ли такой никнейм?
      const { isExist } = await this.findUsername(username, res);
      if (isExist === null) {
        // Не занят. Возвращаем и продолжаем регистрацию
        return { username };
      }
    }
  }

  if (credentials.name) {
    username = '';
    // Напоследок - попытаемся воспользовать именем+фамилией пользователя. Валидность пройдет
    // только в случае, если значение на латинице, без спец. символов и длиной не более 16 символов. Попытка - не пытка
    username = replaceSpaces(credentials.name).toLowerCase();
    const isValid = await validator.validateUsername(username, res, (doRespond = false));

    if (isValid) {
      // Валидно. Проверяем, не занят ли такой никнейм?
      const { isExist } = await this.findUsername(username, res);
      if (isExist === null) {
        // Не занят. Возвращаем и продолжаем регистрацию
        return { username };
      }
    }
  }

  username = '';

  return { username };
};

/**
 * Составляем токен для подтверждения email адреса, смены пароля или других операций
 *
 * @param id                Уникальный идентификатор пользователя, для которого генерируется токен
 * @return {String}
 */
module.exports.generateToken = async (id, key) => {
  if (key === undefined) {
    key = await uuid();
  }

  const token = await jwt.sign({ id }, jwtKey);
  return { key, token };
};

/**
 * Хэшируем пароль пользователя
 *
 * @param {String} password Пароль пользователя
 * @return {String}
 */
module.exports.hashPassword = password => {
  const hash = bcrypt.hash(password, 10);
  return hash;
};

/**
 * Проверяем совпадение указанного пароля с хэшированным паролем, сохраненным в БД
 *
 * @param {String} unhashed   Пароль, указанный пользователем
 * @param {String} hashed     Пароль, сохраненный в базе данных в виде хэша
 * @return Boolean
 */
module.exports.comparePasswords = async (unhashed, hashed) => {
  const compare = await bcrypt.compare(unhashed, hashed);
  return compare;
};

/**
 * Ищем пользователя в Redis кэше или в базе данных
 *
 * @param {String} key        Ключ (поле) по которому осуществляется поиск (id/username/email, etc)
 * @param {String} value      Значение ключа поиска
 * @param res                 Экземпляр ответа сервера
 */
module.exports.findUser = async (key, value, res) => {
  let user;
  if (key === 'id') {
    user = await this.getUserFromRedis(value);
    if (user !== null) {
      // Пользователь найден - возвращаем, предварительно спарсив вернувшуюся строку в объект
      return JSON.parse(user);
    }
  }

  // Экземпляр искомого пользователя не найден в Redis.Поищем в базе данных
  const { composeQuery, response } = require('api/controllers/users/query/findUser');
  const query = composeQuery(key, value);

  await GraphQLClient.request(query)
    .then(async data => {
      user = await response(data);
      if (user) this.saveUserInRedis(user);
    })
    .catch(e => {
      validator.handleErrors(e, res);
    });

  return user;
};

/**
 * Проверим наличие в базе данных пользователя с указанным никнеймом
 *
 * @param {String} username   Никнейм
 * @param res                 Экземпляр ответа сервера
 */
module.exports.findUsername = async (username, res) => {
  let isExist, error;
  const { query, response } = require('api/controllers/users/query/checkUsername');
  username = query(username);

  await GraphQLClient.request(username)
    .then(data => {
      isExist = response(data);
    })
    .catch(e => {
      error = e;
    });

  return { isExist, error };
};

/**
 * Проверим наличие в базе данных пользователя с указанным email адресом
 *
 * @param {String} email      Email адрес
 * @param res                 Экземпляр ответа сервера
 */
module.exports.findEmail = async (email, res) => {
  let isExist, error;
  const { query, response } = require('api/controllers/users/query/checkemail');
  email = query(email);

  await GraphQLClient.request(email)
    .then(data => {
      isExist = response(data);
    })
    .catch(e => {
      error = e;
    });

  return { isExist, error };
};

/**
 * Сохраняем внесенные пользователем изменения данных аккаунта
 *
 * @param {Integer} id              Идентификатор пользователя
 * @param {Object} payload          Измененные данные, требующие сохранения
 * @param res                       Экземпляр ответа сервера
 * @param {String} successMessage   Название сообщения об успешном сохранении
 */
module.exports.saveSettings = (id, payload, res, successMessage) => {
  const { mutation, variables, response } = require('./mutations/settings/account');
  const data = variables(id, payload);

  GraphQLClient.request(mutation, data)
    .then(async updated => {
      let updatedUser = response(updated);

      this.saveUserInRedis(updatedUser); // Сохраняем пользователя в Redis

      updatedUser = await this.cutPassword(updatedUser); // Убираем из возвращаемого экземпляра пароль
      const message = messages(res.lang).success[successMessage];
      res.send({ user: updatedUser, message });
    })
    .catch(e => {
      return validator.handleErrors(e, res, payload.user);
    });
};

/**
 * Удалим из инстанса данных пользователя пароль в том случае, если он не равен null. В этом случае
 * мы оставим этот null, чтобы на клиенте рекомендовать пользователю задать пароль от аккаунта
 *
 *  @param user                Инстанс данных пользователя
 */
module.exports.cutPassword = user => {
  if (user.password !== null) {
    delete user.password;
  }

  return user;
};
