const redis = require('api/config/redis').redisPartiesDB,
  { GraphQLClient } = require('api/config/graphql'),
  validator = require('./validator'),
  messages = require('./lang'),
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
 * @param {String} key           Ключ (поле) по которому осуществляется поиск (id/name/slug, etc)
 * @param {String | Int} value   Значение ключа поиска
 * @param res                    Экземпляр ответа сервера
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

/**
 * Перед сохранением инвайта пользователя в пати сделаем некоторые проверки. Во-первых, проверим, нет ли уже у приглашаемого пользователя инвайта в эту пати.
 * Также, проверим, чтобы приглашаемый пользователь уже не состоял в пати, в которую его приглашают
 *
 * @param {Int} inviteeID     ID приглашаемого пользователя
 * @param {Int} partyID       ID пати, в которую пользователь приглашается
 * @param res                 Экземпляр ответа сервера
 */
module.exports.checksBeforeInvite = async (inviteeID, partyID, res) => {
  let isInviteExist = false,
    inviteeUserParty = null;
  const { query, response } = require('api/controllers/parties/query/checksBeforeInvite');
  const payload = query(inviteeID, partyID);

  await GraphQLClient.request(payload)
    .then(async data => {
      const { invite, user } = response(data);
      if (invite.length) {
        isInviteExist = true;
      }
      if (user) {
        inviteeUserParty = user.party;
      }
    })
    .catch(e => {
      validator.handleErrors(e, res);
    });

  return { isInviteExist, inviteeUserParty };
};

/**
 * Сохраняем в базе данных приглашение пользователя в пати
 *
 * @param {Object} invitee    Данные приглашаемого пользователя
 * @param {Int} inviterID     ID приглашающего пользователя
 * @param {Int} partyID       ID пати, в которую пользователь приглашается
 * @param res                 Экземпляр ответа сервера
 */
module.exports.sendInvite = (invitee, inviterID, partyID, res) => {
  const { mutation, variable, response } = require('api/controllers/parties/mutations/inviteUser');
  let invite = { invitee_user_id: invitee.id, inviter_user_id: inviterID, party_id: partyID };
  invite = variable(invite);

  GraphQLClient.request(mutation, invite)
    .then(async data => {
      let { party, inviteeUser } = response(data);
      this.savePartyInRedis(party);
      users.saveUserInRedis(inviteeUser);
      //@todo socket оповещение
      message = {
        message: messages(res.lang).success['Invite send'](invitee.username),
        icon: 'mdi-account-check-outline',
      };
      res.send({ party, message });
    })
    .catch(e => {
      validator.handleErrors(e, res);
    });
};
