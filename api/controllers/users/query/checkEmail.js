/**
 * Компонуем запрос поиска пользователя с указанным email адресом
 *
 * @param {String} email     Email адрес
 * @return {String}
 */
const query = email => {
  return `query findByEmail{
  users(where: {email: {_ilike: "${email}"}}) {
    email
  }
}`;
};

/**
 * Обрабатываем полученные в результате запроса данные, добираясь до необходимого уровня вложенности,
 * в котором непосредственно находится либо пользователь с искомым email адресом либо пустой объект
 *
 * @param {Object} data     Данные, полученные с сервера
 * @return {String} email
 */
const response = data => {
  const users = data.users;
  return users.length ? users[0].email : null;
};

module.exports = { query, response };
