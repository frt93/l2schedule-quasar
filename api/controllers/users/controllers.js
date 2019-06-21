const jwt = require('jsonwebtoken');

const { GraphQLClient } = require('api/config/graphql'),
  { jwtKey } = require('api/config/auth'),
  { replaceSpaces } = require('api/utils/filters'),
  validator = require('./validator'),
  helpers = require('./helpers'),
  messages = require('./lang');

/**
 * Создаем нового пользователя.
 * Предварительно валидируем полученные данные.
 * Перед записью в БД хэшируем пароль и генерируем ключ подтверждения email адреса
 * В случае успешной регистрации - сразу авторизуем пользователя
 * @todo Написать функция отправки письма после регистрации
 *
 * @param req               Объект запроса сервера
 * @param res               Объект ответа сервера
 * @return {Object}         Экземпляр созданного пользователя, токен авторизации
 */
module.exports.create = async (req, res) => {
  let credentials = req.body,
    user;

  const valid = await validator.signupValidation(credentials, res);
  //Если валидация провалилась - прекращаем выполнение
  if (!valid) return;

  const unhashedPassword = credentials.password;
  const hashedPassword = await helpers.hashPassword(unhashedPassword);
  credentials.password = hashedPassword;

  const { key } = await helpers.generateToken();
  const metadata = {
    data: {
      emailVerification: key,
    },
  };
  user = { ...credentials, metadata };

  const { mutation, variable, response } = require('api/controllers/users/mutations/create');
  user = variable(user);

  GraphQLClient.request(mutation, user)
    .then(async data => {
      const createdUser = response(data);
      const { token } = await helpers.generateToken(createdUser.id);

      res.send({ user: createdUser, token });
      helpers.saveUserInRedis(createdUser); // Сохраняем пользователя в Redis
    })
    .catch(e => {
      validator.handleErrors(e, res);
    });
};

/**
 * Авторизуем пользователя
 *
 * @param req                    Объект запроса сервера
 * @param res                    Объект ответа сервера
 * @param {Object} credentials   Данные, с помощью которых пользователь пытается авторизовать. Это никнейм/email и пароль
 *
 * @return {Object}              Экземпляр пользователя
 */
module.exports.signin = async (req, res) => {
  let user, error, query;
  const credentials = req.body;

  const valid = await validator.signinValidation(credentials, res);
  if (!valid) return;

  if (credentials.username) {
    // Если пользователь авторизуется с помощью никнейма
    query = { key: 'username', value: credentials.username };
    error = { name: 'Username not found', params: credentials.username };
  } else if (credentials.email) {
    // Если пользователь авторизуется с помощью email-адреса
    query = { key: 'email', value: credentials.email };
    error = { name: 'Email not found', params: credentials.email };
  }

  // Пытаемся получить экземпляр пользователя из базы данных
  user = await helpers.findUser(query.key, query.value, res);

  if (!user) {
    // Пользователь не найден - выбрасываем ошибку (параметры ошибки в переменной error)
    return validator.throwErrors(error.name, res, error.params);
  } else {
    // Пользователь найден. Сверяем введенный и хранящийся в БД пароли
    const comparePasswords = await helpers.comparePasswords(credentials.password, user.password);

    if (comparePasswords) {
      // Пароль правльный. Генерируем токен авторизации и отправляем данные пользователю
      const { token } = await helpers.generateToken(user.id);
      delete user.password; // Удаляем из передаваемого экземпляра пароль

      res.send({ token, user });
    } else {
      // Пароль неверен.Выбрасываем ошибку
      return validator.throwErrors('Wrong password', res);
    }
  }
};

/**
 * Авторизуем пользователя на основании переданного при инициализации приложения токена
 *
 * @param req                    Объект запроса сервера
 * @param res                    Объект ответа сервера
 *
 * @return {Object}              Экземпляр пользователя
 */
module.exports.authorize = (req, res) => {
  const token = req.body.token;
  if (!token)
    return res.status(401).send({ type: 'error', message: 'Authorization header not found.' });

  jwt.verify(token, jwtKey, async (error, result) => {
    if (error)
      return res
        .status(403)
        .send({ type: 'error', message: 'Provided authorization token is invalid.', error });

    // Пытаемся получить экземпляр пользователя из базы данных
    let user = await helpers.findUser('id', result.id, res);

    if (!user) {
      res.status(404).send('User not found.');
    } else {
      delete user.password; // Удаляем из передаваемого экземпляра пароль
      res.send(user);
    }
  });
};

/**
 * Проверяем свободен ли указанный при регистрации пользователем никнейм
 * 
 * @param req               Объект запроса сервера
 * @param res               Объект ответа сервера

 * @return {String}         Никнейм пользователя, если он уже существует
 */
module.exports.checkUsername = async (req, res) => {
  let username = req.body.username;

  const valid = await validator.validateUsername(username, res);
  //Если валидация провалилась - прекращаем выполнение
  if (!valid) return;

  const { query, response } = require('api/controllers/users/query/checkUsername');
  username = replaceSpaces(username);
  username = query(username);

  GraphQLClient.request(username)
    .then(data => {
      username = response(data);
      if (username !== null) {
        return validator.throwErrors('Username already exists', res, username);
      }
      res.send(username);
    })
    .catch(e => {
      return validator.handleErrors(e, res);
    });
};

/**
 * Проверяем свободен ли указанный при регистрации пользователем email адрес
 * 
 * @param req               Объект запроса сервера
 * @param res               Объект ответа сервера

 * @return {String}         Email адрес пользователя, если он уже существует
 */
module.exports.checkEmail = async (req, res) => {
  let email = req.body.email;

  const valid = await validator.validateEmail(email, res);
  //Если валидация провалилась - прекращаем выполнение
  if (!valid) return;

  const { query, response } = require('api/controllers/users/query/checkemail');
  email = query(email);

  GraphQLClient.request(email)
    .then(data => {
      email = response(data);
      if (email !== null) {
        return validator.throwErrors('Email already exists', res, email);
      }
      res.send(email);
    })
    .catch(e => {
      return validator.handleErrors(e, res);
    });
};

/**
 * Подтверждаем электронный адрес пользователя
 *
 * @param req               Объект запроса сервера
 * @param res               Объект ответа сервера
 */
module.exports.confirmEmail = async (req, res) => {
  const key = req.body.key,
    id = req.body.id; // id пользователя, который осуществляет операцию подтверждения.

  const valid = await validator.validateEmailConfirmationKey(key, res);
  //Если валидация провалилась - прекращаем выполнение
  if (!valid) return;

  const {
    composeMutation,
    composeResponse,
  } = require('api/controllers/users/mutations/confirm-email');
  const mutation = composeMutation(key);

  GraphQLClient.request(mutation)
    .then(async data => {
      const email = composeResponse(data);

      if (!email) {
        return validator.throwErrors('Email confirm key not found', res);
      }

      // Мы подтвердили электронный адрес пользователя. Теперь необходимо обновить его экземпляр в Redis.
      // Если паредадть в метод findUser в качестве ключа-значения id, то он просто вернет уже существующий экземпляр из кэша.
      // Поэтому передадим email, чтобы обновленные данные сначала взялись из базы данных, а затем переписались в кэше
      user = await helpers.findUser('email', email, res);
      if (user) {
        delete user.password; // Удаляем пароль из отсылаемого экземпляра
      }
      const message = messages(res.lang).success.emailConfirmed;

      /**
       * Если пользователь авторизован во время операции подтверждения email и его id === id пользователя, email которого в ходе операции был подтвержден -
       * возвращаем в ответе экземпляр пользователя с подтвержденной почтой. Если это условие не соблюдено - отправим только сообщение об успешной операции
       */
      const response = id === user.id ? { message, user } : { message };
      res.send(response);
    })
    .catch(e => {
      return validator.handleErrors(e, res);
    });
};

/**
 * Начало операции восстанавления пользователю доступа к аккаунту.
 * Генерируем ключ подтверждения восстановления и записываем его в базу данных
 *
 * @param req               Объект запроса сервера
 * @param res               Объект ответа сервера
 * @todo Организовать отправку письма пользователю с ключом подтверждения
 */
module.exports.repair = async (req, res) => {
  const email = req.body.email;

  const valid = await validator.validateEmail(email, res);
  //Если валидация провалилась - прекращаем выполнение
  if (!valid) return;

  const { key } = await helpers.generateToken();

  const { composeMutation, composeResponse } = require('api/controllers/users/mutations/repair');
  const mutation = composeMutation(email, key);

  GraphQLClient.request(mutation)
    .then(async data => {
      response = composeResponse(data);

      if (response === null) {
        return validator.throwErrors('Email not found', res, email);
      }

      res.send(response);
      // Тут отправляем письмо
    })
    .catch(e => {
      return validator.handleErrors(e, res);
    });
};

/**
 * Продолжение операции восстанавления пользователю доступа к аккаунту.
 * На основании переданного ключа восстановления ищем и возвращаем соответствующий ему экземпляр пользователя
 *
 * @param req               Объект запроса сервера
 * @param res               Объект ответа сервера
 */
module.exports.confirmRepair = async (req, res) => {
  const key = req.body.key;
  const valid = await validator.validateRepairKey(key, res);
  //Если валидация провалилась - прекращаем выполнение
  if (!valid) return;

  const { composeQuery, composeResponse } = require('api/controllers/users/query/confirm-repair');
  const query = composeQuery(key);

  GraphQLClient.request(query)
    .then(data => {
      const user = composeResponse(data);

      if (user === null) {
        return validator.throwErrors('Repair key not found', res);
      }

      res.send(user);
    })
    .catch(e => {
      return validator.handleErrors(e, res);
    });
};

/**
 * Изменяем пароль пользователя
 *
 * @param req               Объект запроса сервера
 * @param res               Объект ответа сервера
 */
module.exports.repairChangePassword = async (req, res) => {
  const credentials = req.body;

  const valid = await validator.repairPasswordValidation(req.body, res);
  //Если валидация провалилась - прекращаем выполнение
  if (!valid) return;

  const hashedPassword = await helpers.hashPassword(credentials.password);

  const {
    composeMutation,
    composeResponse,
  } = require('api/controllers/users/mutations/change-password');
  const mutation = composeMutation(credentials.email, credentials.key, hashedPassword);

  GraphQLClient.request(mutation)
    .then(async data => {
      const response = await composeResponse(data);

      if (!response) {
        return validator.throwErrors('Password change failed', res);
      }
      const message = messages(res.lang).success.passwordChanged;
      res.send({ response, message });
    })
    .catch(e => {
      return validator.handleErrors(e, res);
    });
};

/**
 * Изменяем данные об аккаунте.
 * Раздел учетных данных
 *
 * @param req               Объект запроса сервера
 * @param res               Объект ответа сервера
 *
 * @todo Организовать отправку письма на случай, если были изменены никнейм или email
 */
module.exports.accountSettings = async (req, res) => {
  const payload = {
    user: req.body.user,
    metadata: req.body.metadata,
  };

  const id = req.body.id;
  const password = req.body.password;

  const user = await helpers.findUser('id', id, res);

  if (!(user.username === payload.user.username && user.email === payload.user.email)) {
    const comparePasswords = await helpers.comparePasswords(password, user.password);

    if (!comparePasswords)
      // Пароль неверен.Выбрасываем ошибку
      return validator.throwErrors('Wrong password', res);
  }

  if (user.email !== payload.user.email) {
    //Пользователь сменил email адрес. Сгенерируем ключ подтверждения
    const { key } = await helpers.generateToken();
    payload.metadata = {
      emailVerification: key,
    };
  }

  // Пароль верен. Отправляем запрос на изменение данных
  const { mutation, variables, response } = require('./mutations/settings/account');
  const data = variables(id, payload);

  GraphQLClient.request(mutation, data)
    .then(updated => {
      const updatedUser = response(updated);

      helpers.saveUserInRedis(updatedUser); // Сохраняем пользователя в Redis
      delete updatedUser.password; // Убираем из возвращаемого экземпляра пароль
      const message = messages(res.lang).success.accountSettings;
      res.send({ user: updatedUser, message });
    })
    .catch(e => {
      return validator.handleErrors(e, res);
    });
};

/**
 * Изменяем пароль от аккаунта пользователя
 *
 * @param req               Объект запроса сервера
 * @param res               Объект ответа сервера
 *
 * @todo Организовать отправку письма после удачной смены пароля
 */
module.exports.passwordSettings = async (req, res) => {
  const payload = req.body;
  const user = await helpers.findUser('id', payload.id, res);

  const comparePasswords = await helpers.comparePasswords(payload.current, user.password);
  if (!comparePasswords) {
    // Пароль неверен.Выбрасываем ошибку
    return validator.throwErrors('Wrong password', res);
  }

  // Текущий пароль верен. Отправляем запрос на его изменение
  const { mutation, variables, response } = require('./mutations/settings/password');
  const hashPassword = await helpers.hashPassword(payload.new); // Хэшируем новый пароль
  const data = variables(payload.id, { password: hashPassword });

  GraphQLClient.request(mutation, data)
    .then(updated => {
      const updatedUser = response(updated);
      helpers.saveUserInRedis(updatedUser); // Сохраняем пользователя в Redis

      const message = messages(res.lang).success.passwordChanged;
      res.send({ message });
    })
    .catch(e => {
      return validator.handleErrors(e, res);
    });
};

/**
 * Заново высылаем пользователю письмо в ключом подтверждения email адреса
 *
 * @param req               Объект запроса сервера
 * @param res               Объект ответа сервера
 *
 * @todo Организовать отправку письма после удачной смены пароля
 */
module.exports.resendEmailConfirmationKey = async (req, res) => {
  const id = req.body.id;
  const user = await helpers.findUser('id', id, res);
  const key = user.metadata.emailVerification;

  if (key) {
    console.log(key);
    // @todo Отсылаем письмо
  }
  res.send({ message: 'okey' });
};
