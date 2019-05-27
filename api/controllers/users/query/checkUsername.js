const mutation = `query findByUsername ($username: String) {
  users(where: {username: {_ilike: $username}}) {
    username
  }
}`;

const variable = username => {
  return {
    username,
  };
};

const response = data => {
  const users = data.users;
  return users.length ? users[0].username : '';
};

module.exports = { mutation, variable, response };
