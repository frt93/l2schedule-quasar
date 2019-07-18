const { returningPattern, responsePattern } = require('../query/partyInstancePattern');
const mutation = `mutation create_party ($parties: [parties_insert_input!]!) {
  insert_parties(objects: $parties) {
    returning {
      ${returningPattern} 
    }
  }

}`;

/**
 * Компонуем переменную с экземпляром данных пользователя для регистрации
 *
 * @param {Object} party    Данные создаваемой пати
 */
const variable = party => {
  return {
    parties: party,
  };
};

/**
 * Обрабатываем полученные в результате запроса данные, добираясь до необходимого уровня вложенности,
 * в котором непосредственно находится возвращаемый экземпляр зарегистрированного пользователя
 *
 * @param {Object} data     Данные, полученные с сервера
 * @return {Object} party
 */
const response = data => {
  const party = data.insert_parties.returning[0];
  return responsePattern(party);
};

module.exports = { mutation, variable, response };
