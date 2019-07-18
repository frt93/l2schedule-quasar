const { returningPattern, responsePattern } = require('./partyInstancePattern');
/**
 * Компонуем запрос данных искомой пати
 *
 * @param {String} key             Ключ (столбец в базе данных) по которому осуществляется поиск
 * @param {String | Int} value     Значение ключа
 */
const composeQuery = (key, value) => {
  let queryHeader;
  // Компонуем шапку запроса в зависимости от поля, по которому ищем пати. Поле id требует точного сравнения (_eq) и значения типа int.
  // В остальных случаях значения строкового типа с поиском методом _ilike(точное совпадение строки без учета регистра)
  if (key === 'id') {
    queryHeader = `parties(where: {id: {_eq: ${value}}})`;
  } else {
    queryHeader = `parties(where: {${key}: {_ilike: "${value}"}})`;
  }

  return `query findParty{
  ${queryHeader} {
    ${returningPattern}
  }
}`;
};

/**
 * Обрабатываем полученные в результате запроса данные
 *
 * @param {Object} data     Данные, полученные с сервера
 * @return {Object} party
 */
const response = data => {
  const party = data.parties[0];
  return responsePattern(party);
};

module.exports = { composeQuery, response };
