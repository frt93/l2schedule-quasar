const bcrypt = require('bcryptjs'),
  jwt = require('jsonwebtoken'),
  uuid = require('uuid');

const { GraphQLClient } = require('api/config/graphql'),
  { jwtKey } = require('api/config/auth'),
  { replaceSpaces } = require('api/utils/filters'),
  { validateUser, validateRepairKey, handleErrors } = require('api/utils/auth');

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
  let user = req.body;

  const valid = await validateUser(user, res);
  //Если валидация провалилась - прекращаем выполнение
  if (!valid) return;

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

  const valid = await validateUser(credentials, res);
  //Если валидация провалилась - прекращаем выполнение
  if (!valid) return;

  const { composeQuery, response } = require('api/controllers/users/query/findUser');

  if (credentials.username) {
    // Если пользователь авторизуется с помощью никнейма
    query = composeQuery('username', credentials.username);
    error = {
      username: true,
      usernameErrorMessage: `Пользователь с никнеймом ${credentials.username} не найден`,
    };
  } else if (credentials.email) {
    // Если пользователь авторизуется с помощью email-адреса
    query = composeQuery('email', credentials.email);
    error = {
      email: true,
      emailErrorMessage: `Пользователь с email-адресом ${credentials.email} не найден`,
    };
  }

  // Пытаемся получить экземпляр пользователя из базы данных
  await GraphQLClient.request(query)
    .then(async data => {
      user = await response(data);

      if (!user) {
        // Пользователь не найден - выбрасываем ошибку (тело ошибки в переменной error)
        res.status(500).send(error);
      } else {
        // Пользователь найден. Сверяем введенный и хранящийся в БД пароли
        const comparePasswords = await this.comparePassword(credentials.password, user.password);
        if (comparePasswords) {
          // Пароль правльный. Генерируем токен авторизации и отправляем данные пользователю
          const { token } = await this.generateToken(user.id);
          res.send({ token, user });
        } else {
          // Пароль неверен.Выбрасываем ошибку
          res.status(500).send({ password: true, passwordErrorMessage: 'Неверный пароль' });
        }
      }
    })
    .catch(e => {
      res.status(500).send(e);
    });
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
  let query, user;
  const token = req.body.token;
  if (!token)
    return res.status(400).send({ type: 'error', message: 'Authorization header not found.' });

  jwt.verify(token, jwtKey, async (error, result) => {
    if (error)
      return res
        .status(403)
        .send({ type: 'error', message: 'Provided authorization token is invalid.', error });

    const { composeQuery, response } = require('api/controllers/users/query/findUser');
    query = await composeQuery('id', result.id);

    // Пытаемся получить экземпляр пользователя из базы данных
    await GraphQLClient.request(query)
      .then(async data => {
        user = await response(data);

        if (!user) {
          res.status(403).send('User not found.');
        } else {
          res.send(user);
        }
      })
      .catch(e => {
        handleErrors(e, res);
      });
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

  const valid = await validateUser(req.body, res);
  //Если валидация провалилась - прекращаем выполнение
  if (!valid) return;

  const { query, response } = require('api/controllers/users/query/checkUsername');
  username = replaceSpaces(username);
  username = query(username);

  GraphQLClient.request(username)
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
 * 
 * @param req               Объект запроса сервера
 * @param res               Объект ответа сервера

 * @return {String}         Email адрес пользователя, если он уже существует
 */
module.exports.checkEmail = async (req, res) => {
  let email = req.body.email;

  const valid = await validateUser(req.body, res);
  //Если валидация провалилась - прекращаем выполнение
  if (!valid) return;

  const { query, response } = require('api/controllers/users/query/checkemail');
  email = query(email);

  GraphQLClient.request(email)
    .then(data => {
      const user = response(data);
      res.send(user);
    })
    .catch(e => {
      res.status(500).send(e);
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
  let mutation;
  const email = req.body.email;

  const valid = await validateUser(req.body, res);
  //Если валидация провалилась - прекращаем выполнение
  if (!valid) return;

  const { key } = await this.generateToken();

  const { composeMutation, composeResponse } = require('api/controllers/users/mutations/repair');
  mutation = composeMutation(email, key);

  GraphQLClient.request(mutation)
    .then(data => {
      const response = composeResponse(data);
      res.send(response);
      // Тут отправляем письмо
    })
    .catch(e => {
      res.status(500).send(e);
    });
};

/**
 * Продолжение операции восстанавления пользователю доступа к аккаунту.
 * На основании переданного ключа восстановления ищем и возвращаем соответствующий ему экземпляр пользователя
 *
 * @param req               Объект запроса сервера
 * @param res               Объект ответа сервера
 */
module.exports.repairConfirm = async (req, res) => {
  let query;
  const key = req.body.key;
  const valid = await validateRepairKey(key, res);
  //Если валидация провалилась - прекращаем выполнение
  if (!valid) return;

  const { composeQuery, composeResponse } = require('api/controllers/users/query/confirm-repair');
  query = composeQuery(key);

  GraphQLClient.request(query)
    .then(data => {
      const user = composeResponse(data);

      if (user === null) {
        res.status(500).send({
          name: 'Repair key not found',
          message: 'Указанный ключ не найден в базе данных',
        });
        return;
      }

      res.send(user);
    })
    .catch(e => {
      handleErrors(e, res);
    });
};

/**
 * Изменяем пароль пользователя
 *
 * @param req               Объект запроса сервера
 * @param res               Объект ответа сервера
 */
module.exports.changePassword = async (req, res) => {
  const email = req.body.email;
  const password = req.body.password;

  const valid = await validateUser(req.body, res);
  //Если валидация провалилась - прекращаем выполнение
  if (!valid) return;

  const hashedPassword = await this.hashPassword(password);
  const {
    composeMutation,
    composeResponse,
  } = require('api/controllers/users/mutations/change-password');
  const mutation = composeMutation(email, hashedPassword);
  GraphQLClient.request(mutation)
    .then(async data => {
      const response = await composeResponse(data);

      if (!response) {
        res.status(500).send({
          name: 'Operation failed',
          message: 'Смена пароля не удалась. Попробуйте снова',
        });
        return;
      }

      res.send(response);
    })
    .catch(e => {
      handleErrors(e, res);
    });
};

/**
 * Хэшируем пароль пользователя
 * @param {String} password Пароль пользователя\
 * @return {String}
 */
module.exports.hashPassword = password => {
  const hash = bcrypt.hash(password, 10);
  return hash;
};

/**
 * Проверяем совпадение указанного пароля с хэшированным паролем, сохраненным в БД
 * @param {String} unhashed   Пароль, указанный пользователем
 * @param {String} hashed     Пароль, сохраненный в базе данных в виде хэша
 * @return Boolean
 */
module.exports.comparePassword = async (unhashed, hashed) => {
  const compare = await bcrypt.compare(unhashed, hashed);
  return compare;
};

/**
 * Составляем токен для подтверждения email адреса, смены пароля или других операций
 * @param id                Уникальный идентификатор пользователя, для которого генерируется токен
 * @return {String}
 */
module.exports.generateToken = async (id, key) => {
  if (key === undefined) {
    key = await uuid();
  }

  const token = await jwt.sign({ id, key }, jwtKey);
  return { key, token };
};
