/**
 * Компонуем запрос поиска пользователя по ключу подтверждения восстановления доступа
 *
 * @param {String} key             Ключ (столбец в базе данных) по которому осуществляется поиск
 */
const composeQuery = key => {
  return `query find_user{
  users(where: {safety: {repairKey: {_eq: "${key}"}}}) {
    email
  }
}`;
};

/**
 * Обрабатываем полученные в результате запроса данные, добираясь до необходимого уровня вложенности,
 * в котором должен находится объект пользователя
 *
 * @param {Object} data     Данные, полученные с сервера
 * @return {Strinmg} email
 */
const composeResponse = data => {
  const user = data.users[0];
  return user ? user.email : null;
};

module.exports = { composeQuery, composeResponse };
