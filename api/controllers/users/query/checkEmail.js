const mutation = `query findByEmail ($email: String) {
  users(where: {email: {_ilike: $email}}) {
    email
  }
}`;

const variable = email => {
  return {
    email,
  };
};

const response = data => {
  const users = data.users;
  return users.length ? users[0].email : '';
};

module.exports = { mutation, variable, response };
