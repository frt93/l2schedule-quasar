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
  country
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
