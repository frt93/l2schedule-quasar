const redis = require('api/config/redis').redisPartiesDB,
  { GraphQLClient } = require('api/config/graphql'),
  validator = require('./validator'),
  users = require('api/controllers/users/helpers');

/**
 * Получаем экземпляр пати из хранилища Redis
 *
 * @param {String} id         Идентификатор пати
 */
module.exports.getPartyFromRedis = async id => {
  let user;
  await redis.get(`party:${id}`, (err, result) => {
    user = result;
  });

  return user;
};

/**
 * Сохраняем экземпляр пати в хранилище Redis
 *
 * @param {Object} party      Экземпляр пати
 */
module.exports.savePartyInRedis = party => {
  redis.set(`party:${party.id}`, JSON.stringify(party), 'EX', 172800);
};

/**
 * Проверим наличие в базе данных пати с указанным названием
 *
 * @param {String} name       Название
 * @param res                 Экземпляр ответа сервера
 */
module.exports.findName = async (name, res) => {
  let isExist, error;
  const { query, response } = require('api/controllers/parties/query/findName');
  name = query(name);

  await GraphQLClient.request(name)
    .then(data => {
      isExist = response(data);
    })
    .catch(e => {
      error = e;
    });

  return { isExist, error };
};

/**
 * Проверим наличие в базе данных пати с указанным слагом
 *
 * @param {String} slug       Название
 * @param res                 Экземпляр ответа сервера
 */
module.exports.findSlug = async (slug, res) => {
  let isExist, error;
  const { query, response } = require('api/controllers/parties/query/findSlug');
  slug = query(slug);

  await GraphQLClient.request(slug)
    .then(data => {
      isExist = response(data);
    })
    .catch(e => {
      error = e;
    });

  return { isExist, error };
};

/**
 * Компонуем запрос создания пати и отправлем его
 */
module.exports.createParty = async (payload, res) => {
  const { mutation, variable, response } = require('api/controllers/parties/mutations/create');
  let party = variable(payload),
    createdParty;

  await GraphQLClient.request(mutation, party)
    .then(async data => {
      createdParty = response(data);
    })
    .catch(e => {
      validator.handleErrors(e, res, payload);
    });

  const updateUser = { user: { party_id: createdParty.id }, metadata: {}, safety: {} };

  const { user } = await users.saveSettings(payload.leader_id, updateUser, false);

  party = await this.findParty('name', createdParty.name, res);
  res.send({ party, user });
};

/**
 * Ищем пати в Redis кэше или в базе данных
 *
 * @param {String} key        Ключ (поле) по которому осуществляется поиск (id/name/slug, etc)
 * @param {String} value      Значение ключа поиска
 * @param res                 Экземпляр ответа сервера
 */
module.exports.findParty = async (key, value, res) => {
  let party;
  if (key === 'id') {
    user = await this.getPartyFromRedis(value);
    if (party) {
      // Пати найдена - возвращаем, предварительно спарсив вернувшуюся строку в объект
      return JSON.parse(party);
    }
  }

  // Экземпляр искомой пати не найден в Redis.Поищем в базе данных
  const { composeQuery, response } = require('api/controllers/parties/query/findParty');
  const query = composeQuery(key, value);

  await GraphQLClient.request(query)
    .then(async data => {
      party = await response(data);

      if (party) {
        this.savePartyInRedis(party);
      }
    })
    .catch(e => {
      validator.handleErrors(e, res);
    });

  return party;
};
