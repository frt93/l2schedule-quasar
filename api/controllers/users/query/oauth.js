const { returningPattern, responsePattern } = require('./userInstancePattern');
/**
 * Компонуем запрос данных искомого пользователя
 *
 * @param {String} providerName   Название oauth провайдера, с помощью которого авторизуется пользователь
 * @param {String} id             ID аккаунта пользователя в приложении oauth провайдера
 */
const composeQuery = (providerName, id) => {
  return `query find_user{
    users(where: {metadata: {${providerName}ID: {_ilike: "${id}"}}}) {
      ${returningPattern}
    }
  }`;
};

/**
 * Обрабатываем полученные в результате запроса данные
 *
 * @param {Object} data     Данные, полученные с сервера
 * @return {Object} user
 */
const response = data => {
  const user = data.users[0];
  return responsePattern(user);
};

module.exports = { composeQuery, response };
