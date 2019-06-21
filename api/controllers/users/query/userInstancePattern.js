/**
 * Шаблон экземпляра пользователя
 */
module.exports = `id
username
email
password
metadata {
  emailVerification
  language
  timezone
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
}`;
