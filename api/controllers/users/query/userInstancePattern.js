/**
 * Шаблон экземпляра пользователя
 */
const returningPattern = `id
username
email
password
metadata {
  avatar
  emailVerification
  language
  timezone
  country
  createdAt
  googleID
  googleData
  facebookID
  facebookData
  vkID
  vkData
  telegramID
  telegramData
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
}`;

/**
 * Обрабатываем полученные в результате запроса данные, добираясь до необходимого уровня вложенности,
 * в котором непосредственно находится либо искомый пользователь либо пустой объект.
 *
 * Если получаем пользователя - пройдемся через необязательные поля и удалим их из конечного экземпляра
 *
 * @param {Object} data     Данные, полученные с сервера
 * @return {Object} user
 */
const responsePattern = user => {
  if (user) {
    if (!user.party) delete user.party;
    if (!user.email) delete user.email;

    // Если email уже подтвержден - удаляем строку из экземпляра пользователя
    if (user.metadata.emailVerification === null) {
      delete user.metadata.emailVerification;
    } else {
      // Если не подтвержден - заменяем сам код подтверждения на значение true
      user.metadata.emailVerification = true;
    }

    if (user.metadata.avatar === null) {
      delete user.metadata.avatar;
    }
    if (user.metadata.googleID === null) {
      delete user.metadata.googleID;
      delete user.metadata.googleData;
    } else {
      user.metadata.googleData = JSON.parse(user.metadata.googleData);
    }

    if (user.metadata.facebookID === null) {
      delete user.metadata.facebookID;
      delete user.metadata.facebookData;
    } else {
      user.metadata.facebookData = JSON.parse(user.metadata.facebookData);
    }
    if (user.metadata.vkID === null) {
      delete user.metadata.vkID;
      delete user.metadata.vkData;
    } else {
      user.metadata.vkData = JSON.parse(user.metadata.vkData);
    }
    if (user.metadata.telegramID === null) {
      delete user.metadata.telegramID;
      delete user.metadata.telegramData;
    } else {
      user.metadata.telegramData = JSON.parse(user.metadata.telegramData);
    }
  }
  return user;
};

module.exports = { returningPattern, responsePattern };
