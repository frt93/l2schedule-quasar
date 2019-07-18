/**
 * Компонуем запрос поиска группы с указанным названием
 *
 * @param {String} name      Название пати
 */
const query = name => {
  return `query findGroupByName {
  parties(where: {name: {_ilike: "${name}"}}) {
    name
  }
}`;
};

/**
 * Обрабатываем полученные в результате запроса данные, добираясь до необходимого уровня вложенности,
 * в котором непосредственно находится либо пати с искомым названием либо пустой объект
 *
 * @param {Object} data     Данные, полученные с сервера
 * @return {String} name
 */
const response = data => {
  const party = data.parties;
  return party.length ? party[0].name : null;
};

module.exports = { query, response };
