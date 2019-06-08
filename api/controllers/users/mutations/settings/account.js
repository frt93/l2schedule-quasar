const mutation = `mutation update_settings_account($id: Int, $payload: users_set_input) {
  update_users(where: {id: {_eq: $id}}, _set: $payload) {
    returning {
      id
      username
      email
      password
      metadata {
        createdAt
        emailVerification
      }
      party {
        name
        leader {
          username
        }
        createdAt
        members {
          username
        }
      }
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
    payload,
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
