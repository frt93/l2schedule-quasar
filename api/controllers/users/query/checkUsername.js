/**
 * Компонуем запрос поиска пользователя с указанным никнеймом
 *
 * @param {String} username  Никнейм
 * @return {String}
 */
const query = username => {
  return `query findByUsername {
  users(where: {username: {_ilike: "${username}"}}) {
    username
  }
}`;
};

/**
 * Обрабатываем полученные в результате запроса данные, добираясь до необходимого уровня вложенности,
 * в котором непосредственно находится либо пользователь с искомым никнеймом либо пустой объект
 *
 * @param {Object} data     Данные, полученные с сервера
 * @return {String} username
 */
const response = data => {
  const users = data.users;
  return users.length ? users[0].username : null;
};

module.exports = { query, response };
