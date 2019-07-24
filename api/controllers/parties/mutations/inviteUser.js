const { returningPattern, responsePattern } = require('../query/partyInstancePattern');
const user = require('api/controllers/users/query/userInstancePattern');

const mutation = `mutation send_invite ($invite: [party_invitations_insert_input!]!) {
  insert_party_invitations(objects: $invite) {
    returning {
       party {
         ${returningPattern}
       }
       invitee {
        ${user.returningPattern}
      }
    }
  }
}`;

/**
 * Компонуем переменную с экземпляром данных пользователя для регистрации
 *
 * @param {Object} invite   Экземпляр создаваемого приглашения
 */
const variable = invite => {
  return {
    invite,
  };
};

/**
 * Обрабатываем полученные в результате запроса данные, добираясь до необходимого уровня вложенности,
 * в котором непосредственно находится возвращаемый экземпляр пати и приглашенного пользователя
 *
 * @param {Object} data     Данные, полученные с сервера
 * @return {Object} party
 */
const response = data => {
  const returning = data.insert_party_invitations.returning[0],
    party = responsePattern(returning.party);
  inviteeUser = user.responsePattern(returning.invitee);
  return { party, inviteeUser };
};

module.exports = { mutation, variable, response };
