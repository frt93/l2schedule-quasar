const mutation = `mutation create_user ($users: [users_insert_input!]!) {
  insert_users(objects: $users) {
    returning {
      id
      username
      password
      metadata {
        emailVerification
      }
    }
  }
}`;

const variable = user => {
  return {
    users: user,
  };
};

const response = data => {
  const user = data.insert_users.returning[0];
  return user;
};

module.exports = { mutation, variable, response };
