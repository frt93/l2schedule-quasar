/**
 * Компонуем запрос для иподтверждения email адреса пользователя
 *
 * @param {String} key         Ключ подтверждения
 */
const composeMutation = key => {
  return `mutation confirm_email {
    update_user_safety(where: {emailVerification: {_eq: "${key}"}}, _set: {emailVerification: null}) {
      returning {
        user {
          email
        }
      }
    }
  }
  `;
};

/**
 * Обрабатываем полученные в результате запроса данные, добираясь до необходимого уровня вложенности,
 * в котором находится кол-во измененных строк в БД
 *
 * @param {Object} data     Данные, полученные с сервера
 * @return {Integer} raws
 */
const composeResponse = data => {
  const response = data.update_user_safety.returning[0];
  if (response) {
    return response.user.email;
  } else {
    return false;
  }
};

module.exports = { composeMutation, composeResponse };
