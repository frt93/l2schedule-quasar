const { GraphQLClient } = require('api/config/graphql'),
  validator = require('./validator'),
  helpers = require('./helpers'),
  messages = require('./lang');

module.exports.create = async (req, res) => {
  let party = req.body.party,
    userID = req.body.userID,
    payload = {
      name: party.name,
      slug: party.slug,
      leader_id: userID,
    };

  const valid = await validator.createValidation(payload, res);
  //Если валидация провалилась - прекращаем выполнение
  if (!valid) return;

  helpers.createGroup(payload, res);
};

/**
 * Проверяем свободно ли указанное при создании группы имя
 * 
 * @param req               Объект запроса сервера
 * @param res               Объект ответа сервера

 * @return {String}         Имя группы, если таковая уже существует
 */
module.exports.checkName = async (req, res) => {
  let name = req.body.name;

  const { isExist, error } = await helpers.findName(name, res);

  if (error) {
    return validator.handleErrors(error, res);
  }

  if (isExist !== null) {
    return validator.throwErrors('Name already exists', res, isExist);
  }

  res.send(isExist);
};

/**
 * Проверяем свободен ли указанный при создании группы слаг
 * 
 * @param req               Объект запроса сервера
 * @param res               Объект ответа сервера

 * @return {String}         Имя группы, если таковая уже существует
 */
module.exports.checkSlug = async (req, res) => {
  let slug = req.body.slug;

  const { isExist, error } = await helpers.findSlug(slug, res);

  if (error) {
    return validator.handleErrors(error, res);
  }

  if (isExist !== null) {
    return validator.throwErrors('Slug already exists', res);
  }

  res.send(isExist);
};
