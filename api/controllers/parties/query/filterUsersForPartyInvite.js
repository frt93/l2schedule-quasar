/**
 * Компонуем запрос данных для поиска пользователей
 *
 * @param {String} name            Значение, по вхождению которого в никнейм или отображаемое имя пользователя, осуществляется поиск
 * @param {Int} partyID            ID пати, в которую полученные пользователи будут приглашаться. Поэтому отсеим в запросе пользователей, которые в ней уже состоят
 */
const composeQuery = (name, partyID) => {
  return `query findUsers {
    users(where: {_or: [{username: {_ilike: "%${name}%"}}, {metadata: {name: {_ilike: "%${name}%"}}}], _not: {party: {id: {_eq: ${partyID}}}}}) {
      id
      username
      metadata {
        avatar
        name
      }
      partyInvitations {
        party_id
      }
    }
  }
  `;
};

module.exports = { composeQuery };
