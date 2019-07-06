const userInstancePattern = require('./userInstancePattern');
/**
 * Компонуем запрос данных искомого пользователя
 *
 * @param {String} provider   Название oAuth провайдера, с помощью которого авторизуется пользователь
 * @param {Integer} id        ID его аккаунта в приложении-провайдере
 */
const composeQuery = (provider, id) => {
  return `query find_user{
    users(where: {metadata: {${provider}ID: {_ilike: "${id}"}}}) {
      ${userInstancePattern}
    }
  }`;
};

/**
 * Обрабатываем полученные в результате запроса данные, добираясь до необходимого уровня вложенности,
 * в котором непосредственно находится либо искомый пользователь либо пустой объект.
 *
 * Если получаем пользователя - пройдемся через необязательные поля и удалим их из конечного экземпляра
 *
 * @param {Object} data     Данные, полученные с сервера
 * @return {Object} user
 */
const response = data => {
  const user = data.users[0];

  if (user) {
    // Если email уже подтвержден - удаляем строку из экземпляра пользователя
    if (user.metadata.emailVerification === null) {
      delete user.metadata.emailVerification;
    } else {
      // Если не подтвержден - заменяем сам код подтверждения на значение true
      user.metadata.emailVerification = true;
    }

    if (!user.party) delete user.party;
  }
  return user;
};

module.exports = { composeQuery, response };
