/**
 * Компонуем запрос для изменения метаданных пользователя
 *
 * @param {String} email      Email адрес пользователя, который восстанавливает доступ
 * @param {String } key       Сгенерированный ключ подтверждения
 */
const composeMutation = (email, key) => {
  return `mutation repair_access {
    update_user_metadata(where: {user: {email: {_ilike: "${email}"}}}, _set: {repairKey: "${key}"}) {
      returning {
        user {
          email
        }
      }
    }
}`;
};

/**
 * Обрабатываем полученные в результате запроса данные, добираясь до необходимого уровня вложенности,
 * в котором непосредственно находится возвращаемый экземпляр зарегистрированного пользователя
 *
 * @param {Object} data     Данные, полученные с сервера
 * @return {Object} user
 */
const composeResponse = data => {
  const returning = data.update_user_metadata.returning[0];
  if (returning) {
    return 'success';
  } else {
    return null;
  }
};

module.exports = { composeMutation, composeResponse };
