const { returningPattern, responsePattern } = require('../../query/userInstancePattern');
const mutation = `mutation update_settings_account($id: Int, $user: users_set_input, $metadata: user_metadata_set_input) {
  update_user_metadata(where: {user_id: {_eq: $id}}, _set: $metadata) {
    affected_rows
  }
  
  update_users(where: {id: {_eq: $id}}, _set: $user) {
    returning {
      ${returningPattern}
    }
  }
}
`;

/**
 * Компонуем переменную с экземпляром данных пользователя
 *
 * @param {Integer} id       Идентификатор пользователя
 * @param {Object} payload   Измененные данные пользователя, требующие сохранения
 */
const variables = (id, payload) => {
  return {
    id,
    user: payload.user,
    metadata: payload.metadata,
  };
};

/**
 * Обрабатываем полученные в результате запроса данные
 *
 * @param {Object} data     Данные, полученные с сервера
 * @return {Object} user
 */
const response = data => {
  const user = data.update_users.returning[0];
  return responsePattern(user);
};

module.exports = { mutation, variables, response };
