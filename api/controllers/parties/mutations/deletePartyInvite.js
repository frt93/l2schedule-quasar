const { returningPattern, responsePattern } = require('../query/partyInstancePattern');
/**
 *
 * @param {Int} id           ID приглашения, которое надо удалить
 */
const mutation = id => {
  return `mutation cancelPartyInvite {
  delete_party_invitations(where: {id: {_eq: ${id}}}) {
    returning {
      party {
        ${returningPattern}
      }
    }
  }
}`;
};

/**
 * Обрабатываем полученные в результате запроса данные, добираясь до необходимого уровня вложенности,
 * в котором непосредственно находится возвращаемый экземпляр зарегистрированного пользователя
 *
 * @param {Object} data     Данные, полученные с сервера
 * @return {Object} party
 */
const response = data => {
  const returning = data.delete_party_invitations.returning[0],
    party = responsePattern(returning);
  console.log(party);
  return party;
};

module.exports = { mutation, response };
