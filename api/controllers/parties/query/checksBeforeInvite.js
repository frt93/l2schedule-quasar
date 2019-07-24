/**
 * Компонуем запрос поиска приглашения пользователя в пати
 *
 * @param {Int} invitee      ID пользователя
 * @param {Int} partyID      ID пати
 */
const query = (invitee, partyID) => {
  return `query findPartyInvite {
    party_invitations(where: {_and: [{invitee_user_id: {_eq: ${invitee}}}, {party_id: {_eq: ${partyID}}}]}) {
      id
    }

    users(where: {id: {_eq: ${invitee}}}) {
      party {
        id
      }
    }
  }`;
};

/**
 * Обрабатываем полученные в результате запроса данные, добираясь до необходимого уровня вложенности,
 * в котором непосредственно находится либо пати с искомым названием либо пустой объект
 *
 * @param {Object} data     Данные, полученные с сервера
 * @return {String} name
 */
const response = data => {
  const invite = data.party_invitations;
  const user = data.users[0];
  return { invite, user };
};

module.exports = { query, response };
