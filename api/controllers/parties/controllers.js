const { GraphQLClient } = require('api/config/graphql'),
  validator = require('./validator'),
  helpers = require('./helpers'),
  messages = require('./lang'),
  users = require('api/controllers/users/helpers');

module.exports.create = async (req, res) => {
  let party = req.body,
    userID = req.body.userID,
    payload = {
      name: party.name,
      slug: party.slug,
      leader_id: userID,
    };

  const valid = await validator.createValidation(payload, res);
  //Если валидация провалилась - прекращаем выполнение
  if (!valid) return;

  const user = await users.findUser('id', userID, res);
  if (user.party) {
    return validator.throwErrors('You already have party', res);
  }

  helpers.createParty(payload, res);
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

/**
 * Получаем экземпляр пати
 *
 * @param req               Объект запроса сервера
 * @param res               Объект ответа сервера
 */
module.exports.getParty = async (req, res) => {
  const key = req.body.key,
    value = req.body.value;

  const party = await helpers.findParty(key, value, res);
  if (party) {
    res.send({ party });
  } else {
    res.status(404).send('Party not found');
  }
};
