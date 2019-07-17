const redis = require('api/config/redis').redisPartiesDB,
  { GraphQLClient } = require('api/config/graphql');

/**
 * Проверим наличие в базе данных пати с указанным названием
 *
 * @param {String} name       Название
 * @param res                 Экземпляр ответа сервера
 */
module.exports.findName = async (name, res) => {
  let isExist, error;
  const { query, response } = require('api/controllers/groups/query/findName');
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
  const { query, response } = require('api/controllers/groups/query/findSlug');
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
module.exports.createGroup = (party, res) => {};
