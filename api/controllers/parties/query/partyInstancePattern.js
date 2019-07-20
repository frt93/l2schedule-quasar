/**
 * Шаблон экземпляра пользователя
 */
const returningPattern = `
id
name
slug
leader{
  id
  username
  metadata {
    name
    avatar
  }
}
clan {
  id
}
members {
  id
}
membersInvitations {
  id
}
clanInvitations {
  id
}
about
createdAt
`;

/**
 * Обрабатываем полученные в результате запроса данные, добираясь до необходимого уровня вложенности,
 * в котором непосредственно находится либо искомая пати либо пустой объект.
 *
 * Если получаем пользователя - пройдемся через необязательные поля и удалим их из конечного экземпляра
 *
 * @param {Object} data     Данные, полученные с сервера
 * @return {Object} party
 */
const responsePattern = party => {
  if (party) {
    if (party.leader.metadata.name) {
      party.leader.name = party.leader.metadata.name;
    }
    if (party.leader.metadata.avatar) {
      party.leader.avatar = party.leader.metadata.avatar;
    }
    delete party.leader.metadata;
  }
  return party;
};

module.exports = { returningPattern, responsePattern };
