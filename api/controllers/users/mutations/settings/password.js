const userInstancePattern = require('../../query/userInstancePattern');
const mutation = `mutation update_settings_password($id: Int, $user: users_set_input) {  
  update_users(where: {id: {_eq: $id}}, _set: $user) {
    returning {
      ${userInstancePattern}
    }
  }
}
`;

/**
 * Компонуем переменную с экземпляром данных пользователя
 *
 * @param {Integer} id       Идентификатор пользователя
 * @param {Object} password  Измененные данные пользователя, требующие сохранения
 */
const variables = (id, password) => {
  return {
    id,
    user: password,
  };
};

/**
 * Обрабатываем полученные в результате запроса данные, добираясь до необходимого уровня вложенности,
 * в котором непосредственно находится возвращаемый экземпляр пользователя с обновленными данными
 *
 * @param {Object} data     Данные, полученные с сервера
 * @return {Object} user
 */
const response = data => {
  const user = data.update_users.returning[0];
  return user;
};

module.exports = { mutation, variables, response };
