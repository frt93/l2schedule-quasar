const mutation = `mutation create_user ($users: [users_insert_input!]!) {
  insert_users(objects: $users) {
    returning {
      id
      username
      password
      metadata {
        emailVerification
        createdAt
      }
    }
  }
}`;

/**
 * Компонуем переменную с экземпляром данных пользователя для регистрации
 *
 * @param {Object} user     Регистрационые данные пользователя
 */
const variable = user => {
  return {
    users: user,
  };
};

/**
 * Обрабатываем полученные в результате запроса данные, добираясь до необходимого уровня вложенности,
 * в котором непосредственно находится возвращаемый экземпляр зарегистрированного пользователя
 *
 * @param {Object} data     Данные, полученные с сервера
 * @return {Object} user
 */
const response = data => {
  const user = data.insert_users.returning[0];
  return user;
};

module.exports = { mutation, variable, response };
