const { returningPattern, responsePattern } = require('./userInstancePattern');
/**
 * Компонуем запрос данных искомого пользователя
 *
 * @param {String} key             Ключ (столбец в базе данных) по которому осуществляется поиск
 * @param {String | Int} value     Значение ключа
 * @todo Дополнить
 */
const composeQuery = (key, value) => {
  let queryHeader;
  // Компонуем шапку запроса в зависимости от поля, по которому ищем пользователя. Поле id требует точного сравнения (_eq) и значения типа int.
  // В остальных случаях значения строкового типа с поиском методом _ilike(точное совпадение строки без учета регистра)
  if (key === 'id') {
    queryHeader = `users(where: {${key}: {_eq: ${value}}})`;
  } else {
    queryHeader = `users(where: {${key}: {_ilike: "${value}"}})`;
  }

  return `query findUser{
  ${queryHeader} {
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
