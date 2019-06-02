/**
 * Компонуем запрос данных искомого пользователя
 *
 * @param {String} key             Ключ (столбец в базе данных) по которому осуществляется поиск
 * @param {String | Int} value     Значение ключа
 * @todo Дополнить
 */
const composeQuery = (key, value) => {
  let queryHeader;
  // Компонуем шапку запроса в зависимости от поля, по которому ищем пользователя. Поле id требует точного сравнения (_eq) и значения типа int.
  // В остальных случаях значения строкового типа с поиском методом _ilike(точное совпадение строки без учета регистра)
  if (key === 'id') {
    queryHeader = `users(where: {${key}: {_eq: ${value}}})`;
  } else {
    queryHeader = `users(where: {${key}: {_ilike: "${value}"}})`;
  }

  return `query findUser{
  ${queryHeader} {
    id
    username
    email
    password

    metadata{
      createdAt
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
}`;
};

/**
 * Обрабатываем полученные в результате запроса данные, добираясь до необходимого уровня вложенности,
 * в котором непосредственно находится либо искомый пользователь либо пустой объект.
 *
 * Если получаем пользователя - пройдемся через необязательные поля и удалим их их конечного экземпляра
 *
 * @param {Object} data     Данные, полученные с сервера
 * @return {Object} user
 */
const response = data => {
  const user = data.users[0];
  if (user) {
    if (!user.metadata.emailVerification) delete user.metadata.emailVerification;
    if (!user.metadata.newPassword) delete user.metadata.newPassword;
    if (!user.metadata.passwordConfirmation) delete user.metadata.passwordConfirmation;
    if (!user.party) delete user.party;
  }
  return user;
};

module.exports = { composeQuery, response };
