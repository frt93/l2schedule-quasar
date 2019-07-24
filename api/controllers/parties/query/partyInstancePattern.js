/**
 * Шаблон экземпляра пати
 */
const returningPattern = `
id
name
slug
about
createdAt
leader{
  id
  username
  verified
  metadata {
    name
    avatar
  }
}
clan {
  id
  name
  slug
}
members {
  id
  username
  verified
  metadata {
    avatar
    name
  }
}
membersInvitations {
  id
  date
  invitee {
    id
    username
    verified
    metadata {
      avatar
      name
    }
  }
  inviter {
    id
    username
    verified
    metadata {
      avatar
      name
    }
  }
}
clanInvitations {
  date
  clan {
    id
    name
    slug
  }
  inviter {
    id
    username
    verified
    metadata {
      avatar
      name
    }
  }
}
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

    if (!party.clan) {
      delete party.clan;
    }

    if (!party.clanInvitations.legth) {
      delete party.clanInvitations;
    }
  }
  return party;
};

module.exports = { returningPattern, responsePattern };
