const jwt = require('jsonwebtoken'),
  uuid = require('uuid'),
  bcrypt = require('bcryptjs');

const redis = require('api/config/redis').redisUsersDB,
  { GraphQLClient } = require('api/config/graphql'),
  { jwtKey } = require('api/config/auth'),
  validator = require('./validator');

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
 * Составляем токен для подтверждения email адреса, смены пароля или других операций
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
 * @param {String} password Пароль пользователя
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
module.exports.comparePasswords = async (unhashed, hashed) => {
  const compare = await bcrypt.compare(unhashed, hashed);
  return compare;
};

/**
 * Ищем пользователя в Redis кэше или в базе данных
 * @param {String} key        Ключ (поле) по которому осуществляется поиск (id/username/email, etc)
 * @param {String} value      Значение ключа поиска
 * @param res                 Экземпляр ответа сервера
 *
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
