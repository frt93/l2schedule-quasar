/**
 * Компонуем запрос поиска пати с указанным слагом
 *
 * @param {String} slug      Слаг
 */
const query = slug => {
  return `query findGroupBySlug {
  groups(where: {slug: {_ilike: "${slug}"}}) {
    slug
  }
}`;
};

/**
 * Обрабатываем полученные в результате запроса данные, добираясь до необходимого уровня вложенности,
 * в котором непосредственно находится либо пати с искомым слагом либо пустой объект
 *
 * @param {Object} data     Данные, полученные с сервера
 * @return {String} slug
 */
const response = data => {
  const party = data.groups;
  return party.length ? party[0].slug : null;
};

module.exports = { query, response };
