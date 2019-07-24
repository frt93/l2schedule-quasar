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

  const valid = await validator.validatePartyName(name, res);
  if (!valid) {
    return false;
  }

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

  const valid = await validator.validatePartySlug(slug, res);
  if (!valid) {
    return false;
  }

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
  const key = req.query.key,
    value = req.query.value,
    party = await helpers.findParty(key, value, res);

  if (party) {
    res.send({ party });
  } else {
    res.status(404).send('Party not found');
  }
};

/**
 * Получим список пользователей, которых можно пригласить в конкретную пати
 *
 * @param req                    Объект запроса сервера
 * @param res                    Объект ответа сервера
 */
module.exports.usersCanBeInvited = async (req, res) => {
  const name = req.query.name,
    partyID = req.query.partyID;

  const { composeQuery } = require('api/controllers/parties/query/filterUsersForPartyInvite');
  const query = composeQuery(name, partyID);

  GraphQLClient.request(query)
    .then(async data => {
      res.send(data.users);
    })
    .catch(e => {
      return validator.handleErrors(e, res);
    });
};

/**
 * "Отправляем" пользователю инвайт в пати
 *
 * @param req               Объект запроса сервера
 * @param res               Объект ответа сервера
 */
module.exports.sendInvite = async (req, res) => {
  const invitee = req.body.invitee,
    inviterID = req.body.inviterID,
    partyID = req.body.partyID,
    { isInviteExist, inviteeUserParty } = await helpers.checksBeforeInvite(
      invitee.id,
      partyID,
      res
    ); // Осуществим некоторые проверки перед сохранением инвайта

  if (invitee.id == inviterID) {
    //Пользователь пытается пригласить сам себя
    return validator.throwErrors('Self invite', res);
  }

  if (inviteeUserParty && inviteeUserParty.id == partyID) {
    // Пришлашается пользователь, который уже состоит в этой пати
    return validator.throwErrors('User already in your party', res, invitee.username);
  }

  if (isInviteExist) {
    //Пользователь уже приглашен в эту пати ранее
    return validator.throwErrors('Already invited', res, invitee.username);
  }

  helpers.sendInvite(invitee, inviterID, partyID, res);
};

/**
 * "Отменяем" инвайт пользователя в пати
 *
 * @param req               Объект запроса сервера
 * @param res               Объект ответа сервера
 */
module.exports.cancelInvite = async (req, res) => {
  const inviteID = req.body.id;
  console.log(inviteID);
  const { mutation, response } = require('api/controllers/parties/mutations/deletePartyInvite');
  const inviteToCancel = mutation(inviteID);

  await GraphQLClient.request(inviteToCancel)
    .then(async data => {
      const party = await response(data);
      console.log(party);
      helpers.savePartyInRedis(party);
      res.send(party);
    })
    .catch(e => {
      return validator.handleErrors(e, res);
    });
};
