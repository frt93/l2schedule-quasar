/**
 * Компонуем запрос поиска пользователя по ключу подтверждения восстановления доступа
 *
 * @param {String} key             Ключ (столбец в базе данных) по которому осуществляется поиск
 */
const composeQuery = key => {
  return `query find_user{
  users(where: {metadata: {repairKey: {_eq: "${key}"}}}) {
    email
  }
}`;
};

/**
 * Обрабатываем полученные в результате запроса данные, добираясь до необходимого уровня вложенности,
 * в котором непосредственно находится либо искомый пользователь либо пустой объект.
 *
 * @param {Object} data     Данные, полученные с сервера
 * @return {Strinmg} email
 */
const composeResponse = data => {
  const user = data.users[0];
  return user ? user.email : null;
};

module.exports = { composeQuery, composeResponse };
