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

  helpers.createUser(credentials, res);
};

/**
 * Авторизуем пользователя
 *
 * @param req                    Объект запроса сервера
 * @param res                    Объект ответа сервера
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
    if (user.password === null) {
      // Пользователь регистрировался с помощью oauth-провайдера и у него нет пароля
      return validator.throwErrors('No password', res);
    }
    // Пользователь найден. Сверяем введенный и хранящийся в БД пароли
    const comparePasswords = await helpers.comparePasswords(credentials.password, user.password);

    if (comparePasswords) {
      // Пароль правльный. Генерируем токен авторизации и отправляем данные пользователю
      const { token } = await helpers.generateToken(user.id);
      user = await helpers.cutPassword(user);

      res.send({ token, user });
    } else {
      // Пароль неверен.Выбрасываем ошибку
      return validator.throwErrors('Wrong password', res);
    }
  }
};

/**
 * Авторизуем пользователя с помощью данных аккаунта одной из доступных социальных сетей
 *
 * @param req                    Объект запроса сервера
 * @param res                    Объект ответа сервера
 *
 * @return {Object}              Экземпляр пользователя
 */
module.exports.oauthLogin = (req, res) => {
  const credentials = req.body,
    provider = credentials.providerName,
    id = credentials.id;

  let user;

  const { composeQuery, response } = require('api/controllers/users/query/oauth');
  const query = composeQuery(provider, id);

  GraphQLClient.request(query)
    .then(async data => {
      user = response(data);
      if (user) {
        helpers.saveUserInRedis(user);
        // Генерируем токен авторизации и отправляем данные пользователю
        const { token } = await helpers.generateToken(user.id);
        user = await helpers.cutPassword(user);

        res.send({ token, user });
      } else {
        // Пользователь не найден. Попытаемся зарегистрировать его
        return validator.throwErrors('oauth: no user', res);
      }
    })
    .catch(e => {
      return validator.handleErrors(e, res);
    });
};

module.exports.oauthCreate = async (req, res) => {
  const credentials = req.body,
    provider = credentials.provider;
  let instance = {
    username: '',
    email: null,
    metadata: {
      data: {
        language: credentials.lang,
        timezone: credentials.timezone,
        country: credentials.country,
      },
    },
  };

  instance.metadata.data[`${provider.providerName}ID`] = provider.id;
  instance.metadata.data[`${provider.providerName}Data`] = helpers.providerData(provider);

  if (provider.email) {
    // Если получили от oauth провайдера email-адрес - проверим, чтобы он был свободен
    const { isExist, error } = await helpers.findEmail(provider.email, res);

    if (error) {
      return validator.handleErrors(error, res);
    }

    if (isExist !== null) {
      return validator.throwErrors('oauth: email already used', res, isExist);
    }

    instance.email = provider.email;
  }

  if (credentials.customUsername) {
    // Если не получилось автоматически подобрать никнейм в блоке else ниже и пользователю было
    // предложено указать его самостоятельно
    instance.username = credentials.customUsername;
  } else {
    // Попытаемся подобрать пользователю никнейм на основе полученных от oauth провайдера данных
    const { username } = await helpers.oauthChooseUsername(provider, res);
    if (!username) {
      // Подобрать не удалось. Выбросим ошибку и на клиенте пользователю будет предложено указать его самостоятельно.
      // И этот указанный никнейм будет отправлен в свойстве credentials.customUsername
      return validator.throwErrors('oauth: username is not chosen', res);
    } else {
      instance.username = username;
    }
  }

  if (provider.name) {
    instance.metadata.data.name = provider.name;
  }

  if (provider.avatar) {
    instance.metadata.data.avatar = provider.avatar;
  }

  helpers.createUser(instance, res);
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
      user = await helpers.cutPassword(user);
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
  const { isExist, error } = await helpers.findUsername(username, res);

  if (error) {
    return validator.handleErrors(error, res);
  }

  if (isExist !== null) {
    return validator.throwErrors('Username already exists', res, isExist);
  }

  res.send(isExist);
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
  const { isExist, error } = await helpers.findEmail(email, res);

  if (error) {
    return validator.handleErrors(error, res);
  }

  if (isExist !== null) {
    return validator.throwErrors('Email already exists', res, isExist);
  }

  res.send(isExist);
};

/**
 * Изменяем никнейм пользователя
 *
 * @param req               Объект запроса сервера
 * @param res               Объект ответа сервера
 */
module.exports.saveUsername = async (req, res) => {
  const username = req.body.username,
    id = req.body.id,
    password = req.body.password;

  const valid = await validator.validateUsername(username, res);
  //Если валидация провалилась - прекращаем выполнение
  if (!valid) return;

  const user = await helpers.findUser('id', id, res);

  const comparePasswords = await helpers.comparePasswords(password, user.password);
  if (!comparePasswords) {
    // Пароль неверен.Выбрасываем ошибку
    return validator.throwErrors('Wrong password', res);
  }

  const payload = { user: { username }, metadata: {} };

  helpers.saveSettings(id, payload, res, 'Username changed');
};

/**
 * Изменяем email пользователя
 *
 * @param req               Объект запроса сервера
 * @param res               Объект ответа сервера
 */
module.exports.saveEmail = async (req, res) => {
  const email = req.body.email,
    id = req.body.id,
    password = req.body.password;

  let succesMessageName = 'Email saved';

  const valid = await validator.validateEmail(email, res);
  //Если валидация провалилась - прекращаем выполнение
  if (!valid) return;

  const user = await helpers.findUser('id', id, res);

  if (user.email) {
    // Если у пользователя уже есть email и он его меняет - запрашиваем на клиенте пароль и сверяем его
    const comparePasswords = await helpers.comparePasswords(password, user.password);
    if (!comparePasswords) {
      // Пароль неверен.Выбрасываем ошибку
      return validator.throwErrors('Wrong password', res);
    }
    succesMessageName = 'Email changed';
  }

  // Сгенерируем ключ подтверждения
  const { key } = await helpers.generateToken();

  const payload = { user: { email }, metadata: { emailVerification: key } };

  helpers.saveSettings(id, payload, res, succesMessageName);
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
        user = helpers.cutPassword(user);
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
  const id = req.body.id,
    payload = {
      user: { id },
      metadata: req.body.data,
    };

  // Пароль верен. Отправляем запрос на изменение данных
  helpers.saveSettings(id, payload, res, 'accountSettings');
};

/**
 * Устанавливаем электронный адрес пользователя.
 * Вызывается метод из личного кабинета в настройках безопасности в том случае, если пользователь регистрировался с помощью
 * oauth провайдера, который не вернул его email адрес
 *
 * @param req               Объект запроса сервера
 * @param res               Объект ответа сервера
 */
module.exports.savePassword = async (req, res) => {
  const password = req.body.password,
    id = req.body.id,
    newPassword = req.body.newPassword;

  let succesMessageName = 'Password saved';

  const user = await helpers.findUser('id', id, res);

  if (user.password === null) {
    // Если устанавливаем пароль впервые
    const valid = await validator.validatePassword(password, res);

    //Если валидация провалилась - прекращаем выполнение
    if (!valid) return;
  } else {
    // Если меняем пароль
    const valid = await validator.accountPasswordValidation(password, newPassword, res);

    //Если валидация провалилась - прекращаем выполнение
    if (!valid) return;

    const comparePasswords = await helpers.comparePasswords(password, user.password);
    if (!comparePasswords) {
      // Пароль неверен.Выбрасываем ошибку
      return validator.throwErrors('Wrong password', res);
    }

    succesMessageName = 'Password changed';
  }

  const hashPassword = await helpers.hashPassword(password); // Хэшируем пароль
  let payload = { user: { password: hashPassword }, metadata: {} };

  helpers.saveSettings(id, payload, res, succesMessageName);
};

/**
 * Изменяем настройки безопасности аккаунта пользователя
 *
 * @param req               Объект запроса сервера
 * @param res               Объект ответа сервера
 *
 * @todo Организовать отправку письма в случае установки email адреса
 */
module.exports.safetySettings = async (req, res) => {
  // const settings = req.body,
  //   id = settings.id;
  // let payload = { user: {}, metadata: {} };
  // if (settings.email) {
  //   payload.user.email = settings.email;
  //   // Сгенерируем ключ подтверждения
  //   const { key } = await helpers.generateToken();
  //   payload.metadata = {
  //     emailVerification: key,
  //   };
  // }
  // helpers.saveSettings(id, payload, res, 'safetySettings');
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
  const id = req.body.id,
    user = await helpers.findUser('id', id, res),
    key = user.metadata.emailVerification;
  let message;

  if (key) {
    const email = user.email;
    console.log(key);
    message = messages(res.lang).success['confirmation key resended'];
    // @todo Отсылаем письмо.
  } else {
    message = messages(res.lang).success['email already confirmed'];
  }
  res.send({ message });
};
