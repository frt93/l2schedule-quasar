const { GraphQLClient } = require('graphql-request'),
  axios = require('axios'),
  client = new GraphQLClient('http://localhost:8080/v1/graphql', {
    headers: {
      'content-type': 'application/json',
      'x-hasura-admin-secret': 'myadminsecretkey',
    },
  }),
  hasuraAdminSecret = 'myadminsecretkey',
  apiEndpoint = 'http://localhost:8080/v1/query';

axios.defaults.headers.post['Content-Type'] = 'application/json';
axios.defaults.headers.post['X-Hasura-Role'] = 'admin';
axios.defaults.headers.post['x-hasura-admin-secret'] = hasuraAdminSecret;

const GraphQLApi = query => {
  axios
    .post(apiEndpoint, query)
    .then(res => {
      return res;
    })
    .catch(e => {
      return e;
    });
};

module.exports = { GraphQLClient: client, hasuraAdminSecret, apiEndpoint, GraphQLApi };
