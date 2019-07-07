const { returningPattern, responsePattern } = require('./userInstancePattern');
/**
 * Компонуем запрос данных искомого пользователя
 *
 * @param {String} provider   Название oAuth провайдера, с помощью которого авторизуется пользователь
 * @param {Integer} id        ID его аккаунта в приложении-провайдере
 */
const composeQuery = (provider, id) => {
  return `query find_user{
    users(where: {metadata: {${provider}ID: {_ilike: "${id}"}}}) {
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
