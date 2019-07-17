/**
 * Компонуем запрос для изменения пароля пользователя
 *
 * @param {String} email       Email адрес пользователя, который меняет себе пароль
 * @param {String} key         Ключ подтверждения
 * @param {String } password   Новый пароль
 */
const composeMutation = (email, key, password) => {
  return `mutation change_password {
    update_users(where: {email: {_like: "${email}"}, safety: {repairKey: {_eq: "${key}"}}}, _set: {password: "${password}"}) {
      returning {
        email
      }
    }
    update_user_safety(where: {user: {email: {_ilike: "${email}"}}}, _set: {repairKey: null}) {
      returning {
        repairKey
      }
    }
  }
  `;
};

/**
 * Обрабатываем полученные в результате запроса данные, добираясь до необходимого уровня вложенности,
 * в котором непосредственно находится возвращаемый объект пользователя и поле repairKey из таблциы метаданных
 *
 * @param {Object} data     Данные, полученные с сервера
 * @return {Object} user
 */
const composeResponse = data => {
  const user = data.update_users.returning[0];
  const key = data.update_user_safety.returning[0].repairKey;
  if (user && key === null) {
    return true;
  } else {
    return false;
  }
};

module.exports = { composeMutation, composeResponse };
